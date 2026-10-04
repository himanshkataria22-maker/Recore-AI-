"use client";

import React from "react";
import { ToastProvider } from "@/components/ui/ToastContext";
import { AuthProvider } from "@/contexts/AuthContext";

/**
 * Client-side providers wrapper for context providers that need "use client".
 * This allows the root layout to remain a Server Component.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>{children}</ToastProvider>
    </AuthProvider>
  );
}
