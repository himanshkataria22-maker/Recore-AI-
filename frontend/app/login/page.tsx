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
    setTimeout(() => setLoginSuccess(false), 1000);
  };

  const handleLoginFailed = () => {
    setLoginFailed(true);
    setTimeout(() => setLoginFailed(false), 500);
  };

  return (
    <div className="min-h-screen w-full overflow-hidden relative bg-white dark:bg-slate-950">
      {/* Theme Toggle - Top Right Corner */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Desktop & Tablet Layout (>= 1024px) */}
      <div className="hidden lg:flex h-screen">
        {/* Left Half - Robot Scene */}
        <div className="relative w-1/2 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden">
          {/* Animated Background Grid */}
          {!prefersReducedMotion && (
            <>
              <div className="absolute inset-0 bg-grid-pattern opacity-40 dark:opacity-10"></div>
              
              {/* Floating Code Particles */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute text-3xl text-blue-300/40 dark:text-blue-400/20 animate-float-particle"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${100 + Math.random() * 20}%`,
                      animationDelay: `${i * 1.5}s`,
                      animationDuration: `${15 + Math.random() * 5}s`,
                    }}
                  >
                    {["{", "}", "<", "/>", ";", "=>"][Math.floor(Math.random() * 6)]}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Robot Mascot */}
          <div className="relative z-10 h-full">
            <RobotMascot
              onEmailFocus={emailFocused}
              onPasswordFocus={passwordFocused}
              passwordVisible={passwordVisible}
              loginSuccess={loginSuccess}
              loginFailed={loginFailed}
            />
          </div>
        </div>

        {/* Right Half - Form */}
        <div className="w-1/2 flex items-center justify-center bg-white dark:bg-slate-950 overflow-y-auto">
          <div className="w-full py-12">
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

      {/* Mobile & Small Tablet Layout (< 1024px) */}
      <div className="lg:hidden min-h-screen flex flex-col">
        {/* Top - Robot Header (smaller, about 220px) */}
        <div className="relative h-[220px] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden">
          {/* Animated Background (reduced for mobile) */}
          {!prefersReducedMotion && (
            <>
              <div className="absolute inset-0 bg-grid-pattern opacity-40 dark:opacity-10"></div>
              
              {/* Fewer particles on mobile for performance */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute text-2xl text-blue-300/40 dark:text-blue-400/20 animate-float-particle"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${100 + Math.random() * 20}%`,
                      animationDelay: `${i * 2}s`,
                      animationDuration: `${15 + Math.random() * 5}s`,
                    }}
                  >
                    {["{", "}", "<", "/>"][Math.floor(Math.random() * 4)]}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Smaller Robot for Mobile */}
          <div className="relative z-10 h-full scale-50 origin-center">
            <RobotMascot
              onEmailFocus={emailFocused}
              onPasswordFocus={passwordFocused}
              passwordVisible={passwordVisible}
              loginSuccess={loginSuccess}
              loginFailed={loginFailed}
            />
          </div>
        </div>

        {/* Bottom - Form */}
        <div className="flex-1 bg-white dark:bg-slate-950 overflow-y-auto">
          <div className="py-8">
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

      {/* Background Grid Pattern CSS */}
      <style jsx>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(59, 130, 246, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.15) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        html.dark .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
        }
      `}</style>
    </div>
  );
}

