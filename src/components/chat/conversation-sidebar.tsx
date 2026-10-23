"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Plus,
  Trash2,
  Search,
  Sparkles,
  Loader2,
  Clock,
  X,
} from "lucide-react";
import { toast } from "sonner";

export interface ConversationItem {
  id: string;
  title: string;
  model: string;
  messageCount: number;
  lastMessage?: { content: string; role: string; createdAt: string } | null;
  createdAt: string;
  updatedAt: string;
}

interface ConversationSidebarProps {
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onToggle: () => void;
  refreshTrigger?: number;
}

export function ConversationSidebar({
  activeId,
  onSelectConversation,
  onNewChat,
  isOpen,
  onToggle,
  refreshTrigger = 0,
}: ConversationSidebarProps) {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchConversations = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);

    try {
      const res = await fetch(`/api/conversations?page=${pageNum}&limit=15`);
      const data = await res.json();

      if (data.success && data.data) {
        if (append) {
          setConversations((prev) => {
            const existingIds = new Set(prev.map((c) => c.id));
            const newItems = data.data.conversations.filter((c: any) => !existingIds.has(c.id));
            return [...prev, ...newItems];
          });
        } else {
          setConversations(data.data.conversations);
        }
        setPage(data.data.pagination.page);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch {
      // silent fail on network error
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Fetch on mount and whenever refreshTrigger updates
  useEffect(() => {
    fetchConversations(1, false);
  }, [refreshTrigger, fetchConversations]);

  // Infinite Scroll Handler
  const handleScroll = () => {
    if (!scrollContainerRef.current || loading || loadingMore) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    if (scrollHeight - scrollTop - clientHeight < 60 && page < totalPages) {
      fetchConversations(page + 1, true);
    }
  };

  const handleSelect = (id: string) => {
    onSelectConversation(id);
    // On mobile screens, automatically close the drawer when a chat is selected
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      onToggle();
    }
  };

  const handleCreateNew = () => {
    onNewChat();
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      onToggle();
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);

    try {
      const res = await fetch(`/api/conversations/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        setConversations((prev) => prev.filter((c) => c.id !== id));
        toast.success("Conversation deleted");
        if (activeId === id) {
          onNewChat();
        }
      } else {
        toast.error("Failed to delete conversation");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Mobile Backdrop Blur Overlay */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar / Mobile Floating Drawer */}
      <div
        className={`absolute inset-y-0 left-0 z-50 flex flex-col border-r border-border/70 bg-card md:bg-muted/10 h-full w-72 md:w-64 lg:w-72 md:static md:z-auto transition-transform md:transition-all duration-300 shadow-2xl md:shadow-none ${
          isOpen
            ? "translate-x-0 md:w-64 lg:w-72"
            : "-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden md:border-none"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-3.5 border-b border-border/60 space-y-2.5">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleCreateNew}
              variant="gradient"
              size="sm"
              className="flex-1 justify-start gap-2 shadow-sm font-medium text-xs h-8"
            >
              <Plus className="h-4 w-4" />
              <span>New Chat</span>
            </Button>

            {/* Close button for mobile drawer */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-8 w-8 md:hidden text-muted-foreground hover:text-foreground shrink-0"
              title="Close history"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="pl-8 h-8 text-xs bg-background/60"
            />
          </div>
        </div>

        {/* Conversation List with Infinite Scroll */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-2 space-y-1"
        >
          {loading && conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-xs">Loading history...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 px-4 text-muted-foreground">
              <MessageSquare className="h-6 w-6 mx-auto mb-2 opacity-40" />
              <p className="text-xs">No conversations found</p>
            </div>
          ) : (
            filtered.map((conv) => {
              const isActive = activeId === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => handleSelect(conv.id)}
                  className={`group relative flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all text-left ${
                    isActive
                      ? "bg-primary/10 text-primary font-semibold shadow-xs border border-primary/20"
                      : "hover:bg-muted/40 text-foreground/80 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                    <MessageSquare
                      className={`h-4 w-4 shrink-0 ${
                        isActive ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs truncate">{conv.title}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                        <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 uppercase font-mono">
                          GPT-4o Mini
                        </Badge>
                        <span>•</span>
                        <span>{conv.messageCount} msgs</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => handleDelete(e, conv.id)}
                    disabled={deletingId === conv.id}
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 hover:text-rose-500 transition-opacity shrink-0"
                  >
                    {deletingId === conv.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              );
            })
          )}

          {/* Loading Indicator for Infinite Scroll */}
          {loadingMore && (
            <div className="flex items-center justify-center py-2 text-xs text-muted-foreground gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
              <span>Loading more...</span>
            </div>
          )}

          {/* Fallback Manual Button */}
          {!loadingMore && page < totalPages && (
            <div className="pt-2 px-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchConversations(page + 1, true)}
                className="w-full text-xs h-7 gap-1"
              >
                <Clock className="h-3 w-3" />
                <span>Load older chats</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
