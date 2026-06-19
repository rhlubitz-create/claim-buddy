import { cn } from "@/lib/utils";
import type { AuditEntry } from "@/data/claims";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  FileText,
  Bot,
  Check,
  PencilLine,
  Plus,
  Send,
  XCircle,
} from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claimId: string;
  entries: AuditEntry[];
};

export function AuditLogPanel({ open, onOpenChange, claimId, entries }: Props) {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );

  // Group by day label (Today / Yesterday / formatted date)
  const groups = groupByDay(sorted);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl p-0 flex flex-col"
      >
        <SheetHeader className="px-6 py-4 border-b border-border space-y-1">
          <SheetTitle className="text-base flex items-center justify-between gap-3">
            <span>Claim Audit Log</span>
            <span className="text-[10px] font-mono bg-secondary px-1.5 py-0.5 rounded border border-border text-muted-foreground">
              {sorted.length} {sorted.length === 1 ? "event" : "events"}
            </span>
          </SheetTitle>
          <SheetDescription className="text-xs font-mono">
            #{claimId}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {sorted.length === 0 ? (
            <p className="px-6 py-10 text-xs text-muted-foreground text-center">
              No activity yet.
            </p>
          ) : (
            <div className="divide-y divide-border/60">
              {groups.map((g) => (
                <section key={g.label}>
                  <div className="sticky top-0 z-10 bg-background/95 backdrop-blur px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border/60">
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
          )}
        </div>
      </SheetContent>
    </Sheet>
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
    <li className="flex items-start gap-3 px-6 py-4">
      <span
        className={cn(
          "mt-0.5 inline-flex items-center justify-center size-7 rounded-full flex-shrink-0",
          meta.bg,
        )}
      >
        <Icon className={cn("size-3.5", meta.fg)} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-medium text-foreground">{entry.summary}</p>
          <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap">
            {new Date(entry.at).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        </div>
        {entry.detail && (
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {entry.detail}
          </p>
        )}
        <p className="text-[10px] text-muted-foreground/80 mt-1.5">
          by {entry.actor}
        </p>
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
      return {
        icon: PencilLine,
        bg: "bg-warning/20",
        fg: "text-warning-foreground",
      };
    case "line_added":
      return { icon: Plus, bg: "bg-primary/10", fg: "text-primary" };
    case "claim_accepted":
      return { icon: Send, bg: "bg-success/15", fg: "text-success" };
    case "claim_rejected":
      return { icon: XCircle, bg: "bg-destructive/10", fg: "text-destructive" };
  }
}