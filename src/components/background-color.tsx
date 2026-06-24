import { useEffect, useState } from "react";

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-white dark:bg-black text-foreground">
      {/* Light mode noise dot pattern */}
      <div
        className="absolute inset-0 block dark:hidden"
        style={{
          background: "var(--background)",
          backgroundImage: `
            radial-gradient(circle, rgba(0, 0, 0, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, var(--background) 0%, 
              color-mix(in oklab, var(--background) 86%, var(--deep)) 14%, 
              color-mix(in oklab, var(--background) 72%, var(--deep)) 34%, 
              color-mix(in oklab, var(--background) 56%, var(--deep)) 58%, 
              color-mix(in oklab, var(--background) 40%, var(--deep)) 80%, 
              color-mix(in oklab, var(--background) 88%, var(--deep)) 100%)
          `,
          backgroundSize: "12px 12px, 100% 100%",
          backgroundRepeat: "repeat, no-repeat",
        }}
      />
      {/* Dark mode white dotted pattern */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background: "var(--background)",
          backgroundImage: `
            radial-gradient(circle, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, var(--background) 0%, 
              color-mix(in oklab, var(--background) 86%, var(--deep)) 14%, 
              color-mix(in oklab, var(--background) 72%, var(--deep)) 34%, 
              color-mix(in oklab, var(--background) 56%, var(--deep)) 58%, 
              color-mix(in oklab, var(--background) 40%, var(--deep)) 80%, 
              color-mix(in oklab, var(--background) 88%, var(--deep)) 100%)
          `,
          backgroundSize: "16px 16px, 100% 100%",
          backgroundRepeat: "repeat, no-repeat",
          backgroundPosition: "0 0",
        }}
      />
    </div>
  );
}
