"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  {
    question: "What is OpenTelemetry (OTel), and how does PulseGuard use it?",
    answer:
      "OpenTelemetry is a vendor-neutral standard for collecting logs, traces, and metrics. PulseGuard integrates with OTel SDKs in your frontend and backend services, then routes the captured data through its collector into structured log, trace, and metric pipelines.",
  },
  {
    question:
      "Will adding logging and tracing slow down my production application?",
    answer:
      "PulseGuard buffers telemetry and sends it in non-blocking micro-batches. If a network interruption occurs, the local buffer sheds older logs gracefully so your application can preserve its core CPU and memory resources.",
  },
  {
    question: "How do logs link directly with distributed traces?",
    answer:
      "PulseGuard propagates trace context through your services and attaches the trace identifier to the relevant log records. That correlation lets you move from a timeout line to its full request waterfall without manually joining separate systems.",
  },
  {
    question: "Can I deploy the OpenTelemetry and Grafana stack on Kubernetes?",
    answer:
      "Yes. The collector, Loki, Tempo, Prometheus, and Grafana are containerized and can be deployed on a managed cluster with standard Helm charts or Docker Compose templates.",
  },
  {
    question: "Do I have to write custom configurations for Loki and Tempo?",
    answer:
      "No. PulseGuard provides tested collector and data-source configuration so the common pipelines and correlations are already in place when you begin instrumenting your services.",
  },
];

export function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="pg-shell border-b border-[#e4e4df] dark:border-[#dfdfda] bg-transparent px-5 py-16 sm:py-24 lg:py-28 dark:bg-[#090909] sm:px-10"
    >
      <div className="mx-auto max-w-4xl">
        <div className="mx-auto mb-12 max-w-4xl text-center">
          <h2 className="mx-auto max-w-4xl text-[clamp(3rem,6vw,6.4rem)] font-semibold leading-[.93] tracking-[-.075em]">
            Frequently asked questions.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm font-light leading-6 text-[#73736e]">
            Everything you need to know about context propagation,
            instrumentation, and the observability stack.
          </p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className="overflow-hidden rounded-xl border border-[#dfdfda] bg-transparent transition-colors hover:border-[#b9b9b3] dark:border-[#3b3b3b] dark:bg-[#121212] dark:hover:border-[#5a5a5a]"
              >
                <button
                  className="flex w-full items-center justify-between gap-6 px-5 py-5 text-left"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span className="text-sm font-medium text-[#272725] dark:text-white">
                    {faq.question}
                  </span>
                  <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-[#dfdfda] text-[#777772] dark:border-[#3b3b3b] dark:text-[#a3a3a3]">
                    {isOpen ? (
                      <ChevronUp size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    )}
                  </span>
                </button>
                <div
                  className={
                    isOpen
                      ? "grid grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-out"
                      : "grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out"
                  }
                >
                  <div className="overflow-hidden">
                    <div className="border-t border-[#e8e8e3] px-5 pb-5 pt-4 text-sm font-light leading-6 text-[#73736e] dark:border-[#303030] dark:text-[#a3a3a3]">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
