import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Claim, EstimateLine } from "@/data/claims";
import { getConfidenceBreakdown } from "@/data/claims";
import { AlertTriangle, CheckCircle2, PanelRightOpen, Send, Info, Check } from "lucide-react";
import { OverrideDialog } from "./OverrideDialog";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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

  const total = claim.estimate.lines.reduce((sum, l) => sum + l.cost, 0);
  const { metrics, overall } = getConfidenceBreakdown(claim);

  return (
    <main className="flex-1 flex flex-col bg-card overflow-hidden relative min-w-0">
      {/* Header */}
      <div className="px-6 h-14 border-b border-border flex justify-between items-center">
        <div className="flex items-baseline gap-3">
          <h1 className="text-base font-semibold tracking-tight">Claim Review</h1>
          <span className="text-xs font-mono text-muted-foreground">#{claim.id}</span>
        </div>
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
        <section className="space-y-3">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            AI Generated Estimate
          </h2>

          <p className="text-xs text-foreground/80 italic leading-relaxed">
            {claim.estimate.summary}
          </p>

          <div className="border border-border rounded-sm overflow-hidden bg-card">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background border-b border-border text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  <th className="py-2.5 px-4">Repair Action</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4 text-right">Labor</th>
                  <th className="py-2.5 px-4 text-center">Confidence</th>
                  <th className="py-2.5 px-4 text-right">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {claim.estimate.lines.map((line) => (
                  <tr key={line.id} className="text-sm">
                    <td className="py-3 px-4">{line.action}</td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">{line.type}</td>
                    <td className="py-3 px-4 text-right font-mono text-xs text-muted-foreground">
                      {line.laborHours}h
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
                      {line.overridden ? (
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-warning/15 text-warning-foreground ring-1 ring-warning/30"
                          title="Manually overridden by claims agent"
                        >
                          <span className="text-[9px] font-bold uppercase tracking-wider">
                            Edited
                          </span>
                          ${line.cost.toLocaleString()}
                        </span>
                      ) : (
                        <>${line.cost.toLocaleString()}</>
                      )}
                    </td>
                  </tr>
                ))}
                <tr className="bg-background/60">
                  <td
                    colSpan={3}
                    className="py-3 px-4 text-right text-xs font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    Estimated Total
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
                      <PopoverContent align="end" className="w-96 text-xs space-y-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                            How this score is calculated
                          </p>
                          <p className="text-foreground/90 leading-relaxed">
                            The overall confidence is a weighted blend of four equally-weighted
                            signals (25% each). Weights are configurable by an admin.
                          </p>
                        </div>
                        <ul className="space-y-2">
                          {metrics.map((m) => (
                            <li key={m.key} className="flex justify-between gap-3">
                              <span className="text-foreground/90 flex-1">
                                <span className="flex items-center gap-2">
                                  <span className="font-semibold">{m.label}</span>
                                  <span
                                    className={cn(
                                      "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold",
                                      confidencePillStyle(m.score),
                                    )}
                                  >
                                    {m.score}%
                                  </span>
                                </span>
                                <span className="block text-muted-foreground text-[11px] mt-0.5">
                                  {m.detail}
                                </span>
                              </span>
                              <span className="font-mono text-muted-foreground whitespace-nowrap">
                                {Math.round(m.weight * 100)}%
                              </span>
                            </li>
                          ))}
                        </ul>
                        <p className="text-[11px] text-muted-foreground italic border-t border-border pt-2">
                          Overall ={" "}
                          {metrics
                            .map((m) => `${m.score}×${Math.round(m.weight * 100)}%`)
                            .join(" + ")}{" "}
                          = <span className="font-semibold">{overall}%</span>
                        </p>
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
        </section>
      </div>

      {/* Action Bar */}
      <div className="px-4 h-16 border-t border-border bg-card flex justify-end items-center gap-2 flex-shrink-0">
        <button
          onClick={() => setOverrideOpen(true)}
          className="px-4 py-2 text-sm border border-border rounded-sm hover:bg-secondary transition-colors text-foreground/80"
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