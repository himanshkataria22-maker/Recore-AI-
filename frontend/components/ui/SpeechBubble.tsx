"use client";

import React, { useState, useEffect } from "react";

interface SpeechBubbleProps {
  messages?: string[];
  typingSpeed?: number;
  pauseDuration?: number;
  className?: string;
}

const DEFAULT_MESSAGES = [
  "Hello, developers 👋",
  "Ready to modernize legacy code?",
  "Let's refactor something great ✨",
  "Zero functional regression guaranteed ⚡",
];

export function SpeechBubble({
  messages = DEFAULT_MESSAGES,
  typingSpeed = 45,
  pauseDuration = 2800,
  className = "",
}: SpeechBubbleProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setDisplayedText(messages[currentMessageIndex]);
      return;
    }

    const currentMessage = messages[currentMessageIndex];
    let currentIndex = 0;

    setDisplayedText("");
    setIsTyping(true);

    const typingInterval = setInterval(() => {
      if (currentIndex < currentMessage.length) {
        setDisplayedText(currentMessage.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);

        setTimeout(() => {
          setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
        }, pauseDuration);
      }
    }, typingSpeed);

    return () => clearInterval(typingInterval);
  }, [currentMessageIndex, messages, typingSpeed, pauseDuration]);

  // Helper to render text with animated waving hand emoji 👋
  const renderFormattedText = (text: string) => {
    if (text.includes("👋")) {
      const parts = text.split("👋");
      return (
        <>
          {parts[0]}
          <span className="inline-block animate-wave-hand ml-1 origin-bottom-right">
            👋
          </span>
          {parts[1]}
        </>
      );
    }
    return text;
  };

  return (
    <div className="relative flex flex-col items-center select-none animate-bubble-pop">
      <div className="animate-bubble-bob">
        <div
          className={`
            relative inline-flex items-center justify-center
            px-5 py-2.5 min-w-[210px] max-w-xs
            bg-white dark:bg-slate-800
            border border-slate-200/90 dark:border-slate-700/80
            rounded-2xl
            shadow-xl shadow-slate-300/40 dark:shadow-slate-950/60
            transition-all duration-300
            ${className}
          `}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <p className="text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100 flex items-center justify-center whitespace-nowrap">
            <span>{renderFormattedText(displayedText)}</span>
            {isTyping && (
              <span
                className="inline-block w-1 h-4 bg-blue-500 dark:bg-blue-400 animate-pulse rounded-full ml-1"
                aria-hidden="true"
              />
            )}
          </p>

          {/* Speech bubble centered tail pointing down */}
          <div
            className="
              absolute -bottom-2 left-1/2 -translate-x-1/2
              w-3.5 h-3.5
              bg-white dark:bg-slate-800
              border-r border-b border-slate-200/90 dark:border-slate-700/80
              transform rotate-[45deg]
            "
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}
