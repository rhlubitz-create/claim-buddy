import { cn } from "@/lib/utils";
import type { Claim } from "@/data/claims";
import { getConfidenceBreakdown } from "@/data/claims";
import {
  AlertTriangle,
  ArrowLeft,
  Info,
  Layers,
  RefreshCw,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

type Props = {
  claim: Claim;
  onBack: () => void;
};

export function ConfidenceBreakdown({ claim, onBack }: Props) {
  const {
    overall,
    rolledUp,
    lineContribs,
    multiplier,
    multiplierLabel,
    multiplierDetail,
    activeFlags,
  } = getConfidenceBreakdown(claim);
  const level =
    overall >= 80 ? "High confidence" : overall >= 60 ? "Moderate confidence" : "Low confidence";
  const multiplierPct = Math.round(multiplier * 100);

  return (
    <main className="flex-1 flex flex-col bg-card overflow-hidden min-w-0">
      {/* Header */}
      <div className="px-6 h-14 border-b border-border flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-xs flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-secondary"
          >
            <ArrowLeft className="size-3.5" />
            Back to claim
          </button>
          <span className="text-border">/</span>
          <h1 className="text-base font-semibold tracking-tight">Confidence Breakdown</h1>
          <span className="text-xs font-mono text-muted-foreground">#{claim.id}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8 space-y-8">
          {/* Score hero */}
          <section className="flex items-start gap-8 pb-6 border-b border-border">
            <DonutChart score={overall} size={140} strokeWidth={12} />
            <div className="flex-1 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Overall AI Confidence
              </div>
              <div className="text-5xl font-bold tracking-tight">{overall}%</div>
              <div className="text-base font-medium text-foreground/80">{level}</div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xl pt-2">
                Two-step calculation: roll up the per-line confidences into a repair-plan
                average, then apply a claim-level consistency multiplier driven by active
                flags.
              </p>
            </div>
          </section>

          {/* Active flag callout */}
          {activeFlags.length > 0 && (
            <section className="bg-warning/10 border border-warning/25 rounded-md p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="size-5 text-warning-foreground flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    Consistency multiplier is suppressing this score
                  </p>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    Rolled-up line confidence is{" "}
                    <span className="font-semibold">{rolledUp}%</span>, but a{" "}
                    <span className="font-semibold">{multiplierLabel.toLowerCase()}</span>{" "}
                    applies a <span className="font-semibold">×{multiplier.toFixed(2)}</span>{" "}
                    multiplier — dropping the total to {overall}%. Resolve the flag in the
                    claim view to reassess.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Step 1: Line rollup */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center size-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold">
                1
              </span>
              <h2 className="text-sm font-semibold">Roll up line items</h2>
              <span className="text-xs text-muted-foreground">
                Simple average of every repair action's confidence
              </span>
            </div>
            <div className="border border-border rounded-md bg-card overflow-hidden">
              <div className="divide-y divide-border">
                {lineContribs.map((l) => (
                  <LineRow key={l.id} action={l.action} score={l.confidence} />
                ))}
              </div>
              <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-t border-border">
                <div className="flex items-center gap-2">
                  <Layers className="size-4 text-foreground/70" />
                  <span className="text-sm font-semibold">
                    Rolled-up repair-plan confidence
                  </span>
                </div>
                <span className="text-lg font-bold tabular-nums">{rolledUp}%</span>
              </div>
            </div>
          </section>

          {/* Step 2: Consistency multiplier */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center size-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold">
                2
              </span>
              <h2 className="text-sm font-semibold">
                Apply claim-level consistency multiplier
              </h2>
            </div>
            <div
              className={cn(
                "border rounded-md p-4 flex items-start gap-4",
                activeFlags.length === 0
                  ? "border-success/30 bg-success/5"
                  : multiplier <= 0.7
                    ? "border-destructive/30 bg-destructive/5"
                    : "border-warning/30 bg-warning/5",
              )}
            >
              <ShieldAlert className="size-5 text-foreground/70 flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold">{multiplierLabel}</span>
                  <span className="text-lg font-bold tabular-nums">
                    ×{multiplier.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {multiplierDetail}
                </p>
                <p className="text-[11px] text-muted-foreground pt-1">
                  Severity-mismatch flags apply ×0.85; vehicle or description mismatches apply
                  ×0.65. With no active flags the multiplier is ×1.00.
                </p>
              </div>
            </div>
          </section>

          {/* Final calculation */}
          <section className="bg-muted/40 border border-border rounded-md p-5 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <h2 className="text-sm font-semibold">Final calculation</h2>
            </div>
            <div className="font-mono text-xs text-foreground/80 leading-relaxed">
              <div>
                Rolled-up line avg ({rolledUp}%) × Consistency multiplier (
                {multiplier.toFixed(2)}) = {(rolledUp * multiplier).toFixed(1)}% → rounded to{" "}
                <span className="font-semibold text-foreground">{overall}%</span>
              </div>
            </div>
          </section>

          {/* Footer note */}
          <div className="flex items-center justify-between pt-2 pb-8 border-t border-border text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 pt-3">
              <RefreshCw className="size-3" />
              Recalculates on each agent action (override, flag review, new photo).
            </span>
            <span className="pt-3 flex items-center gap-1 text-muted-foreground">
              <Info className="size-3" />
              Multiplier × {multiplierPct}%
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}

function LineRow({ action, score }: { action: string; score: number }) {
  const tone =
    score >= 80
      ? { text: "text-success", bar: "bg-success" }
      : score >= 50
        ? { text: "text-warning-foreground", bar: "bg-chart-1" }
        : { text: "text-destructive", bar: "bg-destructive" };
  return (
    <div className="px-4 py-3 flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{action}</div>
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mt-1.5">
          <div className={cn("h-full rounded-full", tone.bar)} style={{ width: `${score}%` }} />
        </div>
      </div>
      <span className={cn("text-sm font-mono font-semibold tabular-nums", tone.text)}>
        {score}%
      </span>
    </div>
  );
}

function DonutChart({
  score,
  size = 140,
  strokeWidth = 12,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;
  const color =
    score >= 80 ? "var(--success)" : score >= 50 ? "var(--chart-1)" : "var(--destructive)";

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="flex-shrink-0"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--border)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${dash} ${circumference - dash}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x={size / 2}
        y={size / 2}
        dominantBaseline="middle"
        textAnchor="middle"
        style={{ fill: "var(--foreground)", fontSize: "26px", fontWeight: 700 }}
      >
        {score}%
      </text>
    </svg>
  );
}