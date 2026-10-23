"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useChat } from "ai/react";
import { ChatMessageItem } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import { ConversationSidebar } from "@/components/chat/conversation-sidebar";
import {
  Sparkles,
  MessageSquare,
  PanelLeftClose,
  PanelLeft,
  Loader2,
  Download,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id");
  const { data: _session, update: updateSession } = useSession();

  const [activeId, setActiveId] = useState<string | null>(initialId);
  const selectedModel = "gpt-4o-mini";
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState<number>(0);

  // Open sidebar by default only on desktop
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      setSidebarOpen(true);
    }
  }, []);
  const [copied, setCopied] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasLoadedInitial = useRef(!initialId);

  

  

  // Handle URL ID syncing, initial load, and browser back/forward buttons
  useEffect(() => {
    if (initialId && !hasLoadedInitial.current) {
      hasLoadedInitial.current = true;
      loadConversation(initialId);
    } else if (initialId && initialId !== activeId) {
      loadConversation(initialId);
    } else if (!initialId && activeId !== null) {
      setActiveId(null);
      setMessages([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialId]);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
    setInput,
    stop,
  } = useChat({
    api: "/api/chat",
    body: {
      conversationId: activeId || undefined,
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate AI response. Please check your OPENAI_API_KEY.");
    },
    onResponse: (response) => {
      const convHeader = response.headers.get("X-Conversation-Id");
      if (convHeader && convHeader !== activeId) {
        setActiveId(convHeader);
        router.replace(`/dashboard/chat?id=${convHeader}`);
        setSidebarRefreshKey((k) => k + 1);
      }
    },
    onFinish: async (message) => {
      setSidebarRefreshKey((k) => k + 1);
      try {
        const res = await fetch("/api/user/profile");
        const json = await res.json();
        if (typeof json?.data?.credits === "number") {
          window.dispatchEvent(
            new CustomEvent("credits-updated", { detail: { credits: json.data.credits } })
          );
        }
      } catch {}
      updateSession();
    },
  });

  const loadConversation = async (id: string) => {
    if (isLoading) {
      stop();
    }
    setActiveId(id);
    router.replace(`/dashboard/chat?id=${id}`);
    setLoadingHistory(true);

    try {
      const res = await fetch(`/api/conversations/${id}`);
      const data = await res.json();

      if (data.success && data.data) {
        const formatted = data.data.messages.map((m: any) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          createdAt: new Date(m.createdAt),
          annotations: m.model ? [{ model: m.model }] : undefined,
        }));
        setMessages(formatted);
      }
    } catch {
      toast.error("Failed to load conversation history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleNewChat = () => {
    if (isLoading) {
      stop();
    }
    setActiveId(null);
    setMessages([]);
    router.replace("/dashboard/chat");
  };

  // Export functions
  const handleExportMarkdown = () => {
    if (messages.length === 0) return;
    let md = `# Conversation Export\n*Generated on ${new Date().toLocaleString()}*\n\n---\n\n`;
    for (const msg of messages) {
      const sender = msg.role === "user" ? "### 👤 User" : `### 🤖 Assistant (${selectedModel})`;
      md += `${sender}\n\n${msg.content}\n\n---\n\n`;
    }
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-export-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Conversation exported as Markdown (.md)");
  };

  const handleExportJSON = () => {
    if (messages.length === 0) return;
    const blob = new Blob([JSON.stringify(messages, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Conversation exported as JSON (.json)");
  };

  const handleCopyChat = async () => {
    if (messages.length === 0) return;
    let text = "";
    for (const msg of messages) {
      const sender = msg.role === "user" ? "User" : "Assistant";
      text += `${sender}:\n${msg.content}\n\n`;
    }
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Conversation copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages, isLoading]);

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm relative">
      {/* Threaded Conversations Sidebar */}
      <ConversationSidebar
        activeId={activeId}
        onSelectConversation={loadConversation}
        onNewChat={handleNewChat}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        refreshTrigger={sidebarRefreshKey}
      />

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              {sidebarOpen ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeft className="h-4 w-4" />
              )}
            </Button>

            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                  AI Chat
                </h1>
                <p className="text-[10px] text-muted-foreground hidden sm:block">
                  Streaming GPT-4o Mini • PostgreSQL database
                </p>
              </div>
            </div>
          </div>

          {/* Model Selector & Actions */}
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 px-2.5 text-xs gap-1.5 rounded-xl border-border">
                    <Download className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 text-xs">
                  <DropdownMenuItem onClick={handleExportMarkdown} className="cursor-pointer gap-2 py-2">
                    <Download className="h-3.5 w-3.5 text-primary" />
                    <span>Download Markdown (.md)</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportJSON} className="cursor-pointer gap-2 py-2">
                    <Download className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Download JSON (.json)</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyChat} className="cursor-pointer gap-2 py-2">
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>Copy to Clipboard</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>AI Connected</span>
            </div>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {loadingHistory ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-muted-foreground gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-xs">Loading conversation history...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center max-w-md mx-auto space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-tr from-violet-600/10 to-cyan-400/10 text-primary ring-8 ring-primary/5">
                <Sparkles className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-bold text-foreground">
                  How can I assist you today?
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Ask any question, draft code, or explore ideas with streaming OpenAI GPT-4o Mini.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setInput("Summarize the key benefits of Auth.js v5 with PostgreSQL in a Next.js 15 app.");
                  }}
                  className="p-2.5 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 text-left text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  💡 Explain Auth.js v5 + Prisma
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInput("Explain the architecture of Next.js 15 App Router streaming chat with Vercel AI SDK.");
                  }}
                  className="p-2.5 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 text-left text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  ⚡ Next.js 15 Streaming Chat
                </button>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const savedModel = (msg.annotations?.[0] as { model?: string })?.model;
              return (
                <ChatMessageItem
                  key={msg.id}
                  role={msg.role as "user" | "assistant" | "system"}
                  content={msg.content}
                  model={msg.role === "assistant" ? (savedModel || selectedModel) : undefined}
                />
              );
            })
          )}

          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex gap-3 py-4 px-4 rounded-2xl bg-card border border-border/60 shadow-sm animate-pulse">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary animate-spin" />
              </div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3 bg-muted rounded w-1/4" />
                <div className="h-3 bg-muted rounded w-3/4" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <ChatInput
          input={input}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onClear={handleNewChat}
          hasMessages={messages.length > 0}
        />
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center text-xs text-muted-foreground">Loading workspace...</div>}>
      <ChatContent />
    </Suspense>
  );
}
