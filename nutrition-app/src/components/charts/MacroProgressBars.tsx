import { Progress } from "@/components/ui/progress";

type MacroRow = { label: string; consumed: number; target: number; unit: string };

export function MacroProgressBars({ rows }: { rows: MacroRow[] }) {
  return (
    <div className="flex flex-col gap-3">
      {rows.map((row) => {
        const pct = row.target > 0 ? (row.consumed / row.target) * 100 : 0;
        const over = pct > 100;
        return (
          <div key={row.label}>
            <div className="mb-1 flex items-baseline justify-between text-sm">
              <span className="font-medium">{row.label}</span>
              <span className="text-muted-foreground">
                {Math.round(row.consumed)} / {Math.round(row.target)} {row.unit}
              </span>
            </div>
            <Progress
              value={pct}
              indicatorClassName={over ? "bg-warning" : undefined}
            />
          </div>
        );
      })}
    </div>
  );
}
