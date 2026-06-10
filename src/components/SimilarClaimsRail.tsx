import { useState } from "react";
import type { SimilarClaim } from "@/data/claims";
import { X, ExternalLink, Database } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type Props = {
  similar: SimilarClaim[];
  onClose: () => void;
};

export function SimilarClaimsRail({ similar, onClose }: Props) {
  const [active, setActive] = useState<SimilarClaim | null>(null);
  return (
    <aside className="w-72 flex-shrink-0 border-l border-border bg-background flex flex-col">
      <header className="px-4 h-14 border-b border-border flex justify-between items-center">
        <span className="font-semibold tracking-tight text-[10px] uppercase text-muted-foreground">
          Similar Historical Claims
        </span>
        <button
          onClick={onClose}
          className="size-6 grid place-items-center text-muted-foreground hover:text-foreground rounded hover:bg-secondary transition-colors"
          aria-label="Hide similar claims"
        >
          <X className="size-3.5" />
        </button>
      </header>
      <div className="p-4 space-y-5 overflow-y-auto">
        {similar.length === 0 && (
          <p className="text-xs text-muted-foreground italic">
            No similar historical claims available for this claim.
          </p>
        )}
        {similar.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s)}
            className="w-full text-left space-y-2 group rounded-sm p-2 -m-2 hover:bg-secondary/60 transition-colors cursor-pointer"
            title="Open in Historical Claims Database"
          >
            <img
              src={s.photo}
              alt={s.vehicle}
              loading="lazy"
              width={400}
              height={300}
              className="w-full aspect-[4/3] object-cover rounded-sm outline-1 -outline-offset-1 outline-black/5"
            />
            <div className="flex justify-between items-end">
              <span className="text-[11px] font-medium font-mono flex items-center gap-1 group-hover:text-primary transition-colors">
                #{s.id}
                <ExternalLink className="size-3 opacity-60" />
              </span>
              <span className="text-sm font-mono font-bold text-foreground">
                ${s.finalCost.toLocaleString()}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-snug">
              {s.vehicle} · {s.matchPct}% match
            </p>
            <p className="text-[10px] text-muted-foreground/80 leading-snug italic">
              Matched on: {s.matchedOn}
            </p>
          </button>
        ))}
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              <Database className="size-3" />
              Historical Claims Database
            </div>
            <DialogTitle className="font-mono">#{active?.id}</DialogTitle>
            <DialogDescription>
              {active?.vehicle} · settled claim record
            </DialogDescription>
          </DialogHeader>
          {active && (
            <div className="space-y-4">
              <img
                src={active.photo}
                alt={active.vehicle}
                className="w-full aspect-[4/3] object-cover rounded-sm outline-1 -outline-offset-1 outline-black/5"
              />
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
                    Final Settled Cost
                  </dt>
                  <dd className="font-mono text-base font-bold text-primary">
                    ${active.finalCost.toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
                    Match Score
                  </dt>
                  <dd className="font-mono">{active.matchPct}%</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
                    Matched On
                  </dt>
                  <dd className="text-foreground/90">{active.matchedOn}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
                    Status
                  </dt>
                  <dd className="text-foreground/90">Closed · paid in full</dd>
                </div>
              </dl>
              <p className="text-[11px] text-muted-foreground italic border-t border-border pt-3">
                This record is read-only and pulled live from the central Historical Claims Database.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </aside>
  );
}