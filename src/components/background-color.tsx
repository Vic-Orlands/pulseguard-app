import { useEffect, useState } from "react";

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-white dark:bg-black text-foreground">
      {/* Light mode noise dot pattern */}
      <div
        className="absolute inset-0 block dark:hidden"
        style={{
          background: "var(--background)",
          backgroundImage: "radial-gradient(circle, rgba(0, 0, 0, 0.06) 0.75px, transparent 0.75px)",
          backgroundSize: "8px 8px",
        }}
      />
      {/* Dark mode white dotted pattern */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background: "var(--background)",
          backgroundImage: "radial-gradient(circle, rgba(255, 255, 255, 0.06) 0.75px, transparent 0.75px)",
          backgroundSize: "8px 8px",
          backgroundPosition: "0 0",
        }}
      />
    </div>
  );
}
