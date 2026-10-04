"use client";

import React, { useState, useEffect } from "react";

interface SpeechBubbleProps {
  messages: string[];
  typingSpeed?: number;
  pauseDuration?: number;
  className?: string;
}

export function SpeechBubble({
  messages,
  typingSpeed = 50,
  pauseDuration = 2000,
  className = "",
}: SpeechBubbleProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      // Show full message immediately without animation
      setDisplayedText(messages[currentMessageIndex]);
      return;
    }

    const currentMessage = messages[currentMessageIndex];
    let currentIndex = 0;

    // Reset state
    setDisplayedText("");
    setIsTyping(true);
    setIsPaused(false);

    // Typing animation
    const typingInterval = setInterval(() => {
      if (currentIndex < currentMessage.length) {
        setDisplayedText(currentMessage.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        // Finished typing
        clearInterval(typingInterval);
        setIsTyping(false);
        setIsPaused(true);

        // Pause before moving to next message
        setTimeout(() => {
          setIsPaused(false);
          setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
        }, pauseDuration);
      }
    }, typingSpeed);

    return () => clearInterval(typingInterval);
  }, [currentMessageIndex, messages, typingSpeed, pauseDuration]);

  return (
    <div
      className={`
        relative inline-block
        px-6 py-3 max-w-xs
        bg-white dark:bg-slate-800
        border-2 border-slate-200 dark:border-slate-700
        rounded-2xl rounded-bl-sm
        shadow-lg dark:shadow-slate-900/50
        ${className}
      `}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
        {displayedText}
        {isTyping && (
          <span
            className="inline-block w-0.5 h-4 ml-1 bg-blue-500 dark:bg-blue-400 animate-pulse"
            aria-hidden="true"
          />
        )}
      </p>

      {/* Speech bubble tail */}
      <div
        className="
          absolute -bottom-2 left-4
          w-4 h-4
          bg-white dark:bg-slate-800
          border-l-2 border-b-2 border-slate-200 dark:border-slate-700
          transform rotate-[-45deg]
        "
        aria-hidden="true"
      />
    </div>
  );
}
