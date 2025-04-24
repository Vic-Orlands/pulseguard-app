import { motion } from "motion/react";

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950"></div>
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-full h-full border border-blue-500/10 rounded-full"
          initial={{
            scale: 0.1 + i * 0.15,
            opacity: 0.3 - i * 0.05,
          }}
          animate={{
            scale: [0.1 + i * 0.15, 0.2 + i * 0.2, 0.1 + i * 0.15],
            opacity: [0.3 - i * 0.05, 0.15 - i * 0.02, 0.3 - i * 0.05],
            rotate: [0, 90, 180],
          }}
          transition={{
            duration: 20 + i * 5,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`dot-${i}`}
          className="absolute w-1 h-1 bg-blue-400 rounded-full"
          initial={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: 0.3 + Math.random() * 0.4,
          }}
          animate={{
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
