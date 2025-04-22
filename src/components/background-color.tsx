"use client";

import { motion } from "motion/react";

export default function FuturisticBg({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#0f2027] via-[#2c5364] to-[#232526]">
      {/* Animated Circular SVG lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
        aria-hidden
      >
        <defs>
          <radialGradient id="circleGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#4facfe" stopOpacity="0" />
          </radialGradient>
        </defs>
        {[120, 240, 360, 480].map((r, i) => (
          <circle
            key={i}
            cx="50%"
            cy="50%"
            r={r}
            stroke="url(#circleGradient)"
            strokeWidth="0.5"
            fill="none"
            style={{
              animation: `spin ${30 + i * 10}s linear infinite reverse`,
              transformOrigin: "50% 50%",
            }}
          />
        ))}
      </svg>
      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex flex-col items-center justify-center min-h-screen"
      >
        {children}
      </motion.div>
      <style jsx global>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
