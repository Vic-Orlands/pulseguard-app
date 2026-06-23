"use client";

import Image from "next/image";
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
import { PipelineSandbox } from "@/components/landing/pipeline-sandbox";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  NewTwitterIcon,
  Mail01Icon,
  GithubIcon,
  Linkedin02Icon,
} from "@hugeicons/core-free-icons";
import clsx from "clsx";

type Tab = "react" | "node" | "go";
type EventType = "error" | "log" | "metric" | "trace";
type IntegrationView = "instrument" | "telemetry";
type SignalView = "arrivals" | "architecture";
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
  const [integrationView, setIntegrationView] =
    useState<IntegrationView>("instrument");
  const [integrationDirection, setIntegrationDirection] = useState(1);
  const [signalView, setSignalView] = useState<SignalView>("arrivals");
  const [signalDirection, setSignalDirection] = useState(1);
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

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(samples[tab]);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const selectIntegrationView = (view: IntegrationView) => {
    if (view === integrationView) return;
    setIntegrationDirection(view === "telemetry" ? 1 : -1);
    setIntegrationView(view);
  };

  const selectSignalView = (view: SignalView) => {
    if (view === signalView) return;
    setSignalDirection(view === "architecture" ? 1 : -1);
    setSignalView(view);
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
            <button onClick={() => scrollToSection("product")}>Product</button>
            <button onClick={() => scrollToSection("integrate")}>Docs</button>
            <button onClick={() => scrollToSection("signals")}>Signals</button>
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
            <div className="mt-8 flex items-center gap-5">
              <button
                className="pg-action pg-action-primary"
                onClick={() => authenticate("signup")}
              >
                Start monitoring
              </button>
              <button
                className="flex items-center gap-2 text-xs font-light"
                onClick={() => scrollToSection("integrate")}
              >
                Explore the docs <ArrowRight size={14} />
              </button>
            </div>
            <div className="mt-20 w-full max-w-6xl overflow-hidden rounded-2xl border border-[#e1e1dc] bg-white shadow-[0_22px_50px_rgba(30,30,20,.07)]">
              <Image
                src="/landing/overview.png"
                alt="PulseGuard incident overview"
                className="block w-full"
                width={1200}
                height={630}
              />
            </div>
          </div>
        </section>

        <section
          id="integrate"
          className="pg-shell overflow-hidden border-b border-[#e4e4df] px-5 py-20"
        >
          <div className="w-full">
            <div className="mb-14 flex justify-center">
              <div className="inline-flex rounded-lg border border-[#dfdfda] bg-white/70 p-1 dark:border-[#3b3b3b] dark:bg-[#121212]">
                {(
                  [
                    ["instrument", "Request context"],
                    ["telemetry", "Unified telemetry"],
                  ] as const
                ).map(([view, label]) => (
                  <button
                    key={view}
                    onClick={() => selectIntegrationView(view)}
                    className="relative rounded-md px-4 py-2 text-[11px] font-medium text-[#777772] dark:text-neutral-400"
                  >
                    {integrationView === view && (
                      <motion.span
                        layoutId="integration-tab"
                        className="absolute inset-0 rounded-md bg-[#ff5a1f]"
                        transition={{
                          type: "spring",
                          stiffness: 420,
                          damping: 34,
                        }}
                      />
                    )}
                    <span
                      className={
                        integrationView === view
                          ? "relative z-10 text-[#171716]"
                          : "relative z-10"
                      }
                    >
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="mx-auto max-w-6xl overflow-hidden">
              <motion.div
                className="flex w-[200%]"
                animate={{
                  x: integrationView === "instrument" ? "0%" : "-50%",
                }}
                transition={{
                  type: "spring",
                  stiffness: 155,
                  damping: 25,
                  mass: 0.85,
                }}
              >
                <div className="flex w-1/2 min-h-[620px] items-center px-4 sm:px-6 lg:px-8">
                  <div className="w-full grid items-center gap-8 lg:gap-16 xl:gap-20 lg:grid-cols-[.8fr_1.2fr]">
                    <div>
                      <p className="pg-label">Instrument once</p>
                      <h2 className="mt-5 text-[clamp(2.8rem,4.5vw,5rem)] font-semibold leading-[.95] tracking-[-.065em]">
                        Follow the request everywhere it goes.
                      </h2>
                      <p className="mt-7 max-w-md leading-7 text-[#73736e]">
                        Start with a few lines. PulseGuard handles the context
                        that makes every event useful.
                      </p>
                    </div>
                    <div className="overflow-hidden rounded-xl border shadow-[0_24px_65px_rgba(20,20,10,.06)] border-[#3b3b3b] bg-[#121212]">
                      <div className="flex min-h-[72px] items-center border-b border-[#3b3b3b]">
                        <div className="flex h-full flex-1 items-center overflow-x-auto px-3">
                          {(["react", "node", "go"] as Tab[]).map((item) => (
                            <button
                              key={item}
                              className={clsx(
                                tab === item
                                  ? "font-medium text-[#f5f5f5]"
                                  : "text-neutral-400 hover:text-neutral-200",
                                "relative flex shrink-0 items-center gap-2 px-5 py-3 text-xs rounded-full transition-colors duration-200",
                              )}
                              onClick={() => setTab(item)}
                            >
                              {tab === item && (
                                <motion.div
                                  layoutId="active-tab-pill"
                                  className="absolute inset-0 rounded-full border border-[#303030] bg-[#1c1c1c] shadow-[0_5px_14px_rgba(30,30,20,.08)]"
                                  transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 30,
                                  }}
                                />
                              )}
                              <span
                                className={clsx(
                                  "relative z-10 grid size-4 place-items-center rounded-full text-[8px] transition-colors duration-200",
                                  tab === item
                                    ? "bg-[#ff5a1f] text-[#171716]"
                                    : "border border-current",
                                )}
                              >
                                {item === "react"
                                  ? "R"
                                  : item === "node"
                                    ? "N"
                                    : "G"}
                              </span>
                              <span className="relative z-10">
                                {item === "react"
                                  ? "React / Next.js"
                                  : item === "node"
                                    ? "Node.js"
                                    : "Go"}
                              </span>
                            </button>
                          ))}
                        </div>
                        <button
                          className="mr-4 flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-xs border-[#3b3b3b] bg-[#121212] text-neutral-300"
                          onClick={copy}
                        >
                          {copied ? (
                            <Check size={14} />
                          ) : (
                            <Clipboard size={14} />
                          )}
                          {copied ? "Copied" : "Copy"}
                        </button>
                      </div>
                      <pre className="min-h-[280px] overflow-x-auto p-7 font-mono text-xs leading-7 text-neutral-300 sm:p-10">
                        {samples[tab]}
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="flex w-1/2 min-h-[620px] items-center px-4 sm:px-6 lg:px-8">
                  <div className="w-full grid items-center gap-8 lg:gap-16 xl:gap-20 lg:grid-cols-[.7fr_1.3fr]">
                    <div>
                      <p className="pg-label">Pipeline in motion</p>
                      <h2 className="mt-5 text-[clamp(2.8rem,4.5vw,5rem)] font-semibold leading-[.95] tracking-[-.065em]">
                        Unified telemetry for modern cloud infrastructure.
                      </h2>
                      <p className="mt-7 max-w-md leading-7 text-[#73736e]">
                        Generate logs, traces, and metrics in one flow. The
                        collector batches each signal and routes it to the tools
                        your team already understands.
                      </p>
                    </div>
                    <PipelineSandbox />
                  </div>
                </div>
              </motion.div>
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
              <Image
                src={`/landing/${dashboardScreens[activeScreen]}.png`}
                alt={`${dashboardScreens[activeScreen]} dashboard preview`}
                className="block w-full transition-opacity duration-500"
                width={1200}
                height={630}
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
          id="signals"
          className="pg-shell overflow-hidden border-b border-[#e4e4df] bg-transparent dark:bg-[#090909]"
          style={{
            backgroundColor: theme === "dark" ? "#090909" : "transparent",
          }}
        >
          <div className="px-5 py-20">
            <div className="mx-auto mb-14 flex max-w-6xl justify-center">
              <div className="inline-flex rounded-lg border border-[#dfdfda] bg-white/70 p-1 dark:border-[#3b3b3b] dark:bg-[#121212]">
                {(
                  [
                    ["arrivals", "See what arrives"],
                    ["architecture", "Follow every signal"],
                  ] as const
                ).map(([view, label]) => (
                  <button
                    key={view}
                    onClick={() => selectSignalView(view)}
                    className="relative rounded-md px-4 py-2 text-[11px] font-medium text-[#777772] dark:text-neutral-400"
                  >
                    {signalView === view && (
                      <motion.span
                        layoutId="signal-tab"
                        className="absolute inset-0 rounded-md bg-[#ff5a1f]"
                        transition={{
                          type: "spring",
                          stiffness: 420,
                          damping: 34,
                        }}
                      />
                    )}
                    <span
                      className={
                        signalView === view
                          ? "relative z-10 text-[#171716]"
                          : "relative z-10"
                      }
                    >
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="mx-auto max-w-6xl overflow-hidden">
              <motion.div
                className="flex w-[200%]"
                animate={{ x: signalView === "arrivals" ? "0%" : "-50%" }}
                transition={{
                  type: "spring",
                  stiffness: 155,
                  damping: 25,
                  mass: 0.85,
                }}
              >
                <div className="flex w-1/2 min-h-[680px] items-center">
                  <div className="mx-auto w-full max-w-5xl">
                    <div className="text-center">
                      <p className="pg-label">Test the signal</p>
                      <h2 className="mt-4 text-[clamp(2.7rem,5vw,5.5rem)] font-semibold tracking-[-.065em] leading-[.95]">
                        See what arrives.
                      </h2>
                      <p className="mx-auto mt-4 max-w-lg text-[#73736e]">
                        Generate a signal and inspect the context PulseGuard
                        keeps with it.
                      </p>
                    </div>
                    <div className="mt-7 flex flex-wrap justify-center gap-x-7 gap-y-3">
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
                      className="mt-10 h-[280px] overflow-y-auto rounded-xl border border-[#dfdfda] bg-transparent p-6 font-mono text-[11px] text-[#4b4b47] dark:border-[#262626] dark:bg-[#101010] dark:text-neutral-300"
                      style={{
                        backgroundColor:
                          theme === "dark" ? "#101010" : "#ffffff",
                        borderColor: theme === "dark" ? "#262626" : "#dfdfda",
                      }}
                    >
                      {feed.length === 0 ? (
                        <div className="grid h-full place-items-center text-center text-[#777772] dark:text-neutral-500">
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
                              className="border-b border-[#e8e8e3] py-4 last:border-0 dark:border-neutral-800"
                            >
                              <div className="mb-2 flex justify-between">
                                <span className="text-[#ff5a1f]">
                                  {item.type.toUpperCase()}
                                </span>
                                <span className="text-[#8a8a85] dark:text-neutral-600">
                                  {item.timestamp}
                                </span>
                              </div>
                              <pre className="text-[#777772] dark:text-neutral-500">
                                {item.payload}
                              </pre>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex w-1/2 min-h-[680px] items-center">
                  <div className="mx-auto w-full max-w-6xl">
                    <ArchitectureGraph />
                  </div>
                </div>
              </motion.div>
            </div>
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

      <footer className="flex min-h-screen flex-col overflow-hidden bg-black text-white">
        <div className="relative h-[48vh] min-h-[300px] w-full overflow-hidden bg-black">
          <Image
            src="/landing/swan.jpg"
            alt="Swan on dark water"
            className="h-full w-full object-cover object-center"
            fill
            priority
            loading="eager"
          />
        </div>
        <div
          aria-hidden="true"
          className="relative select-none whitespace-nowrap px-3 text-center text-[17vw] font-semibold leading-none tracking-[-.1em] text-white/[0.07]"
        >
          PULSEGUARD
          <div className="absolute inset-2 right-3 top-3 select-none whitespace-nowrap px-3 text-center text-[17vw] font-semibold leading-none tracking-[-.1em] text-white/20">
            PULSEGUARD
          </div>
        </div>

        <div className="mt-5 px-6 pb-10 sm:px-12">
          <div className="grid gap-10 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="scale-[.84] origin-left invert dark:invert-0">
                <PulseGuardLogo />
              </div>
              <p className="mt-5 max-w-sm text-[11px] leading-relaxed text-neutral-400">
                Open-source, developer-first observability pipeline for modern
                distributed web assets. Standardized on OpenTelemetry, Loki,
                Tempo, and Prometheus.
              </p>
              <div className="mt-5 flex gap-3">
                <a
                  href="mailto:chimezieinnocent39@gmail.com"
                  target="_blank"
                  rel="noreferrer"
                  className="grid size-9 place-items-center rounded-lg border border-[#303030] bg-[#151515] text-neutral-400 hover:text-white"
                >
                  <HugeiconsIcon
                    icon={Mail01Icon}
                    size={16}
                    strokeWidth={1.5}
                  />
                </a>
                <a
                  href="https://github.com/Vic-Orlands/pulseguard-app"
                  target="_blank"
                  rel="noreferrer"
                  className="grid size-9 place-items-center rounded-lg border border-[#303030] bg-[#151515] text-neutral-400 hover:text-white"
                >
                  <HugeiconsIcon
                    icon={GithubIcon}
                    size={16}
                    strokeWidth={1.5}
                  />
                </a>
                <a
                  href="https://x.com/MezieIV"
                  target="_blank"
                  rel="noreferrer"
                  className="grid size-9 place-items-center rounded-lg border border-[#303030] bg-[#151515] text-neutral-400 hover:text-white"
                >
                  <HugeiconsIcon
                    icon={NewTwitterIcon}
                    size={16}
                    strokeWidth={1.5}
                  />
                </a>
                <a
                  href="https://www.linkedin.com/in/victor-innocent/"
                  target="_blank"
                  rel="noreferrer"
                  className="grid size-9 place-items-center rounded-lg border border-[#303030] bg-[#151515] text-neutral-400 hover:text-white"
                >
                  <HugeiconsIcon
                    icon={Linkedin02Icon}
                    size={16}
                    strokeWidth={1.5}
                  />
                </a>
              </div>
            </div>
            <div className="md:col-span-1 md:ml-auto">
              <p className="font-mono text-[9px] uppercase tracking-wider text-neutral-500">
                Platform sections
              </p>
              <div className="mt-4 space-y-3 text-[11px] text-neutral-400">
                <button
                  onClick={() => {
                    scrollToSection("signals");
                    setSignalView("architecture");
                  }}
                  className="block text-left hover:text-white"
                >
                  Topology architecture
                </button>
                <button
                  onClick={() => scrollToSection("signals")}
                  className="block text-left hover:text-white"
                >
                  Metrics, logs & traces sandbox
                </button>
                <button
                  onClick={() => scrollToSection("integrate")}
                  className="block text-left hover:text-white"
                >
                  Configuration explorer
                </button>
                <button
                  onClick={() => scrollToSection("faq")}
                  className="block text-left hover:text-white"
                >
                  Frequently asked questions
                </button>
                <p className="mt-4 text-[10px] leading-relaxed text-neutral-500 w-sm">
                  OpenTelemetry is a registered trademark of The Linux
                  Foundation. Backends and templates are released under Apache
                  2.0 licenses.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-10 flex flex-col justify-between gap-4 border-t border-[#303030] pt-6 text-xs text-neutral-500 sm:flex-row">
            <span>
              © {new Date().getFullYear()} PulseGuard. All rights reserved.
            </span>
            <div className="flex gap-3">
              <span>Privacy policy</span>
              <span>•</span>
              <span>Terms of service</span>
              <span>•</span>
              <span className="font-mono text-[10px]">
                Built for Developers
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
