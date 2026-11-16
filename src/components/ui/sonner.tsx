"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const toastStyle = {
  fontFamily: "inherit",
  "--normal-bg": "hsl(var(--card))",
  "--normal-text": "hsl(var(--foreground))",
  "--normal-border": "hsl(var(--border))",
  "--success-bg": "hsl(var(--card))",
  "--success-text": "hsl(var(--foreground))",
  "--success-border": "hsl(var(--primary))",
  "--error-bg": "hsl(var(--card))",
  "--error-text": "hsl(var(--foreground))",
  "--error-border": "hsl(var(--destructive))",
  "--info-bg": "hsl(var(--card))",
  "--info-text": "hsl(var(--foreground))",
  "--info-border": "hsl(var(--border))",
  "--warning-bg": "hsl(var(--card))",
  "--warning-text": "hsl(var(--foreground))",
  "--warning-border": "hsl(var(--border))",
} as React.CSSProperties;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:text-foreground group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "[--normal-border:var(--success-border)]",
          error: "[--normal-border:var(--error-border)]",
        },
        closeButtonAriaLabel: "Dismiss",
      }}
      {...props}
      style={toastStyle}
      closeButton
    />
  );
};

export { Toaster };
