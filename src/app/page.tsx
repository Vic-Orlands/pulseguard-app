"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Activity, ArrowRight, Check, ChevronRight, Clipboard, Moon, Sun, Terminal, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { PulseGuardLogo } from "@/components/Icons";

type Tab = "react" | "node" | "go";

type LogItem = {
  id: string;
  type: "error" | "log" | "metric" | "trace";
  timestamp: string;
  label: string;
  payload: string;
};

const codeSamples: Record<Tab, string> = {
  react: `import { TelemetryProvider } from "@pulseguard/react";

export default function RootLayout({ children }) {
  return <TelemetryProvider projectId="your-project-id">{children}</TelemetryProvider>;
}`,
  node: `import { NodeSDK } from "@opentelemetry/sdk-node";

const sdk = new NodeSDK({
  serviceName: "checkout-api",
  endpoint: "https://collector.pulseguard.dev/v1/traces",
});

sdk.start();`,
  go: `import "github.com/pulseguard/pulseguard-go/otel"

shutdown, err := otel.Init(ctx, otel.Config{
  ProjectID: "your-project-id",
  Service:   "checkout-api",
})
defer shutdown(ctx)`,
};

const services = [
  ["checkout-api", "312 ms", true],
  ["orders-service", "198 ms", false],
  ["inventory-service", "142 ms", false],
  ["payment-gateway", "503 ms", true],
  ["shipping-service", "86 ms", false],
];

const capabilities = ["Distributed traces", "Metrics and alerts", "Structured logs", "Client-side errors", "Session context", "OpenTelemetry native"];

function SignalChart() {
  return <svg viewBox="0 0 580 152" preserveAspectRatio="none" className="h-[154px] w-full overflow-visible" fill="none" aria-label="Latency chart"><path d="M0 126H580M0 83H580M0 40H580" stroke="#e5e5e0" strokeWidth="1" /><path d="M0 132 20 118 34 122 49 108 67 115 86 102 106 111 126 94 146 105 165 98 184 116 204 106 223 112 243 92 262 104 281 96 301 108 320 85 338 100 356 65 372 19 388 78 407 68 425 82 445 75 464 104 484 91 504 107 525 98 544 112 561 102 580 110" stroke="#1d1d1b" strokeWidth="2" /><path d="M0 94H580" stroke="#ff5a1f" strokeDasharray="4 5" /><circle cx="372" cy="19" r="3.5" fill="#ff5a1f" /></svg>;
}

export default function Homepage() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("react");
  const [copied, setCopied] = useState(false);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => { if (consoleRef.current) consoleRef.current.scrollTop = consoleRef.current.scrollHeight; }, [logs]);

  const goToAuth = (mode: "login" | "signup") => {
    localStorage.setItem("auth_mode", mode);
    router.push("/signin");
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(codeSamples[activeTab]);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const handleSimulate = (type: LogItem["type"]) => {
    const payloads = {
      error: { name: "TypeError", message: "Cannot read properties of null (reading 'user_id')", route: "/checkout" },
      log: { level: "warn", message: "DB connection pool approaching capacity", service: "checkout-api" },
      metric: { name: "http.server.duration", value: Math.round(Math.random() * 180 + 120), unit: "ms" },
      trace: { traceId: Math.random().toString(16).slice(2), spans: ["POST /checkout", "AuthorizePayment", "CreateOrder"] },
    };
    const labels = { error: "React client exception", log: "Checkout service log", metric: "Latency metric", trace: "Distributed trace" };
    setLogs((current) => [...current, { id: crypto.randomUUID(), type, timestamp: new Date().toLocaleTimeString(), label: labels[type], payload: JSON.stringify(payloads[type], null, 2) }]);
  };

  return (
    <div className="pg-page min-h-screen overflow-hidden">
      <header className="border-b border-[#dfdfda] bg-[#f7f7f5]/95 backdrop-blur-md">
        <div className="pg-shell flex h-[76px] items-center justify-between px-5 sm:px-8">
          <div className="scale-[.84] origin-left"><PulseGuardLogo /></div>
          <nav className="hidden items-center gap-8 text-sm font-medium md:flex"><a href="#product" className="hover:text-[#ff5a1f]">Product</a><a href="#integrate" className="hover:text-[#ff5a1f]">Docs</a><a href="#signals" className="hover:text-[#ff5a1f]">Signals</a></nav>
          <div className="flex items-center gap-2 sm:gap-4">
            {mounted && <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="grid size-9 place-items-center border border-[#dfdfda] bg-white text-[#1d1d1b] hover:border-[#1d1d1b]" aria-label="Toggle theme">{theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}</button>}
            <button onClick={() => user ? router.push("/projects") : goToAuth("login")} className="bg-[#1d1d1b] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#ff5a1f]">{user ? "Dashboard" : "Sign in"}</button>
          </div>
        </div>
      </header>

      <main className="pg-grid">
        <section className="pg-shell grid min-h-[calc(100vh-76px)] items-center border-b border-[#dfdfda] lg:grid-cols-[.78fr_1.22fr]">
          <div className="px-6 py-20 sm:px-12 lg:px-16 lg:py-24">
            <h1 className="max-w-[560px] text-[clamp(3rem,6vw,6.8rem)] font-semibold leading-[.91] tracking-[-.075em]">Catch the signal before it becomes an incident.</h1>
            <p className="mt-8 max-w-md text-base leading-7 text-[#656560] sm:text-lg">End-to-end observability that brings traces, metrics, logs, and client context into one clear operational picture.</p>
            <div className="mt-9 flex flex-wrap gap-3"><button onClick={() => goToAuth("signup")} className="pg-action pg-action-primary">Start monitoring <ArrowRight size={15} /></button><a href="#signals" className="pg-action pg-action-secondary">See it in action</a></div>
            <p className="mt-7 font-mono text-[10px] uppercase tracking-[.12em] text-[#858580]">OpenTelemetry native · no vendor lock-in</p>
          </div>

          <div className="px-4 pb-10 lg:px-0 lg:pb-0 lg:pr-8">
            <div className="pg-panel overflow-hidden bg-white shadow-[0_24px_70px_rgba(30,30,20,.08)]">
              <div className="flex items-center justify-between border-b border-[#dfdfda] px-4 py-3 text-[10px] font-medium"><span className="font-mono text-[#767670]">PULSEGUARD / PRODUCTION</span><span className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-[#ff5a1f]" />All systems reporting</span></div>
              <div className="grid md:grid-cols-[200px_1fr]">
                <aside className="border-b border-[#dfdfda] p-4 md:border-b-0 md:border-r"><div className="mb-4 flex items-center justify-between"><span className="text-sm font-semibold">Services</span><Activity size={14} /></div><div className="space-y-1">{services.map(([name, latency, active]) => <div key={name} className="flex items-center justify-between border-b border-[#efefeb] py-2.5 last:border-0"><span className="text-[11px]">{name}</span><span className={active ? "text-[10px] font-medium text-[#ff5a1f]" : "text-[10px] text-[#777772]"}>{latency}</span></div>)}</div><button className="mt-5 text-[11px] text-[#777772] hover:text-[#1d1d1b]">View all services <ArrowRight className="ml-1 inline" size={12} /></button></aside>
                <div className="min-w-0"><div className="flex items-center justify-between border-b border-[#dfdfda] px-5 py-4"><div><span className="text-sm font-semibold">checkout-api</span><span className="ml-2 text-[#777772]">⌄</span></div><span className="text-[10px] text-[#777772]">Last 15m</span></div><div className="p-5"><div className="flex items-center justify-between"><p className="text-xs font-semibold">Latency <span className="font-normal text-[#777772]">(P95)</span></p><p className="text-sm font-semibold text-[#ff5a1f]">312 ms</p></div><SignalChart /><div className="border border-[#dfdfda] px-3 py-2.5 text-[11px]"><span className="mr-2 inline-block size-1.5 rounded-full bg-[#ff5a1f]" />High latency on checkout-api <span className="float-right text-[#777772]">Investigating</span></div><div className="mt-5 border-t border-[#dfdfda] pt-4"><div className="mb-3 flex justify-between text-xs font-semibold"><span>Trace sample</span><span className="font-normal text-[#777772]">View full trace →</span></div>{["POST /checkout", "AuthorizePayment", "CreateOrder"].map((span, index) => <div key={span} className="grid grid-cols-[112px_1fr_40px] items-center gap-2 py-1.5 text-[10px]"><span>{span}</span><span className="h-1.5 bg-[#1d1d1b]" style={{ width: `${90 - index * 22}%`, marginLeft: `${index * 12}%` }} /><span className="text-right text-[#777772]">{["1.02 s", "520 ms", "150 ms"][index]}</span></div>)}</div></div></div>
              </div>
            </div>
          </div>
        </section>

        <section id="product" className="pg-shell border-b border-[#dfdfda]">
          <div className="grid lg:grid-cols-[286px_1fr]"><div className="border-b border-[#dfdfda] p-7 lg:border-b-0 lg:border-r lg:p-10"><p className="pg-label">Observability in practice</p><ol className="mt-8 space-y-4">{capabilities.map((item, index) => <li key={item} className={index === 0 ? "flex gap-4 text-sm font-medium text-[#1d1d1b]" : "flex gap-4 text-sm text-[#777772]"}><span className={index === 0 ? "font-mono text-[#ff5a1f]" : "font-mono"}>{String(index + 1).padStart(2, "0")}</span>{item}</li>)}</ol></div><div className="grid md:grid-cols-2"><article className="border-b border-[#dfdfda] p-7 md:border-r lg:p-10"><p className="pg-label">One request, every signal</p><h2 className="mt-12 max-w-sm text-3xl font-semibold leading-tight tracking-[-.05em]">Inspect the whole path, not isolated symptoms.</h2><p className="mt-5 max-w-sm leading-7 text-[#73736e]">Follow a customer-facing failure from browser exception to the exact slow downstream query.</p></article><article className="border-b border-[#dfdfda] p-7 lg:p-10"><p className="pg-label">Correlated by default</p><div className="mt-10 space-y-4">{["Browser error captured", "checkout-api trace sampled", "payment-gateway span delayed", "Postgres query identified"].map((item, index) => <div className="flex items-center gap-3 border-b border-[#e8e8e4] pb-3 text-sm" key={item}><span className={index === 2 ? "grid size-5 place-items-center rounded-full bg-[#ff5a1f] text-[10px] text-white" : "grid size-5 place-items-center rounded-full border border-[#cfcfca] text-[10px]"}>{index + 1}</span>{item}{index === 2 && <span className="ml-auto text-xs text-[#ff5a1f]">520 ms</span>}</div>)}</div></article><article className="p-7 md:col-span-2 lg:p-10"><p className="pg-label">Designed for the work in front of you</p><div className="mt-7 grid gap-7 md:grid-cols-3"><p className="text-xl font-medium leading-7 tracking-[-.035em]">No black box between an incident and the evidence.</p><p className="text-sm leading-6 text-[#73736e]">Capture what happened. Find the request. Trace every dependent service. Keep the surrounding context intact.</p><a href="#integrate" className="flex items-end text-sm font-medium hover:text-[#ff5a1f]">Explore instrumentation <ArrowRight className="ml-2" size={15} /></a></div></article></div></div>
        </section>

        <section id="integrate" className="pg-shell border-b border-[#dfdfda] p-6 sm:p-10 lg:p-14"><div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="pg-label">Instrument in minutes</p><h2 className="mt-4 text-3xl font-semibold tracking-[-.05em] sm:text-4xl">Bring your own stack.</h2></div><p className="max-w-sm text-sm leading-6 text-[#73736e]">PulseGuard works with the telemetry you already trust. Start with a few lines, then follow the data wherever it goes.</p></div><div className="pg-panel overflow-hidden bg-white"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dfdfda] px-3 py-2"><div className="flex">{(["react", "node", "go"] as Tab[]).map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={activeTab === tab ? "border border-[#dfdfda] bg-[#f7f7f5] px-3 py-2 text-xs font-semibold" : "px-3 py-2 text-xs text-[#777772]"}>{tab === "react" ? "React / Next.js" : tab === "node" ? "Node.js" : "Go"}</button>)}</div><button onClick={copyCode} className="flex items-center gap-2 px-2 py-2 text-xs text-[#777772] hover:text-[#1d1d1b]">{copied ? <Check size={14} /> : <Clipboard size={14} />}{copied ? "Copied" : "Copy code"}</button></div><div className="grid lg:grid-cols-[1fr_320px]"><pre className="overflow-x-auto p-6 font-mono text-xs leading-7 text-[#343430] sm:p-8">{codeSamples[activeTab]}</pre><div className="border-t border-[#dfdfda] p-6 lg:border-l lg:border-t-0"><p className="pg-label">Your stack, visible</p><div className="mt-9 space-y-5">{["Errors carry user context", "Logs inherit trace IDs", "Metrics reveal the shape of drift"].map((item) => <div className="flex gap-3 text-sm" key={item}><Check className="mt-0.5 text-[#ff5a1f]" size={15} />{item}</div>)}</div></div></div></div></section>

        <section id="signals" className="pg-shell border-b border-[#dfdfda] p-6 sm:p-10 lg:p-14"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="pg-label">Live telemetry console</p><h2 className="mt-4 text-3xl font-semibold tracking-[-.05em] sm:text-4xl">Make the signal concrete.</h2></div><button onClick={() => setLogs([])} disabled={!logs.length} className="flex items-center gap-2 text-sm text-[#73736e] hover:text-[#1d1d1b] disabled:opacity-40"><Trash2 size={15} />Clear feed</button></div><div className="mt-8 grid gap-px border border-[#dfdfda] bg-[#dfdfda] sm:grid-cols-4">{(["error", "log", "metric", "trace"] as const).map((type) => <button key={type} onClick={() => handleSimulate(type)} className="flex min-h-20 items-center justify-between bg-[#f7f7f5] px-4 text-left text-sm font-medium hover:bg-white"><span>{type === "error" ? "Client error" : type === "log" ? "Service log" : type === "metric" ? "Latency metric" : "Trace sample"}</span><ChevronRight size={15} className="text-[#ff5a1f]" /></button>)}</div><div ref={consoleRef} className="mt-4 h-[360px] overflow-y-auto border border-[#252525] bg-[#101010] p-5 font-mono text-[11px] text-neutral-300 sm:p-7">{logs.length === 0 ? <div className="grid h-full place-items-center text-center"><div><Terminal className="mx-auto mb-3 text-neutral-600" size={24} /><p className="text-neutral-500">Dispatch a telemetry event to inspect its payload.</p></div></div> : <AnimatePresence initial={false}>{logs.map((log) => <motion.div key={log.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="border-b border-neutral-800 py-4 last:border-0"><div className="mb-2 flex gap-3"><span className={log.type === "error" ? "text-[#ff5a1f]" : "text-neutral-400"}>{log.type.toUpperCase()}</span><span>{log.label}</span><span className="ml-auto text-neutral-600">{log.timestamp}</span></div><pre className="overflow-x-auto text-neutral-500">{log.payload}</pre></motion.div>)}</AnimatePresence>}</div></section>

        <section className="pg-shell grid border-b border-[#dfdfda] lg:grid-cols-2"><div className="p-8 sm:p-12 lg:p-16"><p className="pg-label">Ready when production is</p><h2 className="mt-5 max-w-xl text-4xl font-semibold leading-[.98] tracking-[-.06em] sm:text-6xl">Observe the system your customers actually use.</h2></div><div className="flex items-end p-8 sm:p-12 lg:p-16"><button onClick={() => goToAuth("signup")} className="pg-action pg-action-primary">Create your project <ArrowRight size={16} /></button></div></section>
      </main>

      <footer className="pg-shell flex flex-col gap-4 border-b border-[#dfdfda] px-6 py-8 text-xs text-[#777772] sm:flex-row sm:items-center sm:justify-between"><span>© {new Date().getFullYear()} PulseGuard</span><div className="flex gap-5"><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-[#1d1d1b]">GitHub</a><a href="#integrate" className="hover:text-[#1d1d1b]">Documentation</a><a href="#signals" className="hover:text-[#1d1d1b]">Status</a></div></footer>
    </div>
  );
}
