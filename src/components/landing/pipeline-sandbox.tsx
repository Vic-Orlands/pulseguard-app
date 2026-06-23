"use client";

import { useEffect, useState } from "react";
import { Activity, Database, Radio, RefreshCw, Server, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";

type Packet = { id: number; color: string; target: "top" | "middle" | "bottom" };

export function PipelineSandbox() {
  const [packets, setPackets] = useState<Packet[]>([]);
  const [cpu, setCpu] = useState(38);
  const [requests, setRequests] = useState(140);
  const [errors, setErrors] = useState(0);
  const [message, setMessage] = useState("Pipeline initialized. Waiting for application telemetry.");

  const emit = (color: string, target: Packet["target"]) => {
    const id = Date.now() + Math.floor(Math.random() * 999);
    setPackets((current) => [...current, { id, color, target }]);
    window.setTimeout(() => setPackets((current) => current.filter((packet) => packet.id !== id)), 1650);
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      emit("#ff5a1f", "bottom"); // metric (orange)
      setCpu((current) => Math.max(18, Math.min(68, current + Math.floor(Math.random() * 5) - 2)));
      setRequests((current) => current + (Math.random() > 0.5 ? 1 : -1));
    }, 4200);
    return () => window.clearInterval(timer);
  }, []);

  const success = () => {
    emit("#3b82f6", "middle"); // trace (blue)
    emit("#a855f7", "top"); // log (purple)
    setMessage("GET /api/checkout · 45ms · trace status: OK");
  };

  const exception = () => {
    emit("#a855f7", "top"); // log (purple)
    emit("#3b82f6", "middle"); // trace (blue)
    setErrors((current) => current + 1);
    setMessage("POST /api/pay · card validation timeout · trace status: ERROR");
  };

  const spike = () => {
    setCpu(92);
    setMessage("Load test active · container metrics spiked to 92%");
    [0, 180, 360, 540].forEach((delay) => window.setTimeout(() => emit("#ff5a1f", "bottom"), delay));
    window.setTimeout(() => setCpu(52), 4500);
  };

  return (
    <div className="rounded-2xl border border-[#dfdfda] bg-transparent p-4 dark:border-[#3b3b3b] dark:bg-[#121212] sm:p-5">
      <div className="mb-4 flex items-center justify-between border-b border-[#dfdfda] pb-3 font-mono text-[10px] uppercase tracking-wider text-[#777772] dark:border-[#303030] dark:text-[#a3a3a3]">
        <span>PulseGuard pipeline engine</span>
        <span className="text-[#ff5a1f]">Live diagram</span>
      </div>
      <div className="relative h-[250px] overflow-hidden rounded-xl border border-[#dfdfda] bg-[#fbfbf9] dark:border-[#303030] dark:bg-[#0d0d0d]">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 560 250" preserveAspectRatio="none" aria-hidden="true">
          {/* Background static solid lines */}
          <path d="M84 125H230" stroke="currentColor" className="text-[#dfdfda] dark:text-[#222]" strokeWidth="3" fill="none" />
          <path d="M280 125Q345 56 420 56M280 125H420M280 125Q345 194 420 194" stroke="currentColor" className="text-[#dfdfda] dark:text-[#222]" strokeWidth="3.5" fill="none" />
          <path d="M470 56Q505 125 530 125M470 125H530M470 194Q505 125 530 125" stroke="currentColor" className="text-[#dfdfda] dark:text-[#222]" strokeWidth="2.5" strokeDasharray="3 3" fill="none" />

          {/* Flowing animated background dashes */}
          <path d="M84 125H230" stroke="rgba(0,0,0,0.12)" className="dark:stroke-white/20 animate-dash" strokeWidth="1.5" fill="none" />
          <path d="M280 125Q345 56 420 56" stroke="rgb(168, 85, 247)" className="animate-dash" strokeWidth="1.5" strokeOpacity="0.5" fill="none" />
          <path d="M280 125H420" stroke="rgb(59, 130, 246)" className="animate-dash" strokeWidth="1.5" strokeOpacity="0.5" fill="none" />
          <path d="M280 125Q345 194 420 194" stroke="rgb(249, 115, 22)" className="animate-dash" strokeWidth="1.5" strokeOpacity="0.5" fill="none" />

          {/* Database to Grafana animated flows */}
          <path d="M470 56Q505 125 530 125" stroke="rgb(168, 85, 247)" className="animate-dash" strokeWidth="1" strokeOpacity="0.3" fill="none" />
          <path d="M470 125H530" stroke="rgb(59, 130, 246)" className="animate-dash" strokeWidth="1" strokeOpacity="0.3" fill="none" />
          <path d="M470 194Q505 125 530 125" stroke="rgb(249, 115, 22)" className="animate-dash" strokeWidth="1" strokeOpacity="0.3" fill="none" />
        </svg>

        {/* Nodes positioning */}
        {/* Node 1: Next.js App */}
        <div className="absolute left-[6%] top-1/2 -translate-y-1/2 text-center">
          <div className="grid size-12 place-items-center rounded-lg border border-[#dfdfda] bg-white text-xs font-semibold text-[#272725] shadow-sm dark:border-[#3b3b3b] dark:bg-[#121212] dark:text-white">
            Next
          </div>
          <span className="mt-1 block font-mono text-[8px] uppercase text-[#777772] dark:text-[#a3a3a3]">Application</span>
        </div>

        {/* Node 2: OTel Collector */}
        <div className="absolute left-[42%] top-1/2 -translate-y-1/2 text-center">
          <div className="grid size-14 place-items-center rounded-full border border-[#ff5a1f] bg-[#ff5a1f]/10 text-[#ff5a1f] shadow-[0_0_15px_rgba(255,90,31,0.15)]">
            <Activity size={18} />
          </div>
          <span className="mt-1 block font-mono text-[8px] uppercase text-[#777772] dark:text-[#a3a3a3]">OTel</span>
        </div>

        {/* Node 3A: Loki (Logs) */}
        <div className="absolute left-[72%] top-[15%] text-center">
          <div className="grid size-10 place-items-center rounded-lg border border-[#dfdfda] bg-white text-purple-500 dark:border-[#3b3b3b] dark:bg-[#121212] dark:text-purple-400 shadow-sm">
            <Database size={15} />
          </div>
          <span className="mt-1 block font-mono text-[8px] uppercase text-[#777772] dark:text-[#a3a3a3]">Logs</span>
        </div>

        {/* Node 3B: Tempo (Traces) */}
        <div className="absolute left-[72%] top-1/2 -translate-y-1/2 text-center">
          <div className="grid size-10 place-items-center rounded-lg border border-[#dfdfda] bg-white text-blue-500 dark:border-[#3b3b3b] dark:bg-[#121212] dark:text-blue-400 shadow-sm">
            <Server size={15} />
          </div>
          <span className="mt-1 block font-mono text-[8px] uppercase text-[#777772] dark:text-[#a3a3a3]">Traces</span>
        </div>

        {/* Node 3C: Prometheus (Metrics) */}
        <div className="absolute left-[72%] bottom-[12%] text-center">
          <div className="grid size-10 place-items-center rounded-lg border border-[#dfdfda] bg-white text-[#ff5a1f] dark:border-[#3b3b3b] dark:bg-[#121212] dark:text-[#ff5a1f] shadow-sm">
            <Radio size={15} />
          </div>
          <span className="mt-1 block font-mono text-[8px] uppercase text-[#777772] dark:text-[#a3a3a3]">Metrics</span>
        </div>

        {/* Node 4: Grafana */}
        <div className="absolute right-[3%] top-1/2 -translate-y-1/2 text-center">
          <div className="grid size-12 place-items-center rounded-lg border border-[#dfdfda] bg-white text-yellow-500 dark:border-[#3b3b3b] dark:bg-[#121212] dark:text-yellow-400 shadow-sm">
            <Server size={18} />
          </div>
          <span className="mt-1 block font-mono text-[8px] uppercase text-[#777772] dark:text-[#a3a3a3]">Grafana</span>
        </div>

        {/* Travelling Packets */}
        <div className="absolute inset-0 pointer-events-none">
          {packets.map((packet) => (
            <div key={packet.id} className="absolute inset-0">
              {/* Stage 1: Next.js App to OTel Collector */}
              <motion.span
                initial={{ left: "15%", top: "50%", opacity: 1 }}
                animate={{ left: "41%", top: "50%" }}
                transition={{ duration: 0.7, ease: "linear" }}
                className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ backgroundColor: packet.color }}
              />

              {/* Stage 2: OTel Collector to Destination Database */}
              <motion.span
                initial={{ left: "50%", top: "50%", opacity: 0 }}
                animate={{
                  left: "75%",
                  top: packet.target === "top" ? "22%" : packet.target === "middle" ? "50%" : "78%",
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  duration: 0.8,
                  delay: 0.5,
                  ease: packet.target === "middle" ? "linear" : "easeInOut",
                }}
                className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  backgroundColor: packet.color,
                  boxShadow: `0 0 10px ${packet.color}`,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={success}
          className="flex items-center gap-1.5 rounded-lg border border-[#dfdfda] px-3 py-2 text-[11px] text-[#4b4b47] hover:border-[#ff5a1f] dark:border-[#3b3b3b] dark:text-[#d4d4d4] cursor-pointer transition-colors"
        >
          <Zap size={13} />
          Success trace
        </button>
        <button
          onClick={exception}
          className="flex items-center gap-1.5 rounded-lg border border-[#dfdfda] px-3 py-2 text-[11px] text-[#4b4b47] hover:border-[#ff5a1f] dark:border-[#3b3b3b] dark:text-[#d4d4d4] cursor-pointer transition-colors"
        >
          <Shield size={13} />
          Exception
        </button>
        <button
          onClick={spike}
          className="flex items-center gap-1.5 rounded-lg border border-[#dfdfda] px-3 py-2 text-[11px] text-[#4b4b47] hover:border-[#ff5a1f] dark:border-[#3b3b3b] dark:text-[#d4d4d4] cursor-pointer transition-colors"
        >
          <RefreshCw size={13} />
          Spike CPU
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 font-mono text-[10px]">
        <div className="rounded-lg border border-[#dfdfda] p-3 dark:border-[#303030]">
          <span className="block text-[#777772]">CPU</span>
          <span className="text-lg text-[#ff5a1f]">{cpu}%</span>
        </div>
        <div className="rounded-lg border border-[#dfdfda] p-3 dark:border-[#303030]">
          <span className="block text-[#777772]">Requests</span>
          <span className="text-lg text-[#272725] dark:text-white">{requests}/m</span>
        </div>
        <div className="rounded-lg border border-[#dfdfda] p-3 dark:border-[#303030]">
          <span className="block text-[#777772]">Errors</span>
          <span className="text-lg text-[#272725] dark:text-white">{errors}</span>
        </div>
      </div>

      <p className="mt-4 overflow-x-auto whitespace-nowrap border-t border-[#dfdfda] pt-3 font-mono text-[10px] text-[#777772] dark:border-[#303030] dark:text-[#a3a3a3]">
        <span className="mr-2 text-[#ff5a1f]">pipeline &gt;</span>
        {message}
      </p>
    </div>
  );
}
