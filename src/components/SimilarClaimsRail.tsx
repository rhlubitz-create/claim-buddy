import type { SimilarClaim } from "@/data/claims";
import { X } from "lucide-react";

type Props = {
  similar: SimilarClaim[];
  onClose: () => void;
};

export function SimilarClaimsRail({ similar, onClose }: Props) {
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
          <div key={s.id} className="space-y-2">
            <img
              src={s.photo}
              alt={s.vehicle}
              loading="lazy"
              width={400}
              height={300}
              className="w-full aspect-[4/3] object-cover rounded-sm outline-1 -outline-offset-1 outline-black/5"
            />
            <div className="flex justify-between items-end">
              <span className="text-[11px] font-medium font-mono">#{s.id}</span>
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
          </div>
        ))}
      </div>
    </aside>
  );
}