"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastProps {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "error";
  onClose: (id: string) => void;
}

export function Toast({ id, title, description, variant = "default", onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [id, onClose]);

  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-lg border p-4 shadow-lg",
        variant === "success" && "border-green-200 bg-green-50",
        variant === "error" && "border-red-200 bg-red-50",
        variant === "default" && "border-gray-200 bg-white"
      )}
    >
      <div className="flex-1">
        <div className={cn(
          "font-semibold",
          variant === "success" && "text-green-800",
          variant === "error" && "text-red-800",
          variant === "default" && "text-gray-800"
        )}>
          {title}
        </div>
        {description && (
          <div className={cn(
            "text-sm mt-1",
            variant === "success" && "text-green-700",
            variant === "error" && "text-red-700",
            variant === "default" && "text-gray-700"
          )}>
            {description}
          </div>
        )}
      </div>
      <button
        onClick={() => onClose(id)}
        className={cn(
          "rounded-md p-1 hover:bg-gray-100",
          variant === "success" && "hover:bg-green-100",
          variant === "error" && "hover:bg-red-100"
        )}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function Toaster() {
  const [toasts, setToasts] = React.useState<Array<{
    id: string;
    title: string;
    description?: string;
    variant?: "default" | "success" | "error";
  }>>([]);

  const addToast = React.useCallback((toast: {
    title: string;
    description?: string;
    variant?: "default" | "success" | "error";
  }) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  React.useEffect(() => {
    (window as any).toast = addToast;
    return () => {
      delete (window as any).toast;
    };
  }, [addToast]);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-96">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={removeToast}
        />
      ))}
    </div>
  );
}

