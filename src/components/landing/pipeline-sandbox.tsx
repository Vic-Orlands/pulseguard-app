"use client";

import { useEffect, useState } from "react";
import { Activity, Database, Radio, RefreshCw, Server, Shield, Zap } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

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
      emit("#ff5a1f", "bottom");
      setCpu((current) => Math.max(18, Math.min(68, current + Math.floor(Math.random() * 5) - 2)));
      setRequests((current) => current + (Math.random() > 0.5 ? 1 : -1));
    }, 4200);
    return () => window.clearInterval(timer);
  }, []);

  const success = () => {
    emit("#ff5a1f", "middle");
    emit("#ff5a1f", "top");
    setMessage("GET /api/checkout · 45ms · trace status: OK");
  };

  const exception = () => {
    emit("#ff5a1f", "top");
    setErrors((current) => current + 1);
    setMessage("POST /api/pay · card validation timeout · trace status: ERROR");
  };

  const spike = () => {
    setCpu(92);
    setMessage("Load test active · container metrics spiked to 92%");
    [0, 180, 360, 540].forEach((delay) => window.setTimeout(() => emit("#ff5a1f", "bottom"), delay));
    window.setTimeout(() => setCpu(52), 4500);
  };

  return <div className="rounded-2xl border border-[#dfdfda] bg-transparent p-4 dark:border-[#3b3b3b] dark:bg-[#121212] sm:p-5">
    <div className="mb-4 flex items-center justify-between border-b border-[#dfdfda] pb-3 font-mono text-[10px] uppercase tracking-wider text-[#777772] dark:border-[#303030] dark:text-[#a3a3a3]"><span>PulseGuard pipeline engine</span><span className="text-[#ff5a1f]">Live diagram</span></div>
    <div className="relative h-[250px] overflow-hidden rounded-xl border border-[#dfdfda] bg-transparent dark:border-[#303030] dark:bg-[#0d0d0d]">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 560 250" preserveAspectRatio="none" aria-hidden="true"><path d="M84 125H230" stroke="currentColor" className="text-[#d6d6d1] dark:text-[#333]" strokeWidth="2" /><path d="M280 125Q345 56 420 56M280 125H420M280 125Q345 194 420 194" stroke="currentColor" className="text-[#d6d6d1] dark:text-[#333]" strokeWidth="2" fill="none" /><path d="M470 56Q505 125 530 125M470 125H530M470 194Q505 125 530 125" stroke="currentColor" className="text-[#d6d6d1] dark:text-[#333]" strokeWidth="1.5" strokeDasharray="4 5" fill="none" /></svg>
      <div className="absolute left-[6%] top-1/2 -translate-y-1/2 text-center"><div className="grid size-12 place-items-center rounded-lg border border-[#dfdfda] bg-white text-xs font-medium text-[#272725] dark:border-[#3b3b3b] dark:bg-[#121212] dark:text-white">Next</div><span className="mt-1 block font-mono text-[8px] uppercase text-[#777772]">Application</span></div>
      <div className="absolute left-[42%] top-1/2 -translate-y-1/2 text-center"><div className="grid size-14 place-items-center rounded-full border border-[#ff5a1f] bg-[#ff5a1f]/10 text-[#ff5a1f]"><Activity size={18} /></div><span className="mt-1 block font-mono text-[8px] uppercase text-[#777772]">OTel</span></div>
      <div className="absolute left-[72%] top-[15%] text-center"><div className="grid size-10 place-items-center rounded-lg border border-[#dfdfda] bg-white text-[#ff5a1f] dark:border-[#3b3b3b] dark:bg-[#121212]"><Database size={15} /></div><span className="mt-1 block font-mono text-[8px] uppercase text-[#777772]">Logs</span></div>
      <div className="absolute left-[72%] top-1/2 -translate-y-1/2 text-center"><div className="grid size-10 place-items-center rounded-lg border border-[#dfdfda] bg-white text-[#ff5a1f] dark:border-[#3b3b3b] dark:bg-[#121212]"><Server size={15} /></div><span className="mt-1 block font-mono text-[8px] uppercase text-[#777772]">Traces</span></div>
      <div className="absolute left-[72%] bottom-[12%] text-center"><div className="grid size-10 place-items-center rounded-lg border border-[#dfdfda] bg-white text-[#ff5a1f] dark:border-[#3b3b3b] dark:bg-[#121212]"><Radio size={15} /></div><span className="mt-1 block font-mono text-[8px] uppercase text-[#777772]">Metrics</span></div>
      <div className="absolute right-[3%] top-1/2 -translate-y-1/2 text-center"><div className="grid size-12 place-items-center rounded-lg border border-[#dfdfda] bg-white text-[#ff5a1f] dark:border-[#3b3b3b] dark:bg-[#121212]"><Server size={18} /></div><span className="mt-1 block font-mono text-[8px] uppercase text-[#777772]">Grafana</span></div>
      <AnimatePresence>{packets.map((packet) => <motion.span key={packet.id} initial={{ left: "15%", top: "50%", opacity: 1 }} animate={{ left: packet.target === "top" ? "77%" : packet.target === "middle" ? "77%" : "77%", top: packet.target === "top" ? "22%" : packet.target === "middle" ? "50%" : "78%", opacity: 0 }} transition={{ duration: 1.5, ease: "easeInOut" }} className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ backgroundColor: packet.color }} />)}</AnimatePresence>
    </div>
    <div className="mt-4 flex flex-wrap items-center gap-2"><button onClick={success} className="flex items-center gap-1.5 rounded-lg border border-[#dfdfda] px-3 py-2 text-[11px] text-[#4b4b47] hover:border-[#ff5a1f] dark:border-[#3b3b3b] dark:text-[#d4d4d4]"><Zap size={13} />Success trace</button><button onClick={exception} className="flex items-center gap-1.5 rounded-lg border border-[#dfdfda] px-3 py-2 text-[11px] text-[#4b4b47] hover:border-[#ff5a1f] dark:border-[#3b3b3b] dark:text-[#d4d4d4]"><Shield size={13} />Exception</button><button onClick={spike} className="flex items-center gap-1.5 rounded-lg border border-[#dfdfda] px-3 py-2 text-[11px] text-[#4b4b47] hover:border-[#ff5a1f] dark:border-[#3b3b3b] dark:text-[#d4d4d4]"><RefreshCw size={13} />Spike CPU</button></div>
    <div className="mt-4 grid grid-cols-3 gap-2 font-mono text-[10px]"><div className="rounded-lg border border-[#dfdfda] p-3 dark:border-[#303030]"><span className="block text-[#777772]">CPU</span><span className="text-lg text-[#ff5a1f]">{cpu}%</span></div><div className="rounded-lg border border-[#dfdfda] p-3 dark:border-[#303030]"><span className="block text-[#777772]">Requests</span><span className="text-lg text-[#272725] dark:text-white">{requests}/m</span></div><div className="rounded-lg border border-[#dfdfda] p-3 dark:border-[#303030]"><span className="block text-[#777772]">Errors</span><span className="text-lg text-[#272725] dark:text-white">{errors}</span></div></div>
    <p className="mt-4 overflow-x-auto whitespace-nowrap border-t border-[#dfdfda] pt-3 font-mono text-[10px] text-[#777772] dark:border-[#303030] dark:text-[#a3a3a3]"><span className="mr-2 text-[#ff5a1f]">pipeline &gt;</span>{message}</p>
  </div>;
}
