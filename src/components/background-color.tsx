import { useEffect, useState } from "react";

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-white dark:bg-black text-foreground">
      {/* Light mode noise dot pattern */}
      <div
        className="absolute inset-0 block dark:hidden"
        style={{
          background: "#ffffff",
          backgroundImage: "radial-gradient(circle, rgba(0, 0, 0, 0.08) 1px, transparent 1px)",
          backgroundSize: "12px 12px",
        }}
      />
      {/* Dark mode white dotted pattern */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background: "#000000",
          backgroundImage: `
            radial-gradient(circle, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: "16px 16px",
          backgroundPosition: "0 0",
        }}
      />
    </div>
  );
}
