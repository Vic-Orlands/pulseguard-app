"use client";

import { useMemo } from "react";
import { PulseChart } from "@/components/dashboard/shared/pulse-chart";

export type ActivityEvent = {
  at: string;
  series: string;
};

const HOURS = 12;
const palette = ["#34d399", "#f87171", "#60a5fa", "#fbbf24"];

export function ActivityChart({
  title,
  events,
  series,
  colors,
}: {
  title: string;
  events: ActivityEvent[];
  series: string[];
  colors?: string[];
}) {
  const swatches = colors ?? palette;
  const chart = useMemo(() => {
    const now = new Date();
    now.setMinutes(0, 0, 0);
    const buckets = Array.from({ length: HOURS }, (_, index) => {
      return new Date(now.getTime() - (HOURS - 1 - index) * 60 * 60 * 1000);
    });
    const counts = series.map(() => buckets.map(() => 0));
    for (const event of events) {
      const time = new Date(event.at).getTime();
      if (Number.isNaN(time)) continue;
      const seriesIndex = series.indexOf(event.series);
      if (seriesIndex < 0) continue;
      const bucketIndex = buckets.findIndex((bucket) => {
        const start = bucket.getTime();
        return time >= start && time < start + 60 * 60 * 1000;
      });
      if (bucketIndex >= 0) {
        counts[seriesIndex][bucketIndex] += 1;
      }
    }
    return {
      categories: buckets.map((bucket) =>
        bucket.toLocaleTimeString([], { hour: "numeric" }),
      ),
      data: series.map((name, index) => ({
        name,
        data: counts[index] ?? [],
      })),
      total: counts.reduce(
        (sum, row) => sum + row.reduce((inner, value) => inner + value, 0),
        0,
      ),
    };
  }, [events, series]);

  return (
    <section className="rounded-xl border border-pg-border bg-pg-group/40 p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xs font-semibold text-pg-text">{title}</h3>
        <div className="flex flex-wrap items-center gap-3">
          {series.map((name, index) => (
            <span
              key={name}
              className="flex items-center gap-1.5 text-[11px] text-pg-muted"
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: swatches[index] ?? palette[0] }}
              />
              {name}
            </span>
          ))}
        </div>
      </div>
      {chart.total === 0 ? (
        <p className="flex h-28 items-center justify-center text-xs text-pg-muted">
          No samples in the last 12 hours.
        </p>
      ) : (
        <PulseChart
          type="area"
          height={160}
          categories={chart.categories}
          series={chart.data}
          colors={swatches}
        />
      )}
    </section>
  );
}
