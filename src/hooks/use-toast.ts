"use client";

import { useCallback } from "react";

type ToastVariant = "default" | "success" | "error" | "destructive";

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

export function useToast() {
  const toast = useCallback(({ title, description, variant = "default" }: ToastOptions) => {
    // Map "destructive" to "error" for compatibility with shadcn/ui
    const mappedVariant = variant === "destructive" ? "error" : variant;
    
    // Use window.toast if available (set by Toaster component)
    if (typeof window !== "undefined" && (window as any).toast) {
      (window as any).toast({
        title,
        description,
        variant: mappedVariant,
      });
    } else {
      // Fallback to console if toast is not available
      console.log(`Toast: ${title}`, description || "");
    }
  }, []);

  return {
    toast,
  };
}

