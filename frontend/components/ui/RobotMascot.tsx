"use client";

import React, { useState, useEffect, useRef } from "react";
import { SpeechBubble } from "./SpeechBubble";

interface RobotMascotProps {
  onEmailFocus?: boolean;
  onPasswordFocus?: boolean;
  passwordVisible?: boolean;
  loginSuccess?: boolean;
  loginFailed?: boolean;
}

export function RobotMascot({
  onEmailFocus = false,
  onPasswordFocus = false,
  passwordVisible = false,
  loginSuccess = false,
  loginFailed = false,
}: RobotMascotProps) {
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [isDrifting, setIsDrifting] = useState(false);
  const lastMouseMoveRef = useRef(Date.now());
  const driftIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const robotRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [headTilt, setHeadTilt] = useState(0);

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

  // Eye tracking with mouse
  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      lastMouseMoveRef.current = Date.now();
      setIsDrifting(false);

      if (robotRef.current) {
        const rect = robotRef.current.getBoundingClientRect();
        const robotCenterX = rect.left + rect.width / 2;
        const robotCenterY = rect.top + rect.height / 2;

        // Calculate distance from robot center
        const deltaX = e.clientX - robotCenterX;
        const deltaY = e.clientY - robotCenterY;

        // Normalize to -1 to 1 range with limited movement
        const maxDistance = 400;
        const normalizedX = Math.max(-1, Math.min(1, deltaX / maxDistance));
        const normalizedY = Math.max(-1, Math.min(1, deltaY / maxDistance));

        // Scale to pupil movement range (max 6px in each direction)
        const eyeX = normalizedX * 6;
        const eyeY = normalizedY * 6;

        setEyePosition({ x: eyeX, y: eyeY });

        // Head tilt follows cursor slightly
        const tiltAngle = normalizedX * 3; // Max 3 degrees
        setHeadTilt(tiltAngle);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [prefersReducedMotion]);

  // Idle detection and eye drifting
  useEffect(() => {
    if (prefersReducedMotion) return;

    const checkIdle = setInterval(() => {
      const timeSinceLastMove = Date.now() - lastMouseMoveRef.current;
      if (timeSinceLastMove > 3000 && !isDrifting) {
        setIsDrifting(true);
      }
    }, 1000);

    return () => clearInterval(checkIdle);
  }, [isDrifting, prefersReducedMotion]);

  // Drift animation
  useEffect(() => {
    if (prefersReducedMotion) return;
    if (!isDrifting) {
      if (driftIntervalRef.current) {
        clearInterval(driftIntervalRef.current);
        driftIntervalRef.current = null;
      }
      return;
    }

    driftIntervalRef.current = setInterval(() => {
      const randomX = (Math.random() - 0.5) * 8;
      const randomY = (Math.random() - 0.5) * 8;
      setEyePosition({ x: randomX, y: randomY });

      const randomTilt = (Math.random() - 0.5) * 4;
      setHeadTilt(randomTilt);
    }, 2000);

    return () => {
      if (driftIntervalRef.current) {
        clearInterval(driftIntervalRef.current);
      }
    };
  }, [isDrifting, prefersReducedMotion]);

  // Random blinking
  useEffect(() => {
    if (prefersReducedMotion) return;

    const scheduleNextBlink = () => {
      const delay = 3000 + Math.random() * 3000; // 3-6 seconds
      return setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          scheduleNextBlink();
        }, 150);
      }, delay);
    };

    const timeoutId = scheduleNextBlink();
    return () => clearTimeout(timeoutId);
  }, [prefersReducedMotion]);

  // Reaction to email focus - look toward the form
  useEffect(() => {
    if (onEmailFocus && !prefersReducedMotion) {
      setEyePosition({ x: 6, y: 0 });
      setHeadTilt(3);
    }
  }, [onEmailFocus, prefersReducedMotion]);

  // Reaction to password focus - cover eyes
  const eyesAreCovered = onPasswordFocus && !passwordVisible;
  const robotIsPeeking = onPasswordFocus && passwordVisible;

  // Get eye shape based on state
  const getEyeShape = () => {
    if (loginSuccess) return "happy"; // Curved happy eyes
    if (loginFailed) return "x"; // X eyes
    if (eyesAreCovered) return "covered";
    if (robotIsPeeking) return "peeking";
    if (isBlinking) return "closed";
    return "normal";
  };

  const eyeShape = getEyeShape();

  const messages = [
    "Hello, developers 👋",
    "Legacy code? Let's modernize it.",
    "I'll prove nothing breaks.",
    "Ready when you are.",
  ];

  return (
    <div
      ref={robotRef}
      className="flex flex-col items-center justify-center h-full relative"
    >
      {/* Speech Bubble */}
      <div className="mb-8 animate-fade-in">
        <SpeechBubble messages={messages} typingSpeed={50} pauseDuration={2000} />
      </div>

      {/* Robot SVG */}
      <div
        className={`relative ${prefersReducedMotion ? "" : "animate-float"}`}
        style={{
          transform: prefersReducedMotion ? "none" : `rotate(${headTilt}deg)`,
          transition: "transform 0.3s ease-out",
        }}
      >
        <svg
          width="280"
          height="320"
          viewBox="0 0 280 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-2xl"
          role="img"
          aria-label="ReCore AI Robot Mascot"
        >
          {/* Antenna */}
          <g id="antenna">
            <line
              x1="140"
              y1="30"
              x2="140"
              y2="60"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              className="text-slate-400 dark:text-slate-500"
            />
            <circle
              cx="140"
              cy="25"
              r="8"
              className={`fill-blue-500 dark:fill-blue-400 ${
                prefersReducedMotion ? "" : "animate-pulse-glow"
              }`}
            />
          </g>

          {/* Robot Head */}
          <g id="head">
            {/* Main head rectangle */}
            <rect
              x="70"
              y="60"
              width="140"
              height="120"
              rx="20"
              className="fill-slate-700 dark:fill-slate-800 stroke-slate-600 dark:stroke-slate-700"
              strokeWidth="3"
            />

            {/* Screen face */}
            <rect
              x="85"
              y="75"
              width="110"
              height="90"
              rx="12"
              className="fill-slate-800 dark:fill-slate-900"
            />

            {/* Left ear panel */}
            <rect
              x="50"
              y="95"
              width="20"
              height="50"
              rx="8"
              className="fill-slate-600 dark:fill-slate-700 stroke-slate-500 dark:stroke-slate-600"
              strokeWidth="2"
            />
            <circle cx="60" cy="110" r="3" className="fill-blue-500 dark:fill-blue-400" />
            <circle cx="60" cy="130" r="3" className="fill-blue-500 dark:fill-blue-400" />

            {/* Right ear panel */}
            <rect
              x="210"
              y="95"
              width="20"
              height="50"
              rx="8"
              className="fill-slate-600 dark:fill-slate-700 stroke-slate-500 dark:stroke-slate-600"
              strokeWidth="2"
            />
            <circle cx="220" cy="110" r="3" className="fill-blue-500 dark:fill-blue-400" />
            <circle cx="220" cy="130" r="3" className="fill-blue-500 dark:fill-blue-400" />

            {/* Eyes */}
            {eyeShape === "normal" && (
              <g id="eyes-normal">
                {/* Left eye */}
                <ellipse
                  cx="115"
                  cy="115"
                  rx="18"
                  ry="20"
                  className="fill-slate-300 dark:fill-slate-700"
                />
                <circle
                  cx={115 + eyePosition.x}
                  cy={115 + eyePosition.y}
                  r="8"
                  className="fill-slate-900 dark:fill-slate-100"
                  style={{ transition: "cx 0.1s ease-out, cy 0.1s ease-out" }}
                />
                
                {/* Right eye */}
                <ellipse
                  cx="165"
                  cy="115"
                  rx="18"
                  ry="20"
                  className="fill-slate-300 dark:fill-slate-700"
                />
                <circle
                  cx={165 + eyePosition.x}
                  cy={115 + eyePosition.y}
                  r="8"
                  className="fill-slate-900 dark:fill-slate-100"
                  style={{ transition: "cx 0.1s ease-out, cy 0.1s ease-out" }}
                />
              </g>
            )}

            {eyeShape === "closed" && (
              <g id="eyes-closed">
                {/* Left eye closed */}
                <line
                  x1="97"
                  y1="115"
                  x2="133"
                  y2="115"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="text-slate-900 dark:text-slate-100"
                />
                {/* Right eye closed */}
                <line
                  x1="147"
                  y1="115"
                  x2="183"
                  y2="115"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="text-slate-900 dark:text-slate-100"
                />
              </g>
            )}

            {eyeShape === "happy" && (
              <g id="eyes-happy">
                {/* Left eye happy curve */}
                <path
                  d="M 97 110 Q 115 125 133 110"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                  className="text-slate-900 dark:text-slate-100"
                />
                {/* Right eye happy curve */}
                <path
                  d="M 147 110 Q 165 125 183 110"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                  className="text-slate-900 dark:text-slate-100"
                />
              </g>
            )}

            {eyeShape === "x" && (
              <g id="eyes-x">
                {/* Left eye X */}
                <line
                  x1="105"
                  y1="105"
                  x2="125"
                  y2="125"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="text-red-500 dark:text-red-400"
                />
                <line
                  x1="125"
                  y1="105"
                  x2="105"
                  y2="125"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="text-red-500 dark:text-red-400"
                />
                {/* Right eye X */}
                <line
                  x1="155"
                  y1="105"
                  x2="175"
                  y2="125"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="text-red-500 dark:text-red-400"
                />
                <line
                  x1="175"
                  y1="105"
                  x2="155"
                  y2="125"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="text-red-500 dark:text-red-400"
                />
              </g>
            )}

            {eyeShape === "covered" && (
              <g id="eyes-covered">
                {/* Hands covering eyes */}
                <rect
                  x="85"
                  y="95"
                  width="110"
                  height="40"
                  rx="8"
                  className="fill-slate-600 dark:fill-slate-700"
                />
                <text
                  x="140"
                  y="120"
                  textAnchor="middle"
                  className="fill-slate-400 dark:fill-slate-500 text-2xl"
                >
                  🙈
                </text>
              </g>
            )}

            {eyeShape === "peeking" && (
              <g id="eyes-peeking">
                {/* Partially open eyes peeking */}
                <ellipse
                  cx="115"
                  cy="115"
                  rx="18"
                  ry="10"
                  className="fill-slate-300 dark:fill-slate-700"
                />
                <circle
                  cx={115 + eyePosition.x / 2}
                  cy={115}
                  r="5"
                  className="fill-slate-900 dark:fill-slate-100"
                />
                <ellipse
                  cx="165"
                  cy="115"
                  rx="18"
                  ry="10"
                  className="fill-slate-300 dark:fill-slate-700"
                />
                <circle
                  cx={165 + eyePosition.x / 2}
                  cy={115}
                  r="5"
                  className="fill-slate-900 dark:fill-slate-100"
                />
              </g>
            )}

            {/* Smile/Mouth indicator line */}
            <line
              x1="120"
              y1="145"
              x2="160"
              y2="145"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              className="text-blue-500 dark:text-blue-400"
            />
          </g>

          {/* Body */}
          <g id="body">
            <rect
              x="85"
              y="190"
              width="110"
              height="100"
              rx="15"
              className="fill-slate-700 dark:fill-slate-800 stroke-slate-600 dark:stroke-slate-700"
              strokeWidth="3"
            />

            {/* Body panel details */}
            <circle cx="140" cy="220" r="12" className="fill-blue-500 dark:fill-blue-400" />
            <rect
              x="110"
              y="245"
              width="60"
              height="6"
              rx="3"
              className="fill-slate-600 dark:fill-slate-700"
            />
            <rect
              x="110"
              y="260"
              width="60"
              height="6"
              rx="3"
              className="fill-slate-600 dark:fill-slate-700"
            />
          </g>

          {/* Arms */}
          <g id="arms">
            {/* Left arm */}
            <rect
              x="50"
              y="200"
              width="35"
              height="60"
              rx="17.5"
              className="fill-slate-600 dark:fill-slate-700 stroke-slate-500 dark:stroke-slate-600"
              strokeWidth="2"
            />
            {/* Right arm */}
            <rect
              x="195"
              y="200"
              width="35"
              height="60"
              rx="17.5"
              className="fill-slate-600 dark:fill-slate-700 stroke-slate-500 dark:stroke-slate-600"
              strokeWidth="2"
            />
          </g>
        </svg>

        {/* Shake animation on login failed */}
        {loginFailed && !prefersReducedMotion && (
          <style jsx>{`
            @keyframes shake {
              0%, 100% { transform: translateX(0) rotate(0deg); }
              25% { transform: translateX(-10px) rotate(-2deg); }
              75% { transform: translateX(10px) rotate(2deg); }
            }
            div > svg {
              animation: shake 0.5s ease-in-out;
            }
          `}</style>
        )}

        {/* Bounce animation on login success */}
        {loginSuccess && !prefersReducedMotion && (
          <style jsx>{`
            @keyframes bounce-success {
              0%, 100% { transform: translateY(0) scale(1); }
              50% { transform: translateY(-20px) scale(1.05); }
            }
            div > svg {
              animation: bounce-success 0.6s ease-in-out;
            }
          `}</style>
        )}
      </div>
    </div>
  );
}
