"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PasswordInput } from "./PasswordInput";
import { isValidEmail, isValidPassword } from "@/lib/auth";
import { Loader2, X } from "lucide-react";

interface AuthCardProps {
  onEmailFocus?: (focused: boolean) => void;
  onPasswordFocus?: (focused: boolean) => void;
  onPasswordVisibilityChange?: (visible: boolean) => void;
  onLoginSuccess?: () => void;
  onLoginFailed?: () => void;
}

export function AuthCard({
  onEmailFocus,
  onPasswordFocus,
  onPasswordVisibilityChange,
  onLoginSuccess,
  onLoginFailed,
}: AuthCardProps) {
  const { login, signup, loginAsDemo } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    rememberMe: false,
  });

  // Error state
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    general: "",
  });

  const resetErrors = () => {
    setErrors({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      general: "",
    });
  };

  const validateForm = (): boolean => {
    const newErrors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      general: "",
    };

    let isValid = true;

    // Name validation (only for signup)
    if (mode === "signup" && !formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (!isValidPassword(formData.password)) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    // Confirm password validation (only for signup)
    if (mode === "signup") {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
        isValid = false;
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetErrors();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      let result;
      if (mode === "signin") {
        result = await login({
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe,
        });
      } else {
        result = await signup({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          rememberMe: formData.rememberMe,
        });
      }

      if (result.success) {
        if (onLoginSuccess) onLoginSuccess();
      } else {
        if (onLoginFailed) onLoginFailed();
        setErrors((prev) => ({ ...prev, general: result.error || "Authentication failed" }));
      }
    } catch (error) {
      if (onLoginFailed) onLoginFailed();
      setErrors((prev) => ({
        ...prev,
        general: "An unexpected error occurred. Please try again.",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      await loginAsDemo();
      if (onLoginSuccess) onLoginSuccess();
    } catch (error) {
      if (onLoginFailed) onLoginFailed();
      setErrors((prev) => ({
        ...prev,
        general: "Demo login failed. Please try again.",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode((prev) => (prev === "signin" ? "signup" : "signin"));
    resetErrors();
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      rememberMe: false,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error for this field
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <>
      <div className="w-full max-w-md mx-auto px-6">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">R</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            ReCore AI
          </h1>
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {mode === "signin"
              ? "Sign in to continue modernizing your code"
              : "Join us to modernize your legacy code"}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* General Error */}
            {errors.general && (
              <div
                className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                role="alert"
                aria-live="assertive"
              >
                <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
              </div>
            )}

            {/* Name Field (Signup only) */}
            {mode === "signup" && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                  aria-invalid={errors.name ? "true" : "false"}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  className={`
                    w-full px-4 py-2.5
                    bg-white dark:bg-slate-900
                    border rounded-lg
                    text-slate-900 dark:text-slate-100
                    placeholder:text-slate-400 dark:placeholder:text-slate-500
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-offset-0
                    ${
                      errors.name
                        ? "border-red-500 focus:ring-red-500/20"
                        : "border-slate-300 dark:border-slate-700 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400"
                    }
                  `}
                />
                {errors.name && (
                  <p
                    id="name-error"
                    className="mt-1.5 text-sm text-red-600 dark:text-red-400"
                    role="alert"
                  >
                    {errors.name}
                  </p>
                )}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onFocus={() => onEmailFocus?.(true)}
                onBlur={() => onEmailFocus?.(false)}
                placeholder="you@company.com"
                autoComplete="email"
                required
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby={errors.email ? "email-error" : undefined}
                className={`
                  w-full px-4 py-2.5
                  bg-white dark:bg-slate-900
                  border rounded-lg
                  text-slate-900 dark:text-slate-100
                  placeholder:text-slate-400 dark:placeholder:text-slate-500
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-offset-0
                  ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500/20"
                      : "border-slate-300 dark:border-slate-700 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400"
                  }
                `}
              />
              {errors.email && (
                <p
                  id="email-error"
                  className="mt-1.5 text-sm text-red-600 dark:text-red-400"
                  role="alert"
                >
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <PasswordInput
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              onFocus={() => onPasswordFocus?.(true)}
              onBlur={() => onPasswordFocus?.(false)}
              onVisibilityChange={onPasswordVisibilityChange}
              placeholder="Enter your password"
              label="Password"
              error={errors.password}
              required
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />

            {/* Confirm Password Field (Signup only) */}
            {mode === "signup" && (
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                label="Confirm Password"
                error={errors.confirmPassword}
                required
                autoComplete="new-password"
              />
            )}

            {/* Remember Me & Forgot Password */}
            {mode === "signin" && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <span className="ml-2 text-slate-600 dark:text-slate-400">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded px-1"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="
                w-full py-3 px-4
                bg-gradient-to-r from-blue-500 to-indigo-600
                hover:from-blue-600 hover:to-indigo-700
                text-white font-semibold rounded-lg
                shadow-lg shadow-blue-500/30
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 dark:focus:ring-offset-slate-900
              "
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {mode === "signin" ? "Signing in..." : "Creating account..."}
                </span>
              ) : mode === "signin" ? (
                "Log in"
              ) : (
                "Create account"
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                  Or
                </span>
              </div>
            </div>

            {/* Demo User Button */}
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="
                w-full py-3 px-4
                bg-emerald-500 hover:bg-emerald-600
                text-white font-semibold rounded-lg
                shadow-lg shadow-emerald-500/30
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 dark:focus:ring-offset-slate-900
              "
            >
              Continue as Demo User
            </button>

            {/* GitHub Button (Mock) */}
            <button
              type="button"
              disabled={isLoading}
              className="
                w-full py-3 px-4
                bg-slate-800 dark:bg-slate-700
                hover:bg-slate-900 dark:hover:bg-slate-600
                text-white font-semibold rounded-lg
                shadow-lg
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:ring-offset-2 dark:focus:ring-offset-slate-900
                flex items-center justify-center
              "
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              Continue with GitHub
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 text-center text-sm">
            <span className="text-slate-600 dark:text-slate-400">
              {mode === "signin" ? "Don't have an account?" : "Already have an account?"}
            </span>
            <button
              type="button"
              onClick={toggleMode}
              disabled={isLoading}
              className="ml-2 text-blue-600 dark:text-blue-400 font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded px-1"
            >
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowForgotPassword(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="forgot-password-title"
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                id="forgot-password-title"
                className="text-xl font-semibold text-slate-900 dark:text-slate-100"
              >
                Forgot Password
              </h3>
              <button
                onClick={() => setShowForgotPassword(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              This is a demo application. Password reset functionality is not implemented.
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mb-6">
              To test the app, you can use any valid email format with a password of 8+ characters,
              or click the "Continue as Demo User" button.
            </p>
            <button
              onClick={() => setShowForgotPassword(false)}
              className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
