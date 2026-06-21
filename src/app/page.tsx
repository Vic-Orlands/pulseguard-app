"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "next-themes";
import { PulseGuardLogo } from "@/components/Icons";
import { 
  Sun, 
  Moon, 
  Terminal, 
  Play, 
  Trash2, 
  ArrowRight, 
  Check, 
  Layers,
  Cpu,
  Sparkles,
  GitBranch
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Tab = "react" | "node" | "go";

interface LogItem {
  id: string;
  type: "error" | "log" | "metric" | "trace";
  timestamp: string;
  label: string;
  payload: string;
}

const codeSamples: Record<Tab, string> = {
  react: `// 1. Initialize TelemetryProvider in App Root
import { TelemetryProvider } from "@pulseguard/react";

export default function RootLayout({ children }) {
  return (
    <TelemetryProvider 
      projectId="47e3d5f5-47bf-45d9-ad5c-76af6e3ce9db"
    >
      {children}
    </TelemetryProvider>
  );
}`,
  node: `// 1. Configure OpenTelemetry Node SDK
import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: "https://collector.pulseguard.dev/v1/traces",
  }),
});

sdk.start();`,
  go: `// 1. Initialize Go Observability Pipeline
package main

import (
    "context"
    "github.com/pulseguard/pulseguard-go/otel"
)

func main() {
    ctx := context.Background()
    shutdown, _ := otel.Init(ctx, otel.Config{
        ProjectID: "47e3d5f5-47bf-45d9-ad5c-76af6e3ce9db",
        Endpoint:  "https://collector.pulseguard.dev",
    })
    defer shutdown(ctx)
}`
};

export default function Homepage() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("react");
  const [copied, setCopied] = useState(false);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  const highlightLine = (line: string) => {
    if (line.trim().startsWith("//") || line.trim().startsWith("/*")) {
      return <span className="text-neutral-400 dark:text-neutral-600 italic">{line}</span>;
    }
    
    const words = line.split(/(\s+|\(|\)|\{|\}|\[|\]|\.|,|;|=|")/);
    return (
      <span>
        {words.map((word, i) => {
          const isKeyword = [
            "import", "export", "default", "function", "return", "from", 
            "const", "new", "package", "main", "defer", "func", "struct", "interface"
          ].includes(word);
          
          const isString = word.startsWith("'") || word.startsWith('"') || word.endsWith("'") || word.endsWith('"');
          
          if (isKeyword) {
            return <span key={i} className="font-semibold text-foreground">{word}</span>;
          }
          if (isString) {
            return <span key={i} className="text-neutral-500 dark:text-neutral-400">{word}</span>;
          }
          return <span key={i}>{word}</span>;
        })}
      </span>
    );
  };

  const generateError = () => {
    const errors = [
      {
        name: "TypeError",
        message: "Cannot read properties of null (reading 'user_id')",
        stack: "TypeError: Cannot read properties of null (reading 'user_id')\\n    at UserProfile (src/components/profile.tsx:42:21)\\n    at renderWithHooks (react-dom.development.js:15486:18)"
      },
      {
        name: "ReferenceError",
        message: "stripe is not defined",
        stack: "ReferenceError: stripe is not defined\\n    at handleCheckout (src/app/checkout/page.tsx:84:5)\\n    at HTMLButtonElement.dispatch (jquery.js:5429:10)"
      },
      {
        name: "NetworkError",
        message: "Failed to fetch dashboard telemetry data: 500 Internal Server Error",
        stack: "NetworkError: Failed to fetch dashboard telemetry data: 500\\n    at fetchDashboardData (src/lib/api.ts:12:15)\\n    at async getDashboard (src/app/page.tsx:49:21)"
      }
    ];
    const err = errors[Math.floor(Math.random() * errors.length)];
    return {
      type: "error",
      projectId: "47e3d5f5-47bf-45d9-ad5c-76af6e3ce9db",
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack,
      },
      context: {
        url: typeof window !== "undefined" ? window.location.origin + "/dashboard" : "/dashboard",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "NodeRuntime",
        sessionId: `sess_${Math.random().toString(36).substring(2, 12)}`,
      },
      timestamp: Date.now()
    };
  };

  const generateLog = () => {
    const logs = [
      { level: "info", message: "POST /api/telemetry/session/start 200 OK", duration: "12ms" },
      { level: "warn", message: "DB Connection Pool approaching 80% usage capacity", count: 48 },
      { level: "info", message: "Successfully sync'd cache with Redis store (1,242 keys updated)", duration: "4.8ms" },
      { level: "error", message: "Failed to publish webhook payload to endpoint: timeout (5000ms)", endpoint: "https://webhooks.customer.com/receive" }
    ];
    const item = logs[Math.floor(Math.random() * logs.length)];
    return {
      timestamp: new Date().toISOString(),
      level: item.level,
      message: item.message,
      attributes: {
        "service.name": "pulseguard-backend",
        "service.version": "1.0.0-beta",
        "environment": "production",
        "trace_id": Math.random().toString(16).substring(2, 18) + Math.random().toString(16).substring(2, 18),
        "span_id": Math.random().toString(16).substring(2, 18),
        ...item
      }
    };
  };

  const generateMetric = () => {
    const metrics = [
      { name: "http.server.duration", type: "histogram", value: Math.random() * 200 + 10, unit: "ms" },
      { name: "process.runtime.go.goroutines", type: "updowncounter", value: Math.floor(Math.random() * 100) + 120, unit: "1" },
      { name: "db.client.connections.active", type: "sum", value: Math.floor(Math.random() * 20) + 5, unit: "1" },
      { name: "system.cpu.utilization", type: "gauge", value: Math.random() * 0.4 + 0.1, unit: "percent" }
    ];
    const metric = metrics[Math.floor(Math.random() * metrics.length)];
    return {
      name: metric.name,
      type: metric.type,
      value: metric.value,
      unit: metric.unit,
      attributes: {
        "host.name": "prod-k8s-node-2",
        "host.arch": "amd64",
        "os.type": "linux"
      },
      timestamp: Date.now()
    };
  };

  const generateTrace = () => {
    const traceId = Math.random().toString(16).substring(2, 18) + Math.random().toString(16).substring(2, 18);
    const rootSpanId = Math.random().toString(16).substring(2, 18);
    const childSpanId = Math.random().toString(16).substring(2, 18);
    return {
      traceId,
      spans: [
        {
          name: "HTTP GET /api/dashboard",
          spanId: rootSpanId,
          parentSpanId: null,
          kind: "SERVER",
          startTimeUnixNano: Date.now() * 1000000,
          endTimeUnixNano: (Date.now() + 45) * 1000000,
          attributes: {
            "http.method": "GET",
            "http.status_code": 200,
            "http.user_agent": typeof navigator !== "undefined" ? navigator.userAgent : "Mozilla/5.0"
          }
        },
        {
          name: "DB SELECT users",
          spanId: childSpanId,
          parentSpanId: rootSpanId,
          kind: "CLIENT",
          startTimeUnixNano: (Date.now() + 5) * 1000000,
          endTimeUnixNano: (Date.now() + 22) * 1000000,
          attributes: {
            "db.system": "postgresql",
            "db.statement": "SELECT * FROM users WHERE id = ?"
          }
        }
      ]
    };
  };

  const handleSimulate = (type: "error" | "log" | "metric" | "trace") => {
    let payloadObj: any = {};
    let label = "";
    
    switch (type) {
      case "error":
        payloadObj = generateError();
        label = `React Client SDK Error Reporting`;
        break;
      case "log":
        payloadObj = generateLog();
        label = `Loki Standard Log Stream`;
        break;
      case "metric":
        payloadObj = generateMetric();
        label = `Prometheus Metric Gauge`;
        break;
      case "trace":
        payloadObj = generateTrace();
        label = `Tempo OTLP Span Collection`;
        break;
    }
    
    const newLog: LogItem = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      timestamp: new Date().toLocaleTimeString(),
      label,
      payload: JSON.stringify(payloadObj, null, 2)
    };
    
    setLogs((prev) => [...prev, newLog]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-250">
      {/* Header Nav */}
      <header className="w-full border-b border-border bg-card/30 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-12 flex items-center justify-between">
          <div className="flex items-center scale-90 -ml-4">
            <PulseGuardLogo />
          </div>
          
          <div className="flex items-center gap-4">
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors font-mono font-medium hidden sm:inline-block">Docs</a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-xs text-muted-foreground hover:text-foreground transition-colors font-mono font-medium hidden sm:inline-block">GitHub</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors font-mono font-medium hidden sm:inline-block">Changelog</a>
            
            <span className="h-3 w-[1px] bg-border hidden sm:inline-block" />
            
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-accent transition-colors cursor-pointer"
                aria-label="Toggle Theme"
              >
                {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              </button>
            )}
            
            {user ? (
              <button
                onClick={() => router.push("/projects")}
                className="text-xs font-mono font-semibold px-3 py-1.5 rounded-md border border-border bg-foreground text-background hover:opacity-90 transition-opacity cursor-pointer"
              >
                Go to Dashboard
              </button>
            ) : (
              <button
                onClick={() => {
                  localStorage.setItem("auth_mode", "login");
                  router.push("/signin");
                }}
                className="text-xs font-mono font-semibold px-3 py-1.5 rounded-md border border-border bg-foreground text-background hover:opacity-90 transition-opacity cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main content wrapper */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 flex flex-col gap-12 py-16">
        
        {/* Hero Section */}
        <section className="text-center flex flex-col items-center justify-center gap-6 py-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-border bg-card text-[10px] uppercase font-mono tracking-wider text-muted-foreground shadow-xs select-none">
            <span className="h-1.5 w-1.5 rounded-full bg-foreground animate-pulse" />
            v1.0.0-beta • OpenTelemetry Native
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tighter text-foreground leading-[1.05] max-w-3xl">
            Full-stack observability for modern cloud applications.
          </h1>
          
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed font-mono">
            Integrate structured logging, distributed tracing, and metrics collection into a unified observability pipeline using OpenTelemetry and Grafana's ecosystem.
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            <button
              onClick={() => {
                localStorage.setItem("auth_mode", "signup");
                router.push("/signin");
              }}
              className="text-xs font-mono font-bold px-4 py-2 rounded-md border border-border bg-foreground text-background hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              Get Started Free <ArrowRight className="h-3 w-3" />
            </button>
            <button
              onClick={() => {
                const consoleEl = document.getElementById("telemetry-console-section");
                if (consoleEl) {
                  consoleEl.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="text-xs font-mono font-semibold px-4 py-2 rounded-md border border-border bg-card text-foreground hover:bg-accent transition-all cursor-pointer shadow-xs"
            >
              Live Demo
            </button>
          </div>
        </section>

        {/* Feature Cards Grid (Typographic Minimal List) */}
        <section className="py-6 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-foreground stroke-1.5" />
                <h3 className="text-xs font-bold font-mono tracking-tight text-foreground uppercase">OpenTelemetry Native</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed font-mono">
                Compatible with any OTLP collector, Loki, Prometheus, and Tempo. Pure OpenTelemetry without lock-in.
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5 text-foreground stroke-1.5" />
                <h3 className="text-xs font-bold font-mono tracking-tight text-foreground uppercase">Client-Side Tracker</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed font-mono">
                Ultra-lightweight React client captures exceptions, console warnings, and user sessions asynchronously.
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Cpu className="h-3.5 w-3.5 text-foreground stroke-1.5" />
                <h3 className="text-xs font-bold font-mono tracking-tight text-foreground uppercase">Correlated Pipeline</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed font-mono">
                Track issues front-to-back. Resolve frontend visual bugs directly to server SQL spans and memory logs.
              </p>
            </div>
          </div>
        </section>

        {/* SDK Integration Sandbox */}
        <section className="py-6 border-t border-border">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold font-mono tracking-tight text-foreground uppercase">Integration Blueprint</h2>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">Initialize instrumentation in minutes.</p>
              </div>
              
              <div className="flex bg-accent rounded-md p-0.5 border border-border self-start">
                {(["react", "node", "go"] as Tab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-[10px] font-mono font-medium px-2.5 py-1 rounded transition-all cursor-pointer ${
                      activeTab === tab
                        ? "bg-card text-foreground shadow-xs border border-border/50"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab === "react" ? "React / Next.js" : tab === "node" ? "Node.js" : "Go"}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="border border-border rounded-lg bg-card overflow-hidden shadow-xs">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/40">
                <div className="flex items-center gap-1.5 select-none">
                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-800" />
                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-200 dark:bg-neutral-900" />
                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-100 dark:bg-neutral-950" />
                  <span className="text-[10px] font-mono text-muted-foreground ml-2">
                    {activeTab === "react" ? "layout.tsx" : activeTab === "node" ? "instrumentation.ts" : "main.go"}
                  </span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(codeSamples[activeTab]);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors px-2 py-0.5 rounded border border-border bg-card cursor-pointer"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              
              <pre className="p-4 overflow-x-auto font-mono text-[10px] sm:text-xs text-neutral-800 dark:text-neutral-300 leading-relaxed bg-card max-h-[300px]">
                <code>
                  {codeSamples[activeTab].split("\n").map((line, idx) => (
                    <div key={idx} className="flex">
                      <span className="w-8 select-none text-neutral-400 dark:text-neutral-600 text-right pr-4 text-[10px]">{idx + 1}</span>
                      <span>{highlightLine(line)}</span>
                    </div>
                  ))}
                </code>
              </pre>
            </div>
          </div>
        </section>

        {/* Telemetry simulator */}
        <section id="telemetry-console-section" className="py-6 border-t border-border">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold font-mono tracking-tight text-foreground uppercase">Interactive Telemetry Feed</h2>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">Click an event to dispatch structured OpenTelemetry payloads.</p>
              </div>
              
              <button
                onClick={() => setLogs([])}
                disabled={logs.length === 0}
                className="flex items-center gap-1.5 text-xs font-mono font-semibold px-2.5 py-1 rounded-md border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-50 transition-all cursor-pointer self-start sm:self-auto shadow-xs"
              >
                <Trash2 className="h-3 w-3" /> Clear Console
              </button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => handleSimulate("error")}
                className="flex items-center justify-center gap-2 text-xs font-mono font-medium p-2.5 rounded-lg border border-border bg-card hover:bg-accent transition-all cursor-pointer shadow-xs"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-900 dark:bg-white" />
                Error Event
              </button>
              <button
                onClick={() => handleSimulate("log")}
                className="flex items-center justify-center gap-2 text-xs font-mono font-medium p-2.5 rounded-lg border border-border bg-card hover:bg-accent transition-all cursor-pointer shadow-xs"
              >
                <span className="h-1.5 w-1.5 rounded-full border border-neutral-400 dark:border-neutral-600" />
                Loki Log
              </button>
              <button
                onClick={() => handleSimulate("metric")}
                className="flex items-center justify-center gap-2 text-xs font-mono font-medium p-2.5 rounded-lg border border-border bg-card hover:bg-accent transition-all cursor-pointer shadow-xs"
              >
                <span className="h-1.5 w-1.5 rounded-full border border-dashed border-neutral-400 dark:border-neutral-600" />
                Metric Gauge
              </button>
              <button
                onClick={() => handleSimulate("trace")}
                className="flex items-center justify-center gap-2 text-xs font-mono font-medium p-2.5 rounded-lg border border-border bg-card hover:bg-accent transition-all cursor-pointer shadow-xs"
              >
                <span className="h-1.5 w-1.5 rounded-full border-2 border-double border-neutral-400 dark:border-neutral-600" />
                Tempo Span
              </button>
            </div>
            
            <div className="border border-border rounded-lg bg-[#0a0a0c] overflow-hidden shadow-xs flex flex-col h-[320px]">
              <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-900 bg-[#121215] select-none">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-neutral-700" />
                  <div className="w-2 h-2 rounded-full bg-neutral-800" />
                  <div className="w-2 h-2 rounded-full bg-neutral-900" />
                  <span className="text-[9px] font-mono text-neutral-500 ml-2">
                    pulseguard-telemetry-feed -- active
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-neutral-400 animate-pulse" />
                  <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider">
                    OTLP / HTTP
                  </span>
                </div>
              </div>
              
              <div 
                ref={consoleRef}
                className="flex-1 overflow-y-auto p-4 font-mono text-[10px] text-neutral-300 flex flex-col gap-3 scroll-smooth bg-[#0a0a0c]"
              >
                {logs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-neutral-600 gap-2">
                    <Terminal className="h-5 w-5 stroke-1" />
                    <div className="text-[9px]">No telemetry events dispatched. Click a simulator button to generate OTLP payload trace data.</div>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {logs.map((log) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="flex flex-col gap-1.5 border-b border-neutral-900/60 pb-3 last:border-0 last:pb-0"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase select-none ${
                            log.type === "error"
                              ? "bg-neutral-100 text-neutral-950 border-neutral-100"
                              : log.type === "log"
                              ? "bg-neutral-800 text-neutral-300 border-neutral-700"
                              : log.type === "metric"
                              ? "bg-transparent text-neutral-300 border-dashed border-neutral-700"
                              : "bg-transparent text-neutral-300 border-double border-neutral-700"
                          }`}>
                            {log.type}
                          </span>
                          <span className="text-[9px] text-neutral-400 font-semibold">{log.label}</span>
                          <span className="text-[9px] text-neutral-500 ml-auto">{log.timestamp}</span>
                        </div>
                        
                        <pre className="p-2.5 rounded bg-black/60 overflow-x-auto text-[9px] text-neutral-400 border border-neutral-900 leading-normal max-h-[140px]">
                          <code>{log.payload}</code>
                        </pre>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border bg-card/20 mt-auto">
        <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-muted-foreground text-[10px] font-mono">
            &copy; {new Date().getFullYear()} PulseGuard. All rights reserved.
          </div>
          
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-[10px] text-muted-foreground hover:text-foreground transition-colors font-mono font-medium">GitHub</a>
            <a href="#" className="text-[10px] text-muted-foreground hover:text-foreground transition-colors font-mono font-medium">Docs</a>
            <a href="#" className="text-[10px] text-muted-foreground hover:text-foreground transition-colors font-mono font-medium">Changelog</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
