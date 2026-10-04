"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load theme from localStorage first
    const savedTheme = localStorage.getItem("recore-theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Default to dark
      applyTheme("dark");
    }
    setMounted(true);
  }, []);

  const applyTheme = (newTheme: "light" | "dark") => {
    const html = document.documentElement;
    if (newTheme === "light") {
      html.classList.remove("dark");
      html.classList.add("light");
      html.style.colorScheme = "light";
    } else {
      html.classList.remove("light");
      html.classList.add("dark");
      html.style.colorScheme = "dark";
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("recore-theme", newTheme);
    applyTheme(newTheme);
  };

  if (!mounted) {
    return <div className="w-9 h-9" />; // Placeholder to prevent layout shift
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg transition-all hover:bg-slate-800/50 dark:hover:bg-slate-800/50 group relative"
      title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <div className="relative w-5 h-5">
        {theme === "dark" ? (
          <Sun className="w-5 h-5 text-slate-400 group-hover:text-amber-400 group-hover:rotate-90 transition-all duration-300" />
        ) : (
          <Moon className="w-5 h-5 text-slate-600 group-hover:text-indigo-600 group-hover:-rotate-12 transition-all duration-300" />
        )}
      </div>
    </button>
  );
}
