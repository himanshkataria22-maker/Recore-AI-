"use client";

import React from "react";
import { ToastProvider } from "@/components/ui/ToastContext";

/**
 * Client-side providers wrapper for context providers that need "use client".
 * This allows the root layout to remain a Server Component.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
