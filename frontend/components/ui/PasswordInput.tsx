"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  label?: string;
  error?: string;
  required?: boolean;
  autoComplete?: string;
  className?: string;
  onVisibilityChange?: (isVisible: boolean) => void;
}

export function PasswordInput({
  id,
  name,
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder = "Enter your password",
  label = "Password",
  error,
  required = false,
  autoComplete = "current-password",
  className = "",
  onVisibilityChange,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    const newVisibility = !showPassword;
    setShowPassword(newVisibility);
    if (onVisibilityChange) {
      onVisibilityChange(newVisibility);
    }
  };

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`
            w-full px-4 py-2.5 pr-12
            bg-white dark:bg-slate-900
            border rounded-lg
            text-slate-900 dark:text-slate-100
            placeholder:text-slate-400 dark:placeholder:text-slate-500
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-0
            ${
              error
                ? "border-red-500 focus:ring-red-500/20"
                : "border-slate-300 dark:border-slate-700 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400"
            }
          `}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="
            absolute right-3 top-1/2 -translate-y-1/2
            p-1.5 rounded-md
            text-slate-400 hover:text-slate-600
            dark:text-slate-500 dark:hover:text-slate-300
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500/50
          "
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>
      {error && (
        <p
          id={`${id}-error`}
          className="mt-1.5 text-sm text-red-600 dark:text-red-400"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
}
