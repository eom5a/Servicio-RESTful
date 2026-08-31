"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from "recharts";
import { format } from "date-fns";

export type WeightPoint = { date: string; weightKg: number | null; bodyFatPercent: number | null };

export function WeightTrendChart({
  data,
  goalBodyFatPct,
}: {
  data: WeightPoint[];
  goalBodyFatPct?: number | null;
}) {
  const chartData = data.map((d) => ({
    ...d,
    label: format(new Date(d.date), "d MMM"),
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          minTickGap={24}
        />
        <YAxis
          yAxisId="fat"
          domain={["dataMin - 2", "dataMax + 2"]}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          width={32}
        />
        <Tooltip
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(value, name) => [
            name === "bodyFatPercent" ? `${value}%` : `${value} kg`,
            name === "bodyFatPercent" ? "% grasa" : "Peso",
          ]}
        />
        {goalBodyFatPct != null && (
          <ReferenceLine
            yAxisId="fat"
            y={goalBodyFatPct}
            stroke="var(--primary)"
            strokeDasharray="4 4"
            label={{ value: `Objetivo ${goalBodyFatPct}%`, fontSize: 10, fill: "var(--primary)", position: "insideTopRight" }}
          />
        )}
        <Line
          yAxisId="fat"
          type="monotone"
          dataKey="bodyFatPercent"
          stroke="var(--primary)"
          strokeWidth={2}
          dot={false}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
