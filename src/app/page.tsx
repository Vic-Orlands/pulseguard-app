"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Clipboard,
  Moon,
  Sun,
  Terminal,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { PulseGuardLogo } from "@/components/Icons";
import { LandingFaq } from "@/components/landing/faq";
import { ArchitectureGraph } from "@/components/landing/architecture-graph";

type Tab = "react" | "node" | "go";
type EventType = "error" | "log" | "metric" | "trace";
type FeedItem = {
  id: string;
  type: EventType;
  timestamp: string;
  payload: string;
};

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

const dashboardScreens = ["overview", "logs", "traces", "errors", "metrics"];

function SoftSignal() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%] opacity-40 [background-image:radial-gradient(circle_at_50%_100%,rgba(255,90,31,.14),transparent_44%),linear-gradient(90deg,transparent_0,rgba(223,223,218,.36)_1px,transparent_1px),linear-gradient(transparent_0,rgba(223,223,218,.36)_1px,transparent_1px)] [background-size:auto,78px_100%,100%_62px]"
    />
  );
}

export default function Homepage() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<Tab>("react");
  const [copied, setCopied] = useState(false);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [activeScreen, setActiveScreen] = useState(0);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (feedRef.current)
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [feed]);
  useEffect(() => {
    const timer = window.setInterval(
      () =>
        setActiveScreen((current) => (current + 1) % dashboardScreens.length),
      4500,
    );
    return () => window.clearInterval(timer);
  }, []);

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
    const payload =
      type === "error"
        ? {
            type: "TypeError",
            route: "/checkout",
            message: "Cannot read user_id",
          }
        : type === "log"
          ? {
              level: "warn",
              service: "checkout-api",
              message: "Connection pool above threshold",
            }
          : type === "metric"
            ? { name: "http.server.duration", value: 312, unit: "ms" }
            : {
                trace: "8bbf9e2d",
                spans: ["POST /checkout", "AuthorizePayment", "CreateOrder"],
              };
    setFeed((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        type,
        timestamp: new Date().toLocaleTimeString(),
        payload: JSON.stringify(payload, null, 2),
      },
    ]);
  };

  return (
    <div className="pg-page min-h-screen overflow-hidden">
      <header className="border-b border-[#e4e4df] bg-[#f7f7f5]/90 backdrop-blur-md">
        <div className="pg-shell flex h-[78px] items-center justify-between px-5 sm:px-10">
          <div className="scale-[.84] origin-left">
            <PulseGuardLogo />
          </div>
          <nav className="hidden gap-8 text-xs font-light text-[#454540] md:flex">
            <a href="#product">Product</a>
            <a href="#integrate">Docs</a>
            <a href="#signals">Signals</a>
          </nav>
          <div className="flex items-center gap-3">
            {mounted && (
              <button
                className="grid size-9 place-items-center rounded-lg border border-[#dfdfda]"
                aria-label="Toggle theme"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
              </button>
            )}
            <button
              className="rounded-lg bg-[#171716] px-4 py-2.5 text-[11px] font-medium text-white hover:bg-[#ff5a1f]"
              onClick={() =>
                user ? router.push("/projects") : authenticate("login")
              }
            >
              {user ? "Dashboard" : "Log in"}
            </button>
          </div>
        </div>
      </header>

      <main className="pg-grid">
        <section className="pg-shell relative isolate flex min-h-[800px] items-center justify-center overflow-hidden border-b border-[#e4e4df] px-5 pb-24 pt-14 text-center sm:min-h-[860px]">
          <SoftSignal />
          <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center">
            <h1 className="max-w-4xl text-[clamp(2.8rem,5vw,5.5rem)] font-medium leading-[.96] tracking-[-.07em]">
              Know what changed{" "}
              <span className="pg-signal">before your users do.</span>
            </h1>
            <p className="mt-7 max-w-xl text-sm font-light leading-6 text-[#73736e] sm:text-base">
              Real-time observability for modern systems. Detect issues, own
              incidents, and ship with confidence.
            </p>
            <div className="mt-8 flex flex-col items-center gap-5">
              <button
                className="pg-action pg-action-primary"
                onClick={() => authenticate("signup")}
              >
                Start monitoring
              </button>
              <a
                className="flex items-center gap-2 text-xs font-light"
                href="#integrate"
              >
                Explore the docs <ArrowRight size={14} />
              </a>
            </div>
            <div className="mt-20 w-full max-w-6xl overflow-hidden rounded-2xl border border-[#e1e1dc] bg-white shadow-[0_22px_50px_rgba(30,30,20,.07)]">
              <img
                src="/landing/overview.png"
                alt="PulseGuard incident overview"
                className="block w-full"
              />
            </div>
          </div>
        </section>

        <section
          id="product"
          className="pg-shell relative isolate flex min-h-[850px] items-center justify-center overflow-hidden border-b border-[#e4e4df] px-5 py-28 text-center"
        >
          <SoftSignal />
          <div className="relative z-10 w-full">
            <h2 className="text-[clamp(2.5rem,4.4vw,4.7rem)] font-medium tracking-[-.06em]">
              Everything starts with signals.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-sm font-light text-[#73736e]">
              Five focused ways to see what your software is doing.
            </p>
            <div className="mx-auto mt-20 max-w-5xl overflow-hidden rounded-2xl border border-[#e1e1dc] bg-white text-left shadow-[0_28px_70px_rgba(30,30,20,.06)]">
              <img
                src={`/landing/${dashboardScreens[activeScreen]}.png`}
                alt={`${dashboardScreens[activeScreen]} dashboard preview`}
                className="block w-full transition-opacity duration-500"
              />
            </div>
            <div className="mt-7 flex justify-center gap-2">
              {dashboardScreens.map((screen, index) => (
                <button
                  key={screen}
                  onClick={() => setActiveScreen(index)}
                  aria-label={`Show ${screen} dashboard`}
                  className={
                    activeScreen === index
                      ? "h-2 w-6 rounded-full bg-[#ff5a1f] transition-all"
                      : "size-2 rounded-full bg-[#c6c6c1] transition-all"
                  }
                />
              ))}
            </div>
          </div>
        </section>

        <section
          id="integrate"
          className="pg-shell flex min-h-[760px] items-center border-b border-[#e4e4df] px-5 py-28"
        >
          <div className="mx-auto grid w-full max-w-6xl items-center gap-20 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <p className="pg-label">Instrument once</p>
              <h2 className="mt-5 text-[clamp(2.8rem,4.5vw,5rem)] font-semibold leading-[.95] tracking-[-.065em]">
                Follow the request everywhere it goes.
              </h2>
              <p className="mt-7 max-w-md leading-7 text-[#73736e]">
                Start with a few lines. PulseGuard handles the context that
                makes every event useful.
              </p>
            </div>
            <div className="border border-[#e1e1dc] bg-white shadow-[0_24px_65px_rgba(30,30,20,.06)]">
              <div className="flex items-center justify-between border-b border-[#e5e5e0] px-4 py-3">
                <div className="flex">
                  {(["react", "node", "go"] as Tab[]).map((item) => (
                    <button
                      key={item}
                      className={
                        tab === item
                          ? "border-b-2 border-[#ff5a1f] px-3 py-2 text-xs font-semibold"
                          : "px-3 py-2 text-xs text-[#777772]"
                      }
                      onClick={() => setTab(item)}
                    >
                      {item === "react"
                        ? "React / Next.js"
                        : item === "node"
                          ? "Node.js"
                          : "Go"}
                    </button>
                  ))}
                </div>
                <button
                  className="flex items-center gap-2 text-xs text-[#666661]"
                  onClick={copy}
                >
                  {copied ? <Check size={14} /> : <Clipboard size={14} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="min-h-[280px] overflow-x-auto p-7 font-mono text-xs leading-7 text-[#343430] sm:p-10">
                {samples[tab]}
              </pre>
            </div>
          </div>
        </section>

        <section
          id="signals"
          className="pg-shell flex min-h-[780px] items-center border-b border-[#e4e4df] bg-[#f7f7f5] px-5 py-28 dark:bg-[#090909]"
        >
          <div className="mx-auto w-full max-w-5xl">
            <div className="text-center">
              <p className="pg-label">Test the signal</p>
              <h2 className="mt-5 text-[clamp(2.7rem,5vw,5.5rem)] font-semibold tracking-[-.065em]">
                See what arrives.
              </h2>
              <p className="mx-auto mt-5 max-w-lg text-[#73736e]">
                Generate a signal and inspect the context PulseGuard keeps with
                it.
              </p>
            </div>
            <div className="mt-16 flex flex-wrap justify-center gap-x-7 gap-y-3">
              {(["error", "log", "metric", "trace"] as EventType[]).map(
                (type) => (
                  <button
                    key={type}
                    onClick={() => dispatch(type)}
                    className="flex items-center gap-2 text-sm font-medium hover:text-[#ff5a1f]"
                  >
                    Dispatch {type} <ChevronRight size={14} />
                  </button>
                ),
              )}
              <button
                disabled={!feed.length}
                onClick={() => setFeed([])}
                className="flex items-center gap-2 text-sm text-[#777772] disabled:opacity-35"
              >
                <Trash2 size={14} />
                Clear
              </button>
            </div>
            <div
              ref={feedRef}
              className="mt-10 h-[280px] overflow-y-auto rounded-xl border border-[#262626] bg-[#101010] p-6 font-mono text-[11px] text-neutral-300"
            >
              {feed.length === 0 ? (
                <div className="grid h-full place-items-center text-center text-neutral-500">
                  <div>
                    <Terminal className="mx-auto mb-3" size={23} />
                    Dispatch a signal to inspect the payload.
                  </div>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {feed.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 7 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border-b border-neutral-800 py-4 last:border-0"
                    >
                      <div className="mb-2 flex justify-between">
                        <span className="text-[#ff5a1f]">
                          {item.type.toUpperCase()}
                        </span>
                        <span className="text-neutral-600">
                          {item.timestamp}
                        </span>
                      </div>
                      <pre className="text-neutral-500">{item.payload}</pre>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
            <ArchitectureGraph />
          </div>
        </section>

        <section className="pg-shell flex min-h-[600px] items-center justify-center border-b border-[#e4e4df] px-5 py-28 text-center">
          <div>
            <h2 className="max-w-4xl text-[clamp(3rem,6vw,6.4rem)] font-semibold leading-[.93] tracking-[-.075em]">
              The next incident should not be a mystery.
            </h2>
            <button
              className="pg-action pg-action-primary mt-10"
              onClick={() => authenticate("signup")}
            >
              Create your project <ArrowRight size={16} />
            </button>
          </div>
        </section>
        <LandingFaq />
      </main>

      <footer className="overflow-hidden bg-black pt-8 text-white">
        <div
          aria-hidden="true"
          className="select-none whitespace-nowrap px-3 text-center text-[17vw] font-medium leading-none tracking-[-.1em] text-white/[0.07]"
        >
          PULSEGUARD
        </div>
        <div className="mx-auto mt-10 grid min-h-[330px] max-w-[1440px] items-end gap-10 px-6 py-10 sm:px-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="scale-[.84] origin-left invert">
              <PulseGuardLogo />
            </div>
            <p className="mt-5 max-w-xs text-sm leading-6 text-neutral-500">
              Observability for the parts of your product that cannot be left to
              guesswork.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm">
            <div className="space-y-4 text-neutral-400">
              <p className="text-xs text-neutral-600">Product</p>
              <a href="#product">Signals</a>
              <a href="#integrate" className="block">
                Instrumentation
              </a>
              <a href="#signals" className="block">
                Live console
              </a>
            </div>
            <div className="space-y-4 text-neutral-400">
              <p className="text-xs text-neutral-600">Company</p>
              <a href="#integrate" className="block">
                Docs
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="block"
              >
                GitHub
              </a>
            </div>
          </div>
          <p className="text-xs text-neutral-600">
            © {new Date().getFullYear()} PulseGuard
          </p>
        </div>
      </footer>
    </div>
  );
}
