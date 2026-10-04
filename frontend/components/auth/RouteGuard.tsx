"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface RouteGuardProps {
  children: React.ReactNode;
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip checks while loading
    if (loading) return;

    // Allow access to login page
    const isLoginPage = pathname === "/login";

    if (!user && !isLoginPage) {
      // User is not authenticated and trying to access protected route
      router.replace("/login");
    } else if (user && isLoginPage) {
      // User is authenticated and on login page, redirect to dashboard
      router.replace("/");
    }
  }, [user, loading, pathname, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Render children once auth is confirmed
  return <>{children}</>;
}
