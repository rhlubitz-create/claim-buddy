import { cn } from "@/lib/utils";
import type { Claim, Severity } from "@/data/claims";
import { AlertTriangle } from "lucide-react";

const severityStyles: Record<Severity, string> = {
  Severe: "bg-destructive/10 text-destructive ring-1 ring-destructive/20",
  Moderate: "bg-warning/15 text-warning-foreground ring-1 ring-warning/30",
  Minor: "bg-secondary text-muted-foreground ring-1 ring-border",
};

type Props = {
  claims: Claim[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export function ClaimsInbox({ claims, selectedId, onSelect }: Props) {
  return (
    <aside className="w-80 flex-shrink-0 border-r border-border bg-card flex flex-col">
      <header className="px-4 h-14 border-b border-border flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="font-semibold tracking-tight text-[11px] uppercase text-muted-foreground">
            Claims Inbox
          </span>
          <span className="text-[11px] font-mono text-muted-foreground">({claims.length})</span>
        </div>
        <div className="size-2 rounded-full bg-primary animate-pulse" />
      </header>
      <div className="flex-1 overflow-y-auto">
        {claims.map((claim) => {
          const isSelected = claim.id === selectedId;
          const hasFlags = claim.flags.length > 0;
          return (
            <button
              key={claim.id}
              onClick={() => onSelect(claim.id)}
              className={cn(
                "w-full text-left p-4 border-b border-border transition-colors block",
                isSelected
                  ? "bg-primary/5 border-l-2 border-l-primary"
                  : "hover:bg-secondary/60 border-l-2 border-l-transparent",
              )}
            >
              <div className="flex justify-between items-start mb-1 gap-2">
                <span className="font-medium text-sm text-foreground truncate">
                  {claim.policyholder.name}
                </span>
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider whitespace-nowrap",
                    severityStyles[claim.accident.severity],
                  )}
                >
                  {claim.accident.severity}
                </span>
              </div>
              <div className="text-muted-foreground text-xs mb-2 truncate">
                {claim.vehicle.year} {claim.vehicle.make} {claim.vehicle.model} · #{claim.id}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono bg-secondary border border-border px-1.5 py-0.5 rounded text-muted-foreground">
                  {claim.estimate.overallConfidence}% conf.
                </span>
                {hasFlags && (
                  <span className="text-[10px] text-destructive flex items-center gap-1 italic">
                    <AlertTriangle className="size-3" />
                    {claim.flags.length} flag{claim.flags.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}