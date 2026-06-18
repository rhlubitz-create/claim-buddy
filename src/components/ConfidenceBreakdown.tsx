import { cn } from "@/lib/utils";
import type { Claim, ConfidenceMetric } from "@/data/claims";
import { getConfidenceBreakdown } from "@/data/claims";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Camera,
  ClipboardList,
  History,
  Info,
  RefreshCw,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

type Props = {
  claim: Claim;
  onBack: () => void;
};

export function ConfidenceBreakdown({ claim, onBack }: Props) {
  const { metrics, overall } = getConfidenceBreakdown(claim);
  const level =
    overall >= 80 ? "High confidence" : overall >= 60 ? "Moderate confidence" : "Low confidence";

  const withoutFlag = Math.round(
    metrics.reduce(
      (s, m) => s + (m.key === "claimConsistency" ? 85 : m.score) * m.weight,
      0,
    ),
  );

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
                A weighted composite of five signals the model uses to gauge how reliable its
                damage assessment and estimate are for this claim.
              </p>
            </div>
          </section>

          {/* Active flag callout */}
          {claim.flags.length > 0 && (
            <section className="bg-warning/10 border border-warning/25 rounded-md p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="size-5 text-warning-foreground flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    Active flag is suppressing this score
                  </p>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    Claim consistency is penalized because reported severity (
                    <span className="font-semibold">{claim.accident.severity}</span>) does not
                    match photo evidence (cosmetic). Without this flag the score would be{" "}
                    <span className="font-semibold">{withoutFlag}%</span>. Resolve the mismatch
                    in the claim view to reassess.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Metric cards */}
          <section className="space-y-3">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Signal breakdown
            </h2>
            <div className="space-y-3">
              {metrics.map((m) => (
                <MetricCard key={m.key} metric={m} />
              ))}
            </div>
          </section>

          {/* Weighted calculation */}
          <section className="bg-muted/40 border border-border rounded-md p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <h2 className="text-sm font-semibold">Weighted calculation</h2>
            </div>
            <div className="font-mono text-xs text-foreground/80 leading-relaxed space-y-1.5">
              <div>
                {metrics
                  .map((m) => `(${m.score} × ${Math.round(m.weight * 100)}%)`)
                  .join("  +  ")}
              </div>
              <div>
                ={" "}
                {metrics.map((m) => (m.score * m.weight).toFixed(1)).join("  +  ")}
              </div>
              <div>
                ={" "}
                <span className="font-semibold text-foreground">
                  {metrics.reduce((s, m) => s + m.score * m.weight, 0).toFixed(1)}%
                </span>{" "}
                → rounded to{" "}
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
            <button
              type="button"
              className="pt-3 text-primary hover:underline flex items-center gap-1"
            >
              <Info className="size-3" />
              Configure weights
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function MetricCard({ metric }: { metric: ConfidenceMetric }) {
  const tone =
    metric.score >= 80
      ? { text: "text-success", bar: "bg-success" }
      : metric.score >= 50
        ? { text: "text-warning-foreground", bar: "bg-chart-1" }
        : { text: "text-destructive", bar: "bg-destructive" };

  return (
    <div className="border border-border rounded-md p-4 bg-card hover:bg-muted/20 transition-colors">
      <div className="flex items-start gap-4">
        <div className="size-9 rounded-sm bg-muted flex items-center justify-center flex-shrink-0">
          <MetricIcon metricKey={metric.key} className="size-4 text-foreground/70" />
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-foreground">{metric.label}</span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-muted text-muted-foreground">
                Weight {Math.round(metric.weight * 100)}%
              </span>
            </div>
            <span className={cn("text-lg font-bold tabular-nums", tone.text)}>
              {metric.score}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", tone.bar)}
              style={{ width: `${metric.score}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{metric.detail}</p>
        </div>
      </div>
    </div>
  );
}

function MetricIcon({
  metricKey,
  className,
}: {
  metricKey: ConfidenceMetric["key"];
  className?: string;
}) {
  switch (metricKey) {
    case "photoCompleteness":
      return <Camera className={className} />;
    case "damageComplexity":
      return <BarChart3 className={className} />;
    case "repairScope":
      return <ClipboardList className={className} />;
    case "historicalMatch":
      return <History className={className} />;
    case "claimConsistency":
      return <ShieldAlert className={className} />;
  }
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