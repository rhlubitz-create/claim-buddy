import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Claim, EstimateLine, ConfidenceMetric } from "@/data/claims";
import { getConfidenceBreakdown, lineTotal, laborCostOf } from "@/data/claims";
import {
  AlertTriangle,
  CheckCircle2,
  PanelRightOpen,
  Send,
  Info,
  Check,
  Sparkles,
  History,
  ChevronDown,
  FileText,
  PencilLine,
  Bot,
  Camera,
  BarChart3,
  ClipboardList,
  ShieldAlert,
  RefreshCw,
} from "lucide-react";
import { OverrideDialog } from "./OverrideDialog";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { AuditEntry } from "@/data/claims";

function confidencePillStyle(c: number) {
  if (c >= 85) return "bg-success/10 text-success ring-1 ring-success/20";
  if (c >= 65) return "bg-warning/15 text-warning-foreground ring-1 ring-warning/30";
  return "bg-destructive/10 text-destructive ring-1 ring-destructive/20";
}

type Props = {
  claim: Claim;
  railOpen: boolean;
  onOpenRail: () => void;
  onDismissFlag?: (claimId: string, flagIndex: number) => void;
  onAccept?: (claimId: string) => void;
  onSaveOverride?: (claimId: string, lines: EstimateLine[]) => void;
};

export function ClaimDetail({
  claim,
  railOpen,
  onOpenRail,
  onDismissFlag,
  onAccept,
  onSaveOverride,
}: Props) {
  const [overrideOpen, setOverrideOpen] = useState(false);

  const total = claim.estimate.lines.reduce((sum, l) => sum + lineTotal(l), 0);
  const laborTotal = claim.estimate.lines.reduce((s, l) => s + laborCostOf(l), 0);
  const partsTotal = claim.estimate.lines.reduce((s, l) => s + l.partsCost, 0);
  const { metrics, overall } = getConfidenceBreakdown(claim);

  return (
    <main className="flex-1 flex flex-col bg-card overflow-hidden relative min-w-0">
      {/* Header */}
      <div className="px-6 h-14 border-b border-border flex justify-between items-center">
        <div className="flex items-baseline gap-3">
          <h1 className="text-base font-semibold tracking-tight">Claim Review</h1>
          <span className="text-xs font-mono text-muted-foreground">#{claim.id}</span>
        </div>
        <div className="flex items-center gap-2">
          <AuditLogPopover entries={claim.auditLog ?? []} />
          {!railOpen && (
            <button
              onClick={onOpenRail}
              className="text-xs flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-secondary"
            >
              <PanelRightOpen className="size-3.5" />
              Show similar claims
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Section 1: Policyholder + Claim Info + Flags */}
        <section className="space-y-4">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Policyholder & Claim Information
          </h2>

          {/* Flags banner */}
          {claim.flags.length > 0 && (
            <div className="space-y-2">
              {claim.flags.map((f, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-sm bg-destructive/5 border border-destructive/20"
                >
                  <AlertTriangle className="size-4 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-destructive">{f.title}</p>
                    <p className="text-xs text-foreground/80 mt-0.5">{f.detail}</p>
                  </div>
                  {onDismissFlag && (
                    <button
                      onClick={() => {
                        onDismissFlag(claim.id, i);
                        toast.success("Flag marked as reviewed", {
                          description: f.title,
                        });
                      }}
                      className="flex-shrink-0 text-[11px] flex items-center gap-1 px-2 py-1 rounded border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Check className="size-3" />
                      Mark reviewed
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          {claim.flags.length === 0 && (
            <div className="flex items-center gap-2 p-2.5 rounded-sm bg-success/5 border border-success/20">
              <CheckCircle2 className="size-4 text-success flex-shrink-0" />
              <p className="text-xs text-foreground/80">
                No mismatches detected. Photo, vehicle, and severity classification align.
              </p>
            </div>
          )}

          <div className="grid grid-cols-[1.4fr_1fr] gap-6">
            <img
              src={claim.photo}
              alt={`Damage photo for ${claim.id}`}
              loading="lazy"
              width={1024}
              height={640}
              className="w-full aspect-[16/10] object-cover rounded-sm outline-1 -outline-offset-1 outline-black/5 bg-secondary"
            />
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs content-start">
              <Field label="User ID" value={claim.policyholder.userId} mono />
              <Field label="Policyholder" value={claim.policyholder.name} />
              <Field label="Policy #" value={claim.policyholder.policyNumber} mono />
              <Field label="Coverage" value={claim.policyholder.coverage} />
              <Field
                label="Vehicle"
                value={`${claim.vehicle.year} ${claim.vehicle.make} ${claim.vehicle.model}`}
              />
              <Field label="VIN" value={claim.vehicle.vin} mono />
              <Field label="Accident Type" value={claim.accident.type} />
              <Field label="Damage Location" value={claim.accident.damageLocation} />
              <Field label="Damage Type" value={claim.accident.damageType} />
              <Field label="Severity" value={claim.accident.severity} />
              <div className="col-span-2">
                <dt className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                  Description
                </dt>
                <dd className="text-foreground/90 leading-relaxed">
                  {claim.accident.description}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Section 2: AI Estimate */}
        <section className="space-y-3 rounded-md border border-primary/25 bg-primary/[0.04] p-4 ring-1 ring-primary/10">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider ring-1 ring-primary/20">
              <Sparkles className="size-3.5" />
              AI Generated Damage Assessment and Cost Estimates
            </span>
          </div>

          <p className="text-xs text-foreground/80 italic leading-relaxed">
            {claim.estimate.summary}
          </p>

          <div className="border border-border rounded-sm overflow-hidden bg-card">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background border-b border-border text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  <th className="py-2.5 px-4">Repair Action</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4 text-right">Hours</th>
                  <th className="py-2.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1">
                      Rate
                      <TooltipProvider delayDuration={150}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="size-3 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            Regional average labor rate for this repair type, based on a market
                            survey of shops in the policyholder's area — not an AI estimate.
                            Editable to match a specific shop's bid.
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </span>
                  </th>
                  <th className="py-2.5 px-4 text-right">Labor</th>
                  <th className="py-2.5 px-4 text-right">Parts</th>
                  <th className="py-2.5 px-4 text-center">Confidence</th>
                  <th className="py-2.5 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {claim.estimate.lines.map((line) => (
                  <tr key={line.id} className="text-sm">
                    <td className="py-3 px-4">{line.action}</td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">{line.type}</td>
                    <td className="py-3 px-4 text-right font-mono text-xs">
                      <EditedValueCell
                        edited={
                          !!line.overridden &&
                          !!line.override &&
                          line.override.previousLaborHours !== line.laborHours
                        }
                        current={`${line.laborHours}h`}
                        previous={
                          line.override
                            ? `${line.override.previousLaborHours}h`
                            : undefined
                        }
                        override={line.override}
                        field="Labor hours"
                      />
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs">
                      <EditedValueCell
                        edited={
                          !!line.overridden &&
                          !!line.override &&
                          line.override.previousLaborRate !== line.laborRate
                        }
                        current={`$${line.laborRate}/h`}
                        previous={
                          line.override
                            ? `$${line.override.previousLaborRate}/h`
                            : undefined
                        }
                        override={line.override}
                        field="Labor rate"
                      />
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs text-muted-foreground">
                      ${laborCostOf(line).toLocaleString()}
                      <div className="text-[10px] text-muted-foreground/70">
                        {line.laborHours} × ${line.laborRate}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs">
                      {line.partsCost > 0 || (line.override && line.override.previousPartsCost > 0) ? (
                        <EditedValueCell
                          edited={
                            !!line.overridden &&
                            !!line.override &&
                            line.override.previousPartsCost !== line.partsCost
                          }
                          current={`$${line.partsCost.toLocaleString()}`}
                          previous={
                            line.override
                              ? `$${line.override.previousPartsCost.toLocaleString()}`
                              : undefined
                          }
                          override={line.override}
                          field="Parts"
                        />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold",
                          confidencePillStyle(line.confidence),
                        )}
                      >
                        {line.confidence}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium">
                      {line.overridden && line.override ? (
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-warning/15 text-warning-foreground ring-1 ring-warning/30 hover:brightness-95 transition"
                              title="View override audit trail"
                            >
                              <PencilLine className="size-2.5" />
                              ${lineTotal(line).toLocaleString()}
                            </button>
                          </PopoverTrigger>
                          <PopoverContent align="end" className="w-80 text-xs space-y-2">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                                Override audit trail
                              </p>
                              <p className="text-foreground/90 font-medium">{line.action}</p>
                            </div>
                            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5">
                              <dt className="text-muted-foreground">Original hours</dt>
                              <dd className="font-mono line-through text-muted-foreground">
                                {line.override.previousLaborHours}h
                              </dd>
                              <dt className="text-muted-foreground">New hours</dt>
                              <dd className="font-mono font-semibold">{line.laborHours}h</dd>
                              <dt className="text-muted-foreground">Original rate</dt>
                              <dd className="font-mono line-through text-muted-foreground">
                                ${line.override.previousLaborRate}/h
                              </dd>
                              <dt className="text-muted-foreground">New rate</dt>
                              <dd className="font-mono font-semibold">${line.laborRate}/h</dd>
                              <dt className="text-muted-foreground">Labor cost (calc)</dt>
                              <dd className="font-mono font-semibold">
                                ${laborCostOf(line).toLocaleString()}
                              </dd>
                              <dt className="text-muted-foreground">Original parts</dt>
                              <dd className="font-mono line-through text-muted-foreground">
                                ${line.override.previousPartsCost.toLocaleString()}
                              </dd>
                              <dt className="text-muted-foreground">New parts</dt>
                              <dd className="font-mono font-semibold">
                                ${line.partsCost.toLocaleString()}
                              </dd>
                              <dt className="text-muted-foreground">By</dt>
                              <dd>{line.override.by}</dd>
                              <dt className="text-muted-foreground">When</dt>
                              <dd className="font-mono text-[11px]">
                                {new Date(line.override.at).toLocaleString()}
                              </dd>
                            </dl>
                            <div className="border-t border-border pt-2">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                                Rationale
                              </p>
                              <p className="text-foreground/90 leading-relaxed italic">
                                "{line.override.rationale}"
                              </p>
                            </div>
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <>${lineTotal(line).toLocaleString()}</>
                      )}
                    </td>
                  </tr>
                ))}
                <tr className="bg-background/60">
                  <td
                    colSpan={2}
                    className="py-3 px-4 text-right text-xs font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    Estimated Total
                  </td>
                  <td className="py-3 px-4" />
                  <td className="py-3 px-4" />
                  <td className="py-3 px-4 text-right font-mono text-xs text-muted-foreground">
                    ${laborTotal.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-xs text-muted-foreground">
                    ${partsTotal.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold ring-1 transition-colors",
                            confidencePillStyle(overall),
                          )}
                          title="How is this confidence calculated?"
                        >
                          <Info className="size-3" />
                          {overall}%
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-[28rem] p-0 overflow-hidden">
                        <div className="p-4 space-y-4">
                          {/* Header with donut */}
                          <div className="flex items-start gap-4">
                            <DonutChart score={overall} size={72} strokeWidth={7} />
                            <div className="pt-1">
                              <div className="text-2xl font-bold tracking-tight">{overall}%</div>
                              <div className="text-sm font-medium text-foreground/80">
                                {overall >= 80
                                  ? "High confidence"
                                  : overall >= 60
                                    ? "Moderate confidence"
                                    : "Low confidence"}
                              </div>
                              {claim.flags.length > 0 && (
                                <div className="text-xs text-destructive mt-1">
                                  Active flag is suppressing this score. Resolve mismatch to
                                  reassess.
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Flag banner */}
                          {claim.flags.length > 0 && (
                            <div className="bg-warning/10 border border-warning/25 rounded-md p-3 text-xs">
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="size-4 text-warning-foreground flex-shrink-0 mt-0.5" />
                                <p className="text-foreground/90 leading-relaxed">
                                  Claim consistency flag active. Reported severity (
                                  {claim.accident.severity}) does not match photo evidence
                                  (cosmetic). This signal is penalized — score would be{" "}
                                  {Math.round(
                                    metrics.reduce(
                                      (s, m) =>
                                        s +
                                        (m.key === "claimConsistency" ? 85 : m.score) *
                                          m.weight,
                                      0,
                                    ),
                                  )}
                                  % without this flag.
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Metrics */}
                          <div className="space-y-3">
                            {metrics.map((m) => (
                              <div key={m.key} className="space-y-1">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <MetricIcon
                                      metricKey={m.key}
                                      className="size-4 text-muted-foreground"
                                    />
                                    <span className="text-sm font-semibold text-foreground">
                                      {m.label}
                                    </span>
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-muted text-muted-foreground">
                                      {Math.round(m.weight * 100)}%
                                    </span>
                                  </div>
                                  <span
                                    className={cn(
                                      "text-sm font-semibold",
                                      m.score >= 80
                                        ? "text-success"
                                        : m.score >= 50
                                          ? "text-warning-foreground"
                                          : "text-destructive",
                                    )}
                                  >
                                    {m.score}%
                                  </span>
                                </div>
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                  <div
                                    className={cn(
                                      "h-full rounded-full",
                                      m.score >= 80
                                        ? "bg-success"
                                        : m.score >= 50
                                          ? "bg-chart-1"
                                          : "bg-destructive",
                                    )}
                                    style={{ width: `${m.score}%` }}
                                  />
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {m.detail}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Weighted calculation */}
                        <div className="bg-muted/50 border-t border-border p-4 space-y-2">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            Weighted Calculation
                          </p>
                          <p className="text-xs font-mono text-foreground/80">
                            {metrics
                              .map((m) => `(${m.score} × ${Math.round(m.weight * 100)}%)`)
                              .join(" + ")}
                          </p>
                          <p className="text-xs font-mono text-foreground/80">
                            ={" "}
                            {metrics
                              .map((m) => (m.score * m.weight).toFixed(1))
                              .join(" + ")} ={" "}
                            {metrics
                              .reduce((s, m) => s + m.score * m.weight, 0)
                              .toFixed(1)}
                            % →{" "}
                            <span className="font-semibold text-foreground">
                              rounded to {overall}%
                            </span>
                          </p>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-card text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <RefreshCw className="size-3" />
                            Recalculates on each agent action
                          </span>
                          <button
                            type="button"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            <Info className="size-3" />
                            Configure weights
                          </button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-base text-primary">
                    ${total.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Action buttons inline with AI estimate section */}
          <div className="flex justify-end items-center gap-2 pt-1">
            <button
              onClick={() => setOverrideOpen(true)}
              className="px-4 py-2 text-sm border border-border bg-card rounded-sm hover:bg-secondary transition-colors text-foreground/80"
            >
              Override Estimate
            </button>
            <button
              onClick={() => {
                toast.success(`Estimate accepted for ${claim.id}`, {
                  description: `Total: $${total.toLocaleString()}. Sent for final review.`,
                  icon: <Send className="size-4" />,
                });
                onAccept?.(claim.id);
              }}
              className="px-6 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-sm hover:brightness-110 transition-all flex items-center gap-2"
            >
              <Send className="size-3.5" />
              Accept / Send for Review
            </button>
          </div>
        </section>

      </div>

      <OverrideDialog
        open={overrideOpen}
        onOpenChange={setOverrideOpen}
        lines={claim.estimate.lines}
        claimId={claim.id}
        onSave={(updated) => onSaveOverride?.(claim.id, updated)}
      />
    </main>
  );
}

function DonutChart({
  score,
  size = 72,
  strokeWidth = 7,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;
  const color =
    score >= 80
      ? "var(--success)"
      : score >= 50
        ? "var(--chart-1)"
        : "var(--destructive)";

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
        style={{ fill: "var(--foreground)", fontSize: "13px", fontWeight: 700 }}
      >
        {score}%
      </text>
    </svg>
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

function EditedValueCell({
  edited,
  current,
  previous,
  override,
  field,
}: {
  edited: boolean;
  current: string;
  previous?: string;
  override?: NonNullable<EstimateLine["override"]>;
  field: string;
}) {
  if (!edited || !override) {
    return <div>{current}</div>;
  }
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            tabIndex={0}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-warning/15 text-warning-foreground ring-1 ring-warning/30 cursor-help"
          >
            <PencilLine className="size-2.5" />
            {current}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs space-y-1 text-left">
          <div className="text-[10px] font-bold uppercase tracking-widest opacity-80">
            {field} edited
          </div>
          <div className="font-mono">
            <span className="line-through opacity-70">{previous}</span>
            <span className="mx-1">→</span>
            <span className="font-semibold">{current}</span>
          </div>
          <div className="opacity-80">By {override.by}</div>
          {override.rationale && (
            <div className="italic opacity-80">"{override.rationale}"</div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function AuditLogPopover({ entries }: { entries: AuditEntry[] }) {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="text-xs flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-secondary"
          title="View audit log"
        >
          <History className="size-3.5" />
          Audit Log
          <span className="text-[10px] font-mono bg-background px-1 py-0.5 rounded border border-border">
            {sorted.length}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[28rem] max-h-[28rem] overflow-y-auto p-0">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Claim Audit Log
          </p>
        </div>
        {sorted.length === 0 ? (
          <p className="px-4 py-6 text-xs text-muted-foreground text-center">
            No activity yet.
          </p>
        ) : (
          <ol className="divide-y divide-border/60">
            {sorted.map((e, i) => (
              <AuditRow key={i} entry={e} />
            ))}
          </ol>
        )}
      </PopoverContent>
    </Popover>
  );
}

function AuditRow({ entry }: { entry: AuditEntry }) {
  const meta = auditMeta(entry.kind);
  const Icon = meta.icon;
  return (
    <li className="flex items-start gap-3 px-4 py-3">
      <span
        className={cn(
          "mt-0.5 inline-flex items-center justify-center size-6 rounded-full flex-shrink-0",
          meta.bg,
        )}
      >
        <Icon className={cn("size-3.5", meta.fg)} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-xs font-medium text-foreground">{entry.summary}</p>
          <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap">
            {new Date(entry.at).toLocaleString()}
          </span>
        </div>
        {entry.detail && (
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
            {entry.detail}
          </p>
        )}
        <p className="text-[10px] text-muted-foreground/80 mt-1">by {entry.actor}</p>
      </div>
    </li>
  );
}

function auditMeta(kind: AuditEntry["kind"]) {
  switch (kind) {
    case "claim_filed":
      return { icon: FileText, bg: "bg-muted", fg: "text-muted-foreground" };
    case "ai_estimate_generated":
      return { icon: Bot, bg: "bg-primary/10", fg: "text-primary" };
    case "flag_reviewed":
      return { icon: Check, bg: "bg-success/15", fg: "text-success" };
    case "override_saved":
      return { icon: PencilLine, bg: "bg-warning/20", fg: "text-warning-foreground" };
    case "claim_accepted":
      return { icon: Send, bg: "bg-success/15", fg: "text-success" };
  }
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
        {label}
      </dt>
      <dd className={cn("text-foreground", mono && "font-mono text-[11px]")}>{value}</dd>
    </div>
  );
}