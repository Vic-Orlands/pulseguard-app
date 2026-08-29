"use client";

import { useMemo, useState } from "react";
import {
  eachDayOfInterval,
  endOfWeek,
  endOfYear,
  format,
  startOfWeek,
  startOfYear,
} from "date-fns";

type HeatmapView = "daily" | "weekly" | "cumulative";

export function SessionHeatmap({
  timestamps,
}: {
  timestamps: Array<string | number | Date>;
}) {
  const [view, setView] = useState<HeatmapView>("daily");
  const year = new Date().getFullYear();
  const start = startOfYear(new Date(year, 0, 1));
  const end = endOfYear(new Date(year, 0, 1));

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    timestamps.forEach((value) => {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return;
      if (date.getFullYear() !== year) return;
      const key = format(date, "yyyy-MM-dd");
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return map;
  }, [timestamps, year]);

  const weeks = useMemo(() => {
    const gridStart = startOfWeek(start, { weekStartsOn: 0 });
    const gridEnd = endOfWeek(end, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
    const columns: Array<Array<{ date: Date; value: number; inYear: boolean }>> = [];
    let week: Array<{ date: Date; value: number; inYear: boolean }> = [];
    days.forEach((day) => {
      const inYear = day.getFullYear() === year;
      const key = format(day, "yyyy-MM-dd");
      let value = inYear ? (counts.get(key) ?? 0) : 0;
      if (view === "weekly") {
        value = value > 0 ? 1 : 0;
      }
      week.push({ date: day, value, inYear });
      if (week.length === 7) {
        columns.push(week);
        week = [];
      }
    });
    if (view === "cumulative") {
      let running = 0;
      columns.forEach((col) => {
        col.forEach((cell) => {
          if (!cell.inYear) return;
          running += cell.value;
          cell.value = running;
        });
      });
    }
    return columns;
  }, [counts, start, end, view, year]);

  const max = Math.max(
    1,
    ...weeks.flatMap((week) => week.filter((cell) => cell.inYear).map((cell) => cell.value)),
  );

  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, month) => {
      const index = weeks.findIndex((week) =>
        week.some(
          (cell) =>
            cell.inYear &&
            cell.date.getMonth() === month &&
            cell.date.getDate() <= 7,
        ),
      );
      return {
        label: format(new Date(year, month, 1), "MMM"),
        index: index === -1 ? month : index,
      };
    });
  }, [weeks, year]);

  const tone = (value: number, inYear: boolean) => {
    if (!inYear) return "bg-transparent";
    if (value <= 0) return "bg-zinc-200 dark:bg-zinc-600";
    const ratio = value / max;
    if (ratio < 0.25) return "bg-zinc-400 dark:bg-zinc-500";
    if (ratio < 0.5) return "bg-zinc-500 dark:bg-zinc-700";
    if (ratio < 0.75) return "bg-zinc-700 dark:bg-zinc-800";
    return "bg-zinc-950 dark:bg-black";
  };

  return (
    <div className="rounded-lg bg-pg-group p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="text-xs font-semibold text-pg-text">Session activity</h3>
        <div className="flex items-center gap-3 text-xs text-pg-muted">
          {(["daily", "weekly", "cumulative"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setView(item)}
              className={`bg-transparent p-0 capitalize transition-colors ${
                view === item ? "text-pg-text" : "hover:text-pg-text"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="w-full">
        <div className="flex w-full gap-[2px]">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex min-w-0 flex-1 flex-col gap-[2px]">
              {week.map((cell) => (
                <div
                  key={cell.date.toISOString()}
                  title={
                    cell.inYear
                      ? `${format(cell.date, "MMM d, yyyy")}: ${cell.value}`
                      : undefined
                  }
                  className={`h-[9px] w-full rounded-[1px] ${tone(cell.value, cell.inYear)}`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="relative mt-1.5 h-3 text-[10px] text-pg-subtle">
          {months.map((month) => (
            <span
              key={month.label}
              className="absolute"
              style={{ left: `${(month.index / Math.max(weeks.length, 1)) * 100}%` }}
            >
              {month.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
