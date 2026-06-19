import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Claim, EstimateLine } from "@/data/claims";
import { getConfidenceBreakdown, getLineConfidenceBreakdown, lineTotal, laborCostOf } from "@/data/claims";
import {
  AlertTriangle,
  CheckCircle2,
  PanelRightOpen,
  Send,
  Info,
  Check,
  Sparkles,
  PencilLine,
  ArrowRight,
  Plus,
  XCircle,
  Image as ImageIcon,
} from "lucide-react";
import { OverrideDialog } from "./OverrideDialog";
import { AddLineDialog } from "./AddLineDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
  onReject?: (claimId: string, rationale: string) => void;
  onSaveOverride?: (claimId: string, lines: EstimateLine[]) => void;
  onAddLine?: (claimId: string, line: EstimateLine, rationale: string) => void;
  onViewConfidence?: () => void;
};

export function ClaimDetail({
  claim,
  railOpen,
  onOpenRail,
  onDismissFlag,
  onAccept,
  onReject,
  onSaveOverride,
  onAddLine,
  onViewConfidence,
}: Props) {
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [addLineOpen, setAddLineOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const total = claim.estimate.lines.reduce((sum, l) => sum + lineTotal(l), 0);
  const laborTotal = claim.estimate.lines.reduce((s, l) => s + laborCostOf(l), 0);
  const partsTotal = claim.estimate.lines.reduce((s, l) => s + l.partsCost, 0);
  const { overall, rolledUp, multiplier, multiplierLabel } =
    getConfidenceBreakdown(claim);

  return (
    <main className="flex-1 flex flex-col bg-card overflow-hidden relative min-w-0">
      {/* Header */}
      <div className="px-6 h-14 border-b border-border flex justify-between items-center">
        <div className="flex items-baseline gap-3">
          <h1 className="text-base font-semibold tracking-tight">Claim Review</h1>
          <span className="text-xs font-mono text-muted-foreground">#{claim.id}</span>
        </div>
        <div className="flex items-center gap-2">
          {!railOpen && (
            <button
              onClick={onOpenRail}
              className="text-xs flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-secondary"
            >
              <PanelRightOpen className="size-3.5" />
              Show context
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Section 1: Policyholder + Claim Info + Flags */}
        <section className="space-y-4">
          <div className="bg-muted/30 border border-border rounded-lg p-5 shadow-sm space-y-4">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Policyholder & Claim Information
            </h2>

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
          </div>
        </section>


        {/* Section 1.5: Damage Assessment Summary */}
        <section className="rounded-md border border-border bg-secondary/30 p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Damage Assessment Summary
            </h2>
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setAddLineOpen(true)}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Plus className="size-3.5" />
                    damage
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  Add a damage the AI missed
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <p className="text-sm text-foreground/90 leading-relaxed">
            {claim.estimate.summary}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Detected:
            </span>
            {claim.estimate.lines.map((line) => (
              <span
                key={line.id}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-background border border-border text-xs",
                  line.addedByAgent && "bg-warning/[0.06] border-warning/30",
                )}
              >
                {line.addedByAgent && (
                  <PencilLine className="size-3 text-warning-foreground" />
                )}
                <span className="text-muted-foreground">{line.action}</span>
                <span className="text-muted-foreground">—</span>
                <span className="font-semibold text-foreground">
                  {line.damage ?? line.type}
                </span>
                {line.addedByAgent && (
                  <span className="ml-0.5 inline-flex items-center px-1.5 py-0.5 rounded bg-warning/20 text-warning-foreground text-[9px] font-bold uppercase tracking-widest">
                    Added
                  </span>
                )}
              </span>
            ))}
          </div>

          {claim.flags.length > 0 ? (
            <div className="space-y-2 pt-1">
              {claim.flags.map((f, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-4 rounded-md bg-destructive/5 border border-destructive/20"
                >
                  <AlertTriangle className="size-4 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-destructive">{f.title}</p>
                    <p className="text-xs text-foreground/80 mt-1 leading-relaxed">{f.detail}</p>
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
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-md bg-success/5 border border-success/20">
              <CheckCircle2 className="size-4 text-success flex-shrink-0" />
              <p className="text-xs text-foreground/80">
                No mismatches detected. Photo, vehicle, and severity classification align.
              </p>
            </div>
          )}
        </section>

        {/* Section 2: AI Estimate */}
        <section className="space-y-3 rounded-md border border-primary/25 bg-primary/[0.04] p-4 ring-1 ring-primary/10">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider ring-1 ring-primary/20">
              <Sparkles className="size-3.5" />
              AI Generated Damage Assessment and Cost Estimates
            </span>
          </div>

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
                  <tr
                    key={line.id}
                    className={cn(
                      "text-sm",
                      line.addedByAgent && "bg-warning/[0.06]",
                    )}
                  >
                    <td
                      className={cn(
                        "py-3 px-4",
                        line.addedByAgent &&
                          "border-l-2 border-warning/60",
                      )}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {line.action}
                        {line.addedByAgent && (
                          <TooltipProvider delayDuration={150}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-warning/20 text-warning-foreground ring-1 ring-warning/40 text-[9px] font-bold uppercase tracking-widest cursor-help">
                                  <PencilLine className="size-2.5" />
                                  Added
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs">
                                Added by {line.override?.by ?? "claims agent"}.
                                {line.override?.rationale && (
                                  <span className="block italic mt-1">
                                    "{line.override.rationale}"
                                  </span>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">{line.type}</td>
                    <td className="py-3 px-4 text-right font-mono text-xs">
                      <EditedValueCell
                        edited={
                          !!line.overridden &&
                          !line.addedByAgent &&
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
                          !line.addedByAgent &&
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
                            !line.addedByAgent &&
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
                      <LineConfidencePopover line={line} />
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-medium">
                      {line.overridden && line.override && !line.addedByAgent ? (
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
                      <PopoverContent align="end" className="w-72 p-0 overflow-hidden">
                        <div className="p-4 space-y-3">
                          <div className="flex items-center gap-3">
                            <DonutChart score={overall} size={56} strokeWidth={6} />
                            <div>
                              <div className="text-xl font-bold tracking-tight leading-none">
                                {overall}%
                              </div>
                              <div className="text-xs font-medium text-foreground/80 mt-1">
                                {overall >= 80
                                  ? "High confidence"
                                  : overall >= 60
                                    ? "Moderate confidence"
                                    : "Low confidence"}
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Two-step calculation: line rollup × consistency multiplier.
                          </p>
                          <div className="text-[11px] font-mono bg-muted/40 rounded px-2.5 py-2 space-y-0.5">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Line avg</span>
                              <span className="font-semibold">{rolledUp}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                × {multiplierLabel}
                              </span>
                              <span className="font-semibold">×{multiplier.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between border-t border-border/60 pt-1 mt-1">
                              <span>= Overall</span>
                              <span className="font-semibold">{overall}%</span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={onViewConfidence}
                          className="w-full flex items-center justify-between gap-2 px-4 py-2.5 border-t border-border bg-muted/40 hover:bg-muted transition-colors text-xs font-medium text-primary"
                        >
                          View full breakdown
                          <ArrowRight className="size-3.5" />
                        </button>
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
                onClick={() => setRejectOpen(true)}
                className="px-4 py-2 text-sm border border-destructive/30 bg-card rounded-sm hover:bg-destructive/10 transition-colors text-destructive flex items-center gap-1.5"
              >
                <XCircle className="size-3.5" />
                Reject Claim
              </button>
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
      <AddLineDialog
        open={addLineOpen}
        onOpenChange={setAddLineOpen}
        claimId={claim.id}
        onAdd={(line, rationale) => onAddLine?.(claim.id, line, rationale)}
      />
      <RejectDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        claimId={claim.id}
        onConfirm={(rationale) => onReject?.(claim.id, rationale)}
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

function LineConfidencePopover({ line }: { line: EstimateLine }) {
  if (line.addedByAgent) {
    return (
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ring-1 bg-primary/10 text-primary ring-primary/20 cursor-help">
              <PencilLine className="size-3" />
              Agent Entered
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p className="text-xs leading-relaxed">
              This repair action was added by the claims agent. No AI confidence score is
              assigned because it was not generated by the model.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const lb = getLineConfidenceBreakdown(line);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold ring-1 transition-colors",
            confidencePillStyle(line.confidence),
          )}
          title="How is this confidence calculated?"
        >
          <Info className="size-3" />
          {line.confidence}%
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" align="center" className="w-72 p-0 overflow-hidden">
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <DonutChart score={line.confidence} size={56} strokeWidth={6} />
            <div>
              <div className="text-xl font-bold tracking-tight leading-none">
                {line.confidence}%
              </div>
              <div className="text-xs font-medium text-foreground/80 mt-1">
                {line.confidence >= 80
                  ? "High confidence"
                  : line.confidence >= 60
                    ? "Moderate confidence"
                    : "Low confidence"}
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Weighted blend of 4 equally-weighted signals (25% each) scored per repair action.
          </p>
          <div className="space-y-2">
            {lb.factors.map((f) => (
              <div key={f.key} className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-medium">{f.label}</span>
                  <span className="text-[11px] font-mono tabular-nums text-muted-foreground">
                    {f.score}%
                  </span>
                </div>
                <div className="h-1.5 rounded bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "h-full",
                      f.score >= 85
                        ? "bg-success"
                        : f.score >= 70
                          ? "bg-warning"
                          : "bg-destructive",
                    )}
                    style={{ width: `${f.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="text-[10px] font-mono text-muted-foreground bg-muted/30 px-3 py-2 rounded">
            Avg: ({lb.factors.map((f) => f.score).join(" + ")}) ÷ 4 = {line.confidence}%
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
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

function RejectDialog({
  open,
  onOpenChange,
  claimId,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claimId: string;
  onConfirm: (rationale: string) => void;
}) {
  const [rationale, setRationale] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rationale.trim()) {
      toast.error("Rationale is required to reject a claim.");
      return;
    }
    onConfirm(rationale.trim());
    toast.success(`Claim ${claimId} rejected`, {
      description: "Rationale logged for audit.",
    });
    setRationale("");
    onOpenChange(false);
  };
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) setRationale("");
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reject Claim — {claimId}</DialogTitle>
          <DialogDescription>
            Provide a rationale for rejecting this claim. This will be logged for audit
            and the claim will be removed from the active inbox.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="reject-rationale"
              className="text-xs font-semibold uppercase tracking-wider"
            >
              Rationale <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reject-rationale"
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="Explain why this claim is being rejected (e.g. 'Out of policy — liability-only coverage does not include first-party vehicle repairs')."
              rows={4}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive">
              Reject Claim
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
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