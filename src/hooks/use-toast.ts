"use client";

import { useCallback } from "react";

export type ToastVariant = "default" | "success" | "error" | "destructive";

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

declare global {
  interface Window {
    toast?: (options: Omit<ToastOptions, "variant"> & { variant?: Exclude<ToastVariant, "destructive"> }) => void;
  }
}

export function useToast() {
  const toast = useCallback(
    ({ title, description, variant = "default" }: ToastOptions) => {
      const mappedVariant = variant === "destructive" ? "error" : variant;

      if (typeof window !== "undefined" && window.toast) {
        window.toast({
          title,
          description,
          variant: mappedVariant,
        });
      } else {
        console.log(`Toast: ${title}`, description || "");
      }
    },
    []
  );

  return { toast };
}

