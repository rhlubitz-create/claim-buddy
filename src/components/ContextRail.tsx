import { useState } from "react";
import { cn } from "@/lib/utils";
import type { SimilarClaim, AuditEntry } from "@/data/claims";
import { X, ExternalLink, Database, FileText, Bot, Check, PencilLine, Plus, Send, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type Props = {
  similar: SimilarClaim[];
  auditLog: AuditEntry[];
  claimId: string;
  onClose: () => void;
};

export function ContextRail({ similar, auditLog, claimId, onClose }: Props) {
  const [tab, setTab] = useState<"similar" | "audit">("similar");
  const [active, setActive] = useState<SimilarClaim | null>(null);

  return (
    <aside className="w-80 flex-shrink-0 border-l border-border bg-background flex flex-col">
      <header className="px-3 pt-3 pb-2 border-b border-border flex items-center gap-2">
        <div className="flex flex-1 p-1 bg-secondary/60 rounded-md gap-1">
          <TabBtn active={tab === "similar"} onClick={() => setTab("similar")}>
            Similar Claims
            <span className="ml-1.5 text-[10px] font-mono opacity-70">
              {similar.length}
            </span>
          </TabBtn>
          <TabBtn active={tab === "audit"} onClick={() => setTab("audit")}>
            Audit Log
            <span className="ml-1.5 text-[10px] font-mono opacity-70">
              {auditLog.length}
            </span>
          </TabBtn>
        </div>
        <button
          onClick={onClose}
          className="size-7 grid place-items-center text-muted-foreground hover:text-foreground rounded hover:bg-secondary transition-colors flex-shrink-0"
          aria-label="Hide context panel"
        >
          <X className="size-3.5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        {tab === "similar" ? (
          <SimilarList similar={similar} onOpen={setActive} />
        ) : (
          <AuditList entries={auditLog} claimId={claimId} />
        )}
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

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 py-1.5 text-[11px] font-semibold rounded transition-all",
        active
          ? "bg-background shadow-sm text-foreground ring-1 ring-border"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function SimilarList({
  similar,
  onOpen,
}: {
  similar: SimilarClaim[];
  onOpen: (s: SimilarClaim) => void;
}) {
  if (similar.length === 0) {
    return (
      <p className="px-4 py-6 text-xs text-muted-foreground italic">
        No similar historical claims available for this claim.
      </p>
    );
  }
  return (
    <div className="p-4 space-y-5">
      {similar.map((s) => (
        <button
          key={s.id}
          onClick={() => onOpen(s)}
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
  );
}

function AuditList({
  entries,
  claimId,
}: {
  entries: AuditEntry[];
  claimId: string;
}) {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );
  if (sorted.length === 0) {
    return (
      <p className="px-4 py-6 text-xs text-muted-foreground text-center">
        No activity yet.
      </p>
    );
  }
  const groups = groupByDay(sorted);
  return (
    <div>
      <div className="px-4 pt-3 pb-1 text-[10px] font-mono text-muted-foreground">
        #{claimId}
      </div>
      <div className="divide-y divide-border/60">
        {groups.map((g) => (
          <section key={g.label}>
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border/60">
              {g.label}
            </div>
            <ol className="divide-y divide-border/60">
              {g.entries.map((e, i) => (
                <AuditRow key={i} entry={e} />
              ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}

function groupByDay(entries: AuditEntry[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const map = new Map<string, AuditEntry[]>();
  const order: string[] = [];

  for (const e of entries) {
    const d = new Date(e.at);
    const day = new Date(d);
    day.setHours(0, 0, 0, 0);
    let label: string;
    if (day.getTime() === today.getTime()) label = "Today";
    else if (day.getTime() === yesterday.getTime()) label = "Yesterday";
    else
      label = day.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year:
          day.getFullYear() === today.getFullYear() ? undefined : "numeric",
      });
    if (!map.has(label)) {
      map.set(label, []);
      order.push(label);
    }
    map.get(label)!.push(e);
  }
  return order.map((label) => ({ label, entries: map.get(label)! }));
}

function AuditRow({ entry }: { entry: AuditEntry }) {
  const meta = auditMeta(entry.kind);
  const Icon = meta.icon;
  return (
    <li className="flex items-start gap-2.5 px-4 py-3">
      <span
        className={cn(
          "mt-0.5 inline-flex items-center justify-center size-6 rounded-full flex-shrink-0",
          meta.bg,
        )}
      >
        <Icon className={cn("size-3", meta.fg)} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-xs font-medium text-foreground leading-snug">
            {entry.summary}
          </p>
          <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap">
            {new Date(entry.at).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        </div>
        {entry.detail && (
          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
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
    case "line_added":
      return { icon: Plus, bg: "bg-primary/10", fg: "text-primary" };
    case "claim_accepted":
      return { icon: Send, bg: "bg-success/15", fg: "text-success" };
    case "claim_rejected":
      return { icon: XCircle, bg: "bg-destructive/10", fg: "text-destructive" };
  }
}