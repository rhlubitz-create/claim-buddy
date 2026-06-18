import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CLAIMS, type Claim, type EstimateLine, type AuditEntry } from "@/data/claims";
import { getConfidenceBreakdown } from "@/data/claims";
import { ClaimsInbox } from "@/components/ClaimsInbox";
import { ClaimDetail } from "@/components/ClaimDetail";
import { SimilarClaimsRail } from "@/components/SimilarClaimsRail";
import { SubmitClaim } from "@/components/SubmitClaim";
import { ConfidenceBreakdown } from "@/components/ConfidenceBreakdown";
import { cn } from "@/lib/utils";
import { Inbox, FilePlus2, Car } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Claims Agent Inbox" },
      {
        name: "description",
        content:
          "AI-assisted car insurance claims review console — triage damage photos, AI repair estimates, and similar historical claims.",
      },
      { property: "og:title", content: "Claims Agent Inbox" },
      {
        property: "og:description",
        content:
          "AI-assisted car insurance claims review console — triage damage photos, AI repair estimates, and similar historical claims.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [tab, setTab] = useState<"submit" | "inbox">("submit");
  const [claims, setClaims] = useState<Claim[]>(() =>
    CLAIMS.map((c) => ({
      ...c,
      auditLog: c.auditLog ?? [
        {
          at: c.filedAt,
          actor: c.policyholder.name,
          kind: "claim_filed",
          summary: "Claim submitted by policyholder",
          detail: `${c.accident.type} — ${c.accident.severity} severity`,
        },
        {
          at: new Date(new Date(c.filedAt).getTime() + 90 * 1000).toISOString(),
          actor: "AI Assistant",
          kind: "ai_estimate_generated",
          summary: `AI estimate generated (${c.estimate.overallConfidence}% confidence)`,
          detail: `${c.estimate.lines.length} line items proposed`,
        },
      ],
    })),
  );
  const [selectedId, setSelectedId] = useState(CLAIMS[0].id);
  const [railOpen, setRailOpen] = useState(true);
  const [view, setView] = useState<"detail" | "confidence">("detail");
  const selected = claims.find((c) => c.id === selectedId) ?? claims[0];

  const handleSubmit = (claim: Claim) => {
    const now = new Date().toISOString();
    const seeded: Claim = {
      ...claim,
      auditLog: [
        {
          at: claim.filedAt,
          actor: claim.policyholder.name,
          kind: "claim_filed",
          summary: "Claim submitted by policyholder",
          detail: `${claim.accident.type} — ${claim.accident.severity} severity`,
        },
        {
          at: now,
          actor: "AI Assistant",
          kind: "ai_estimate_generated",
          summary: `AI estimate generated (${claim.estimate.overallConfidence}% confidence)`,
          detail: `${claim.estimate.lines.length} line items proposed`,
        },
      ],
    };
    setClaims((prev) => [seeded, ...prev]);
    // Do NOT auto-navigate — the user moves to the Agent Inbox themselves
    // for the demo. Just make sure the new claim is pre-selected when they
    // do switch tabs.
    setSelectedId(seeded.id);
  };

  const handleDelete = (id: string) => {
    setClaims((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (id === selectedId && next.length) setSelectedId(next[0].id);
      return next;
    });
  };

  const handleDismissFlag = (claimId: string, flagIndex: number) => {
    setClaims((prev) =>
      prev.map((c) => {
        if (c.id !== claimId) return c;
        const flag = c.flags[flagIndex];
        const before = getConfidenceBreakdown(c).overall;
        const updated: Claim = {
          ...c,
          flags: c.flags.filter((_, i) => i !== flagIndex),
        };
        const after = getConfidenceBreakdown(updated).overall;
        const now = new Date().toISOString();
        const entry: AuditEntry = {
          at: now,
          actor: "Alex Park (Claims Agent)",
          kind: "flag_reviewed",
          summary: `Flag marked as reviewed: ${flag?.title ?? "Unknown"}`,
          detail: flag?.detail,
        };
        const log = [...(c.auditLog ?? []), entry];
        if (after !== before) {
          const delta = after - before;
          log.push({
            at: new Date(new Date(now).getTime() + 1).toISOString(),
            actor: "AI Assistant",
            kind: "ai_estimate_generated",
            summary: `Confidence recalculated: ${before}% → ${after}% (${delta > 0 ? "+" : ""}${delta} pts)`,
            detail: `Triggered by flag review: "${flag?.title ?? "Unknown"}". Claim consistency signal no longer penalized.`,
          });
        }
        return { ...updated, auditLog: log };
      }),
    );
  };

  const handleAccept = (id: string) => {
    setClaims((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (id === selectedId && next.length) setSelectedId(next[0].id);
      return next;
    });
  };

  const handleSaveOverride = (
    id: string,
    updatedLines: EstimateLine[],
  ) => {
    setClaims((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        // Find lines whose override metadata changed in this save.
        const changed = updatedLines.filter((nl) => {
          const prevLine = c.estimate.lines.find((p) => p.id === nl.id);
          return (
            nl.overridden &&
            (!prevLine ||
              prevLine.laborHours !== nl.laborHours ||
              prevLine.laborRate !== nl.laborRate ||
              prevLine.partsCost !== nl.partsCost)
          );
        });
        const rationale = changed[0]?.override?.rationale;
        const actor = changed[0]?.override?.by ?? "Claims Agent";
        const at = changed[0]?.override?.at ?? new Date().toISOString();
        const entry: AuditEntry | null = changed.length
          ? {
              at,
              actor,
              kind: "override_saved",
              summary: `Override saved on ${changed.length} line item${changed.length === 1 ? "" : "s"}`,
              detail: rationale
                ? `Rationale: "${rationale}"`
                : changed.map((l) => l.action).join(", "),
            }
          : null;
        return {
          ...c,
          estimate: { ...c.estimate, lines: updatedLines },
          auditLog: entry ? [...(c.auditLog ?? []), entry] : c.auditLog,
        };
      }),
    );
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background font-sans text-sm text-foreground overflow-hidden">
      <div className="flex items-center gap-2 px-4 h-12 border-b border-border bg-card flex-shrink-0">
        <Car className="size-5 text-primary" />
        <span className="font-bold text-base tracking-tight">Claims Agent</span>
      </div>

      <nav className="h-10 border-b border-border bg-card/60 flex items-center px-4 gap-1 flex-shrink-0">
        <TabBtn active={tab === "submit"} onClick={() => setTab("submit")} icon={<FilePlus2 className="size-3.5" />}>
          Submit a Claim
        </TabBtn>
        <TabBtn active={tab === "inbox"} onClick={() => setTab("inbox")} icon={<Inbox className="size-3.5" />}>
          Agent Inbox{"\n"}
          <span className="ml-1.5 text-[10px] font-mono bg-secondary px-1.5 py-0.5 rounded">
            {claims.length}
          </span>
        </TabBtn>
      </nav>

      {tab === "submit" ? (
        <SubmitClaim onSubmit={handleSubmit} />
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <ClaimsInbox
            claims={claims}
            selectedId={selectedId}
            onSelect={(id) => {
              setSelectedId(id);
              setView("detail");
            }}
            onDelete={handleDelete}
          />
          {view === "confidence" ? (
            <ConfidenceBreakdown
              claim={selected}
              onBack={() => setView("detail")}
            />
          ) : (
            <>
              <ClaimDetail
                claim={selected}
                railOpen={railOpen}
                onOpenRail={() => setRailOpen(true)}
                onDismissFlag={handleDismissFlag}
                onAccept={handleAccept}
                onSaveOverride={handleSaveOverride}
                onViewConfidence={() => setView("confidence")}
              />
              {railOpen && (
                <SimilarClaimsRail
                  similar={selected.similar}
                  onClose={() => setRailOpen(false)}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-8 px-3 rounded-sm text-xs font-medium flex items-center gap-1.5 transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary",
      )}
    >
      {icon}
      {children}
    </button>
  );
}
