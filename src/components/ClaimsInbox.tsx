import { cn } from "@/lib/utils";
import type { Claim, Severity } from "@/data/claims";
import { AlertTriangle, Trash2 } from "lucide-react";

const severityStyles: Record<Severity, string> = {
  Severe: "bg-destructive/10 text-destructive ring-1 ring-destructive/20",
  Moderate: "bg-warning/15 text-warning-foreground ring-1 ring-warning/30",
  Minor: "bg-secondary text-muted-foreground ring-1 ring-border",
};

function confidenceStyles(score: number): string {
  if (score < 60) {
    return "bg-destructive/10 text-black ring-1 ring-destructive/20";
  }
  if (score < 80) {
    return "bg-warning/15 text-black ring-1 ring-warning/30";
  }
  return "bg-success/10 text-black ring-1 ring-success/20";
}

type Props = {
  claims: Claim[];
  selectedId: string;
  onSelect: (id: string) => void;
  onDelete?: (id: string) => void;
};

export function ClaimsInbox({ claims, selectedId, onSelect, onDelete }: Props) {
  const sorted = [...claims].sort(
    (a, b) => new Date(b.filedAt).getTime() - new Date(a.filedAt).getTime(),
  );
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
        {sorted.map((claim) => {
          const isSelected = claim.id === selectedId;
          const hasFlags = claim.flags.length > 0;
          const submitted = new Date(claim.filedAt);
          const submittedStr = `${String(submitted.getMonth() + 1).padStart(2, "0")}/${String(submitted.getDate()).padStart(2, "0")}/${submitted.getFullYear()}`;
          const canDelete = onDelete && claim.policyholder.userId === "100-55-880";
          return (
            <div
              key={claim.id}
              className={cn(
                "w-full text-left border-b border-border transition-colors relative group",
                isSelected
                  ? "bg-primary/5 border-l-2 border-l-primary"
                  : "hover:bg-secondary/60 border-l-2 border-l-transparent",
              )}
            >
              <button
                onClick={() => onSelect(claim.id)}
                className="w-full text-left p-4 block"
              >
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="font-medium text-sm text-foreground truncate">
                    {claim.policyholder.name}
                  </div>
                  <div className="text-muted-foreground text-xs truncate">
                    {claim.vehicle.year} {claim.vehicle.make} {claim.vehicle.model} · #{claim.id}
                  </div>
                  <div className="text-[11px] text-muted-foreground/80">
                    Submitted: <span className="font-mono">{submittedStr}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-0.5">
                    <span
                      className={cn(
                        "inline-block px-1.5 py-0.5 rounded-sm text-[10px] font-bold whitespace-nowrap",
                        confidenceStyles(claim.estimate.overallConfidence),
                      )}
                    >
                      {claim.estimate.overallConfidence}% conf.
                    </span>
                    {hasFlags && (
                      <span className="text-[10px] text-destructive flex items-center gap-1 italic whitespace-nowrap">
                        <AlertTriangle className="size-3" />
                        {claim.flags[0]?.title ?? `${claim.flags.length} flag${claim.flags.length > 1 ? "s" : ""}`}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span
                    className={cn(
                      "inline-block px-1.5 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider whitespace-nowrap",
                      severityStyles[claim.accident.severity],
                    )}
                  >
                    {claim.accident.severity}
                  </span>
                </div>
              </div>
              </button>
              {canDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(claim.id);
                  }}
                  className="absolute top-2 right-2 size-6 grid place-items-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Delete ${claim.id}`}
                  title="Delete demo claim"
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}