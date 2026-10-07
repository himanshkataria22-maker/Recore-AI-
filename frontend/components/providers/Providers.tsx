"use client";

import React from "react";
import { ToastProvider } from "@/components/ui/ToastContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProjectProvider } from "@/contexts/ProjectContext";

/**
 * Client-side providers wrapper for context providers that need "use client".
 * This allows the root layout to remain a Server Component.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProjectProvider>
        <ToastProvider>{children}</ToastProvider>
      </ProjectProvider>
    </AuthProvider>
  );
}
