"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { ArrowRight, Check, ChevronRight, Clipboard, Moon, Search, Sun, Terminal, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { PulseGuardLogo } from "@/components/Icons";

type Tab = "react" | "node" | "go";
type EventType = "error" | "log" | "metric" | "trace";
type FeedItem = { id: string; type: EventType; timestamp: string; payload: string };

const samples: Record<Tab, string> = {
  react: `import { TelemetryProvider } from "@pulseguard/react";

export default function RootLayout({ children }) {
  return <TelemetryProvider projectId="your-project-id">{children}</TelemetryProvider>;
}`,
  node: `import { NodeSDK } from "@opentelemetry/sdk-node";

const sdk = new NodeSDK({ serviceName: "checkout-api" });
sdk.start();`,
  go: `shutdown, err := otel.Init(ctx, otel.Config{
  ProjectID: "your-project-id",
  Service: "checkout-api",
})
defer shutdown(ctx)`,
};

function SoftSignal() {
  return <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%] opacity-40 [background-image:radial-gradient(circle_at_50%_100%,rgba(255,90,31,.14),transparent_44%),linear-gradient(90deg,transparent_0,rgba(220,220,215,.75)_1px,transparent_1px),linear-gradient(transparent_0,rgba(220,220,215,.75)_1px,transparent_1px)] [background-size:auto,78px_100%,100%_62px]" />;
}

export default function Homepage() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<Tab>("react");
  const [copied, setCopied] = useState(false);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => { if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight; }, [feed]);

  const authenticate = (mode: "login" | "signup") => {
    localStorage.setItem("auth_mode", mode);
    router.push("/signin");
  };

  const copy = async () => {
    await navigator.clipboard.writeText(samples[tab]);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const dispatch = (type: EventType) => {
    const payload = type === "error" ? { type: "TypeError", route: "/checkout", message: "Cannot read user_id" } : type === "log" ? { level: "warn", service: "checkout-api", message: "Connection pool above threshold" } : type === "metric" ? { name: "http.server.duration", value: 312, unit: "ms" } : { trace: "8bbf9e2d", spans: ["POST /checkout", "AuthorizePayment", "CreateOrder"] };
    setFeed((current) => [...current, { id: crypto.randomUUID(), type, timestamp: new Date().toLocaleTimeString(), payload: JSON.stringify(payload, null, 2) }]);
  };

  return <div className="pg-page min-h-screen overflow-hidden">
    <header className="border-b border-[#e4e4df] bg-[#f7f7f5]/90 backdrop-blur-md">
      <div className="pg-shell flex h-[78px] items-center justify-between px-5 sm:px-10">
        <div className="scale-[.84] origin-left"><PulseGuardLogo /></div>
        <nav className="hidden gap-8 text-xs font-light text-[#454540] md:flex"><a href="#product">Product</a><a href="#integrate">Docs</a><a href="#signals">Signals</a></nav>
        <div className="flex items-center gap-3">{mounted && <button className="grid size-9 place-items-center rounded-lg border border-[#dfdfda]" aria-label="Toggle theme" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}</button>}<button className="rounded-lg bg-[#171716] px-4 py-2.5 text-[11px] font-medium text-white hover:bg-[#ff5a1f]" onClick={() => user ? router.push("/projects") : authenticate("login")}>{user ? "Dashboard" : "Log in"}</button></div>
      </div>
    </header>

    <main className="pg-grid">
      <section className="pg-shell relative isolate flex min-h-[800px] items-center justify-center overflow-hidden border-b border-[#e4e4df] px-5 pb-24 pt-14 text-center sm:min-h-[860px]">
        <SoftSignal />
        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center">
          <h1 className="max-w-4xl text-[clamp(2.8rem,5vw,5.5rem)] font-medium leading-[.96] tracking-[-.07em]">Know what changed <span className="pg-signal">before your users do.</span></h1>
          <p className="mt-7 max-w-xl text-sm font-light leading-6 text-[#73736e] sm:text-base">Real-time observability for modern systems. Detect issues, own incidents, and ship with confidence.</p>
          <div className="mt-8 flex items-center gap-6"><button className="pg-action pg-action-primary" onClick={() => authenticate("signup")}>Start monitoring</button><a className="flex items-center gap-2 text-xs font-light" href="#integrate">Explore the docs <ArrowRight size={14} /></a></div>
          <div className="mt-20 w-full max-w-3xl rounded-2xl border border-[#e1e1dc] bg-white p-2 shadow-[0_22px_50px_rgba(30,30,20,.07)] sm:p-3">
            <div className="mb-2 flex gap-1.5 px-2 pt-1"><span className="size-2 rounded-full border border-[#deded8]" /><span className="size-2 rounded-full border border-[#deded8]" /><span className="size-2 rounded-full border border-[#deded8]" /></div>
            <div className="flex items-center gap-3 rounded-xl border border-[#e3e3de] px-4 py-3 text-left"><Search size={16} className="text-[#8a8a85]" /><img src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=160&q=80" alt="Placeholder circuit board" className="h-7 w-14 rounded-md object-cover" /><button className="ml-auto grid size-9 place-items-center rounded-lg bg-[#ff5a1f] text-white"><ArrowRight size={16} /></button></div>
          </div>
        </div>
      </section>

      <section id="product" className="pg-shell relative isolate flex min-h-[850px] items-center justify-center overflow-hidden border-b border-[#e4e4df] px-5 py-28 text-center">
        <SoftSignal />
        <div className="relative z-10 w-full"><h2 className="text-[clamp(2.5rem,4.4vw,4.7rem)] font-medium tracking-[-.06em]">Everything starts with signals.</h2><p className="mx-auto mt-5 max-w-xl text-sm font-light text-[#73736e]">Search across logs, metrics, errors, and traces in real time.</p>
          <div className="mx-auto mt-20 max-w-5xl overflow-hidden rounded-2xl border border-[#e1e1dc] bg-white text-left shadow-[0_28px_70px_rgba(30,30,20,.06)]"><div className="flex h-12 items-center border-b border-[#e5e5e0] px-5"><span className="size-2 rounded-full border border-[#deded8]" /><span className="ml-2 size-2 rounded-full border border-[#deded8]" /><span className="ml-2 size-2 rounded-full border border-[#deded8]" /></div><div className="grid min-h-[290px] md:grid-cols-[220px_1fr]"><div className="border-b border-[#e5e5e0] p-6 md:border-b-0 md:border-r"><p className="pg-label">Explore</p><div className="mt-8 space-y-5 text-sm"><p className="font-medium text-[#ff5a1f]">All signals</p><p className="text-[#777772]">Errors</p><p className="text-[#777772]">Traces</p><p className="text-[#777772]">Logs</p><p className="text-[#777772]">Metrics</p></div></div><div className="p-6 sm:p-9"><div className="flex items-center gap-3 border-b border-[#e5e5e0] pb-4"><Search size={16} /><span className="text-sm">service:checkout</span><span className="ml-auto text-xs text-[#777772]">Live</span></div><div className="mt-9 space-y-6">{[["High latency on checkout-api", "Trace · 1.02 s"], ["Connection pool approaching threshold", "Log · 10:24:31"], ["http.server.duration increased", "Metric · 312 ms"]].map(([title, detail], index) => <div key={title} className="flex items-center justify-between border-b border-[#efefeb] pb-4"><div className="flex items-center gap-3"><span className={index === 0 ? "size-2 rounded-full bg-[#ff5a1f]" : "size-2 rounded-full bg-[#b1b1ac]"} /><span className="text-sm">{title}</span></div><span className="text-xs text-[#777772]">{detail}</span></div>)}</div></div></div></div>
        </div>
      </section>

      <section id="integrate" className="pg-shell flex min-h-[760px] items-center border-b border-[#e4e4df] px-5 py-28"><div className="mx-auto grid w-full max-w-6xl items-center gap-20 lg:grid-cols-[.8fr_1.2fr]"><div><p className="pg-label">Instrument once</p><h2 className="mt-5 text-[clamp(2.8rem,4.5vw,5rem)] font-semibold leading-[.95] tracking-[-.065em]">Follow the request everywhere it goes.</h2><p className="mt-7 max-w-md leading-7 text-[#73736e]">Start with a few lines. PulseGuard handles the context that makes every event useful.</p></div><div className="border border-[#e1e1dc] bg-white shadow-[0_24px_65px_rgba(30,30,20,.06)]"><div className="flex items-center justify-between border-b border-[#e5e5e0] px-4 py-3"><div className="flex">{(["react", "node", "go"] as Tab[]).map((item) => <button key={item} className={tab === item ? "border-b-2 border-[#ff5a1f] px-3 py-2 text-xs font-semibold" : "px-3 py-2 text-xs text-[#777772]"} onClick={() => setTab(item)}>{item === "react" ? "React / Next.js" : item === "node" ? "Node.js" : "Go"}</button>)}</div><button className="flex items-center gap-2 text-xs text-[#666661]" onClick={copy}>{copied ? <Check size={14} /> : <Clipboard size={14} />}{copied ? "Copied" : "Copy"}</button></div><pre className="min-h-[280px] overflow-x-auto p-7 font-mono text-xs leading-7 text-[#343430] sm:p-10">{samples[tab]}</pre></div></div></section>

      <section id="signals" className="pg-shell flex min-h-[780px] items-center border-b border-[#e4e4df] px-5 py-28"><div className="mx-auto w-full max-w-5xl"><div className="text-center"><p className="pg-label">Test the signal</p><h2 className="mt-5 text-[clamp(2.7rem,5vw,5.5rem)] font-semibold tracking-[-.065em]">See what arrives.</h2><p className="mx-auto mt-5 max-w-lg text-[#73736e]">Generate a signal and inspect the context PulseGuard keeps with it.</p></div><div className="mt-16 flex flex-wrap justify-center gap-x-7 gap-y-3">{(["error", "log", "metric", "trace"] as EventType[]).map((type) => <button key={type} onClick={() => dispatch(type)} className="flex items-center gap-2 text-sm font-medium hover:text-[#ff5a1f]">Dispatch {type} <ChevronRight size={14} /></button>)}<button disabled={!feed.length} onClick={() => setFeed([])} className="flex items-center gap-2 text-sm text-[#777772] disabled:opacity-35"><Trash2 size={14} />Clear</button></div><div ref={feedRef} className="mt-10 h-[280px] overflow-y-auto border border-[#262626] bg-[#101010] p-6 font-mono text-[11px] text-neutral-300">{feed.length === 0 ? <div className="grid h-full place-items-center text-center text-neutral-500"><div><Terminal className="mx-auto mb-3" size={23} />Dispatch a signal to inspect the payload.</div></div> : <AnimatePresence initial={false}>{feed.map((item) => <motion.div key={item.id} initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} className="border-b border-neutral-800 py-4 last:border-0"><div className="mb-2 flex justify-between"><span className="text-[#ff5a1f]">{item.type.toUpperCase()}</span><span className="text-neutral-600">{item.timestamp}</span></div><pre className="text-neutral-500">{item.payload}</pre></motion.div>)}</AnimatePresence>}</div></div></section>

      <section className="pg-shell flex min-h-[600px] items-center justify-center border-b border-[#e4e4df] px-5 py-28 text-center"><div><h2 className="max-w-4xl text-[clamp(3rem,6vw,6.4rem)] font-semibold leading-[.93] tracking-[-.075em]">The next incident should not be a mystery.</h2><button className="pg-action pg-action-primary mt-10" onClick={() => authenticate("signup")}>Create your project <ArrowRight size={16} /></button></div></section>
    </main>

    <footer className="relative isolate overflow-hidden bg-[linear-gradient(to_bottom,#f7f7f5_0%,#272725_30%,#000_58%)] pt-44 text-white"><div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[35%] z-0 select-none overflow-hidden text-center text-[clamp(5rem,17vw,20rem)] font-medium leading-none tracking-[-.1em] text-white/[0.07]">PULSEGUARD</div><div className="pg-shell relative z-10 grid min-h-[570px] items-end gap-12 border-[#4a4a46] px-6 py-12 sm:px-12 lg:grid-cols-[1.4fr_1fr_1fr]"><div><div className="scale-[.84] origin-left invert"><PulseGuardLogo /></div><p className="mt-7 max-w-xs text-sm leading-6 text-neutral-500">Observability for the parts of your product that cannot be left to guesswork.</p></div><div className="grid grid-cols-2 gap-8 text-sm"><div className="space-y-4 text-neutral-400"><p className="text-xs text-neutral-600">Product</p><a href="#product">Signals</a><a href="#integrate" className="block">Instrumentation</a><a href="#signals" className="block">Live console</a></div><div className="space-y-4 text-neutral-400"><p className="text-xs text-neutral-600">Company</p><a href="#integrate" className="block">Docs</a><a href="https://github.com" target="_blank" rel="noreferrer" className="block">GitHub</a></div></div><p className="text-xs text-neutral-600">© {new Date().getFullYear()} PulseGuard</p></div></footer>
  </div>;
}
