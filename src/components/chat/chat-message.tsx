"use client";

import React, { useState } from "react";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant" | "system";
  content: string;
}

export function ChatMessageItem({ role, content }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = role === "user";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "flex gap-3.5 py-4 px-3 sm:px-4",
        isUser ? "ml-auto max-w-[88%] sm:max-w-[78%] bg-muted" : "w-full border border-border bg-card"
      )}
    >
      {/* Avatar */}
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback
          className={cn(
            "text-xs font-semibold",
            isUser ? "bg-secondary text-foreground" : "bg-primary text-primary-foreground"
          )}
        >
          {isUser ? <User className="h-4 w-4" /> : <span className="font-mono">AI</span>}
        </AvatarFallback>
      </Avatar>

      {/* Message Body */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-foreground">
              {isUser ? "You" : "AI Assistant"}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="h-6 w-6 text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100"
            title="Copy message"
          >
            {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>

        <div className="text-sm text-foreground break-words overflow-hidden">
          {isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
          ) : (
            <MarkdownRenderer content={content} />
          )}
        </div>
      </div>
    </div>
  );
}
