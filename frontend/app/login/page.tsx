"use client";

import React, { useState, useEffect } from "react";
import { RobotMascot } from "@/components/ui/RobotMascot";
import { AuthCard } from "@/components/ui/AuthCard";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function LoginPage() {
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loginFailed, setLoginFailed] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, []);

  const handleLoginSuccess = () => {
    setLoginSuccess(true);
    setTimeout(() => setLoginSuccess(false), 1200);
  };

  const handleLoginFailed = () => {
    setLoginFailed(true);
    setTimeout(() => setLoginFailed(false), 600);
  };

  return (
    <div className="min-h-screen w-full relative bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Theme Toggle - Fixed Top Right (never overlaps title) */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Main Split Layout Container */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-screen">
        {/* Left Half - Robot Illustration Scene (lg screens >= 1024px) */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/70 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex-col items-center justify-center p-8 overflow-hidden min-h-screen sticky top-0 h-screen select-none border-r border-slate-200/80 dark:border-slate-800/80">
          {/* Background Grid & Particles */}
          {!prefersReducedMotion && (
            <>
              <div className="absolute inset-0 bg-grid-pattern opacity-40 dark:opacity-10 pointer-events-none" />

              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute text-2xl font-mono text-blue-400/30 dark:text-blue-400/20 animate-float-particle"
                    style={{
                      left: `${10 + (i * 9)}%`,
                      top: `${90 + (i * 2)}%`,
                      animationDelay: `${i * 1.4}s`,
                      animationDuration: `${14 + (i % 3) * 3}s`,
                    }}
                  >
                    {["{", "}", "<", "/>", ";", "=>", "AST"][i % 7]}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Interactive Robot Mascot */}
          <div className="relative z-10 w-full max-w-lg flex items-center justify-center">
            <RobotMascot
              onEmailFocus={emailFocused}
              onPasswordFocus={passwordFocused}
              passwordVisible={passwordVisible}
              loginSuccess={loginSuccess}
              loginFailed={loginFailed}
            />
          </div>
        </div>

        {/* Right Half - Auth Form (Vertically centered, unclipped, scrollable if needed) */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-12 bg-white dark:bg-slate-950 min-h-screen overflow-y-auto">
          {/* Mobile Mascot Header (< 1024px) */}
          <div className="lg:hidden mb-6 flex flex-col items-center justify-center w-full">
            <div className="scale-75 origin-center -mb-6">
              <RobotMascot
                onEmailFocus={emailFocused}
                onPasswordFocus={passwordFocused}
                passwordVisible={passwordVisible}
                loginSuccess={loginSuccess}
                loginFailed={loginFailed}
              />
            </div>
          </div>

          <div className="w-full max-w-md my-auto">
            <AuthCard
              onEmailFocus={setEmailFocused}
              onPasswordFocus={setPasswordFocused}
              onPasswordVisibilityChange={setPasswordVisible}
              onLoginSuccess={handleLoginSuccess}
              onLoginFailed={handleLoginFailed}
            />
          </div>
        </div>
      </div>

      {/* Grid Pattern CSS */}
      <style jsx>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(59, 130, 246, 0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.12) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        html.dark .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(59, 130, 246, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.08) 1px, transparent 1px);
        }
      `}</style>
    </div>
  );
}

