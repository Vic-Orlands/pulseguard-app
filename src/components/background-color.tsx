import { useEffect, useState } from "react";

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-white dark:bg-black text-foreground">
      {/* Light mode noise dot pattern */}
      <div
        className="absolute inset-0 block dark:hidden"
        style={{
          background: "#ffffff",
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.35) 1px, transparent 0)",
          backgroundSize: "20px 20px",
        }}
      />
      {/* Dark mode white dotted pattern */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background: "#000000",
          backgroundImage: `
            radial-gradient(circle, rgba(255, 255, 255, 0.2) 1.5px, transparent 1.5px)
          `,
          backgroundSize: "30px 30px",
          backgroundPosition: "0 0",
        }}
      />
    </div>
  );
}
