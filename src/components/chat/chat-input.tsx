"use client";

import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Send, Sparkles, RotateCcw } from "lucide-react";

interface ChatInputProps {
  input: string;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  onClear: () => void;
  hasMessages: boolean;
}

export function ChatInput({
  input,
  onInputChange,
  onSubmit,
  isLoading,
  onClear,
  hasMessages,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        onSubmit(e);
      }
    }
  };

  return (
    <div className="w-full border-t border-border/70 bg-background/80 backdrop-blur-xl p-3 sm:p-4">
      <div className="max-w-4xl mx-auto space-y-2">
        {hasMessages && (
          <div className="flex items-center justify-end px-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Clear</span>
            </Button>
          </div>
        )}

        {/* Input Form */}
        <form
          onSubmit={onSubmit}
          className="relative flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/40 transition-all"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={onInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything or write code... (Press Enter to send)"
            rows={1}
            disabled={isLoading}
            className="flex-1 max-h-36 min-h-[44px] resize-none border-0 bg-transparent px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
          />

          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            variant="gradient"
            className="h-10 w-10 shrink-0 rounded-xl shadow-md transition-transform active:scale-95"
            aria-label="Send message"
          >
            {isLoading ? (
              <Sparkles className="h-4 w-4 animate-spin text-white" />
            ) : (
              <Send className="h-4 w-4 text-white" />
            )}
          </Button>
        </form>

        <p className="text-center text-[11px] text-muted-foreground">
          AI-Starter Community connects streaming OpenAI GPT-4o Mini with Auth.js and PostgreSQL.
        </p>
      </div>
    </div>
  );
}
