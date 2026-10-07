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

        const deltaX = e.clientX - robotCenterX;
        const deltaY = e.clientY - robotCenterY;

        const maxDistance = 400;
        const normalizedX = Math.max(-1, Math.min(1, deltaX / maxDistance));
        const normalizedY = Math.max(-1, Math.min(1, deltaY / maxDistance));

        const eyeX = normalizedX * 7;
        const eyeY = normalizedY * 6;

        setEyePosition({ x: eyeX, y: eyeY });

        const tiltAngle = normalizedX * 3;
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
      const delay = 3000 + Math.random() * 3000;
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

  // Reaction to email focus - look toward form
  useEffect(() => {
    if (onEmailFocus && !prefersReducedMotion) {
      setEyePosition({ x: 7, y: 5 });
      setHeadTilt(3);
    }
  }, [onEmailFocus, prefersReducedMotion]);

  const eyesAreCovered = onPasswordFocus && !passwordVisible;
  const robotIsPeeking = onPasswordFocus && passwordVisible;

  const getEyeShape = () => {
    if (loginSuccess) return "happy";
    if (loginFailed) return "x";
    if (eyesAreCovered) return "covered";
    if (robotIsPeeking) return "peeking";
    if (isBlinking) return "closed";
    return "normal";
  };

  const eyeShape = getEyeShape();

  return (
    <div
      ref={robotRef}
      className="flex flex-col items-center justify-center relative select-none group cursor-pointer"
    >
      {/* Speech Bubble */}
      <div className="mb-6">
        <SpeechBubble />
      </div>

      {/* Robot SVG & Float Wrapper */}
      <div
        className={`relative flex flex-col items-center transition-transform duration-300 group-hover:scale-[1.03] ${
          prefersReducedMotion
            ? ""
            : loginFailed
            ? "animate-[head-shake_0.5s_ease-in-out]"
            : loginSuccess
            ? "animate-[happy-jump_0.6s_ease-in-out]"
            : "animate-float-robot"
        }`}
        style={{
          transform: prefersReducedMotion ? "none" : `rotate(${headTilt}deg)`,
          transition: "transform 0.3s ease-out",
        }}
      >
        <svg
          width="280"
          height="310"
          viewBox="0 0 280 310"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-2xl overflow-visible"
          role="img"
          aria-label="ReCore AI Robot Mascot"
        >
          {/* Antenna */}
          <g id="antenna" className={prefersReducedMotion ? "" : "animate-antenna-wiggle"}>
            <line
              x1="140"
              y1="18"
              x2="140"
              y2="55"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              className="text-slate-400 dark:text-slate-500"
            />
            <circle
              cx="140"
              cy="16"
              r="9"
              className={`fill-blue-500 dark:fill-blue-400 ${
                prefersReducedMotion ? "" : "animate-pulse-glow"
              }`}
            />
          </g>

          {/* Robot Head */}
          <g id="head">
            <rect
              x="65"
              y="55"
              width="150"
              height="130"
              rx="28"
              className="fill-[#334155] dark:fill-[#1e293b] stroke-[#475569] dark:stroke-[#334155]"
              strokeWidth="4"
            />

            <rect
              x="82"
              y="72"
              width="116"
              height="96"
              rx="18"
              className="fill-[#0f172a] dark:fill-[#090d16]"
            />

            {/* Left ear panel */}
            <rect
              x="42"
              y="92"
              width="22"
              height="56"
              rx="11"
              className="fill-[#334155] dark:fill-[#1e293b] stroke-[#475569] dark:stroke-[#334155]"
              strokeWidth="3"
            />
            <circle cx="53" cy="108" r="3.5" className="fill-blue-400 dark:fill-blue-400" />
            <circle cx="53" cy="132" r="3.5" className="fill-blue-400 dark:fill-blue-400" />

            {/* Right ear panel */}
            <rect
              x="216"
              y="92"
              width="22"
              height="56"
              rx="11"
              className="fill-[#334155] dark:fill-[#1e293b] stroke-[#475569] dark:stroke-[#334155]"
              strokeWidth="3"
            />
            <circle cx="227" cy="108" r="3.5" className="fill-blue-400 dark:fill-blue-400" />
            <circle cx="227" cy="132" r="3.5" className="fill-blue-400 dark:fill-blue-400" />

            {/* Eyes */}
            {eyeShape === "normal" && (
              <g id="eyes-normal">
                <ellipse
                  cx="112"
                  cy="114"
                  rx="20"
                  ry="22"
                  className="fill-[#cbd5e1] dark:fill-[#475569]"
                />
                <circle
                  cx={112 + eyePosition.x}
                  cy={114 + eyePosition.y}
                  r="9"
                  className="fill-[#0f172a] dark:fill-[#f8fafc]"
                  style={{ transition: "cx 0.1s ease-out, cy 0.1s ease-out" }}
                />
                
                <ellipse
                  cx="168"
                  cy="114"
                  rx="20"
                  ry="22"
                  className="fill-[#cbd5e1] dark:fill-[#475569]"
                />
                <circle
                  cx={168 + eyePosition.x}
                  cy={114 + eyePosition.y}
                  r="9"
                  className="fill-[#0f172a] dark:fill-[#f8fafc]"
                  style={{ transition: "cx 0.1s ease-out, cy 0.1s ease-out" }}
                />
              </g>
            )}

            {eyeShape === "closed" && (
              <g id="eyes-closed">
                <line
                  x1="94"
                  y1="114"
                  x2="130"
                  y2="114"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="text-[#cbd5e1] dark:text-[#f8fafc]"
                />
                <line
                  x1="150"
                  y1="114"
                  x2="186"
                  y2="114"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="text-[#cbd5e1] dark:text-[#f8fafc]"
                />
              </g>
            )}

            {eyeShape === "happy" && (
              <g id="eyes-happy">
                <path
                  d="M 94 110 Q 112 126 130 110"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                  className="text-[#cbd5e1] dark:text-[#f8fafc]"
                />
                <path
                  d="M 150 110 Q 168 126 186 110"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                  className="text-[#cbd5e1] dark:text-[#f8fafc]"
                />
              </g>
            )}

            {eyeShape === "x" && (
              <g id="eyes-x">
                <line
                  x1="102"
                  y1="104"
                  x2="122"
                  y2="124"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="text-rose-500"
                />
                <line
                  x1="122"
                  y1="104"
                  x2="102"
                  y2="124"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="text-rose-500"
                />
                <line
                  x1="158"
                  y1="104"
                  x2="178"
                  y2="124"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="text-rose-500"
                />
                <line
                  x1="178"
                  y1="104"
                  x2="158"
                  y2="124"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="text-rose-500"
                />
              </g>
            )}

            {eyeShape === "covered" && (
              <g id="eyes-covered">
                <rect
                  x="82"
                  y="94"
                  width="116"
                  height="40"
                  rx="8"
                  className="fill-[#334155] dark:fill-[#1e293b]"
                />
                <text
                  x="140"
                  y="120"
                  textAnchor="middle"
                  className="fill-slate-400 text-2xl select-none"
                >
                  🙈
                </text>
              </g>
            )}

            {eyeShape === "peeking" && (
              <g id="eyes-peeking">
                <ellipse
                  cx="112"
                  cy="114"
                  rx="20"
                  ry="10"
                  className="fill-[#cbd5e1] dark:fill-[#475569]"
                />
                <circle
                  cx={112 + eyePosition.x / 2}
                  cy={114}
                  r="5"
                  className="fill-[#0f172a] dark:fill-[#f8fafc]"
                />
                <ellipse
                  cx="168"
                  cy="114"
                  rx="20"
                  ry="10"
                  className="fill-[#cbd5e1] dark:fill-[#475569]"
                />
                <circle
                  cx={168 + eyePosition.x / 2}
                  cy={114}
                  r="5"
                  className="fill-[#0f172a] dark:fill-[#f8fafc]"
                />
              </g>
            )}

            {/* Smile/Mouth indicator line */}
            <line
              x1="116"
              y1="148"
              x2="164"
              y2="148"
              stroke="#3b82f6"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </g>

          {/* Body */}
          <g id="body">
            <rect
              x="80"
              y="200"
              width="120"
              height="105"
              rx="22"
              className="fill-[#334155] dark:fill-[#1e293b] stroke-[#475569] dark:stroke-[#334155]"
              strokeWidth="4"
            />

            {/* Body panel details - Glowing chest button */}
            <circle cx="140" cy="230" r="14" className="fill-blue-500 animate-pulse-glow" />
            <rect
              x="110"
              y="258"
              width="60"
              height="5"
              rx="2.5"
              className="fill-[#475569] dark:fill-[#334155]"
            />
            <rect
              x="110"
              y="270"
              width="60"
              height="5"
              rx="2.5"
              className="fill-[#475569] dark:fill-[#334155]"
            />
          </g>

          {/* Arms */}
          <g id="arms">
            {/* Left arm (sways softly) */}
            <rect
              x="42"
              y="208"
              width="36"
              height="66"
              rx="18"
              className={`fill-[#334155] dark:fill-[#1e293b] stroke-[#475569] dark:stroke-[#334155] ${
                prefersReducedMotion ? "" : "animate-sway-arm"
              }`}
              strokeWidth="3"
            />
            {/* Right arm (friendly wave) */}
            <rect
              x="202"
              y="208"
              width="36"
              height="66"
              rx="18"
              className={`fill-[#334155] dark:fill-[#1e293b] stroke-[#475569] dark:stroke-[#334155] ${
                prefersReducedMotion ? "" : "animate-wave-arm"
              }`}
              strokeWidth="3"
            />
          </g>
        </svg>

        {/* Soft Drop Shadow under robot */}
        <div
          className={`w-44 h-4 bg-slate-300/40 dark:bg-slate-900/70 rounded-[100%] blur-sm mt-1 ${
            prefersReducedMotion ? "" : "animate-shadow-scale"
          }`}
        />
      </div>
    </div>
  );
}
