import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CLAIMS, type Claim } from "@/data/claims";
import { ClaimsInbox } from "@/components/ClaimsInbox";
import { ClaimDetail } from "@/components/ClaimDetail";
import { SimilarClaimsRail } from "@/components/SimilarClaimsRail";
import { SubmitClaim } from "@/components/SubmitClaim";
import { cn } from "@/lib/utils";
import { Inbox, FilePlus2 } from "lucide-react";

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
  const [claims, setClaims] = useState<Claim[]>(CLAIMS);
  const [selectedId, setSelectedId] = useState(CLAIMS[0].id);
  const [railOpen, setRailOpen] = useState(true);
  const selected = claims.find((c) => c.id === selectedId) ?? claims[0];

  const handleSubmit = (claim: Claim) => {
    setClaims((prev) => [claim, ...prev]);
    setSelectedId(claim.id);
    setTab("inbox");
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
      prev.map((c) =>
        c.id === claimId
          ? { ...c, flags: c.flags.filter((_, i) => i !== flagIndex) }
          : c,
      ),
    );
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background font-sans text-sm text-foreground overflow-hidden">
      <nav className="h-12 border-b border-border bg-card flex items-center px-4 gap-1 flex-shrink-0">
        <span className="font-semibold tracking-tight text-sm mr-4">
          Claims Console
        </span>
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
            onSelect={setSelectedId}
            onDelete={handleDelete}
          />
          <ClaimDetail
            claim={selected}
            railOpen={railOpen}
            onOpenRail={() => setRailOpen(true)}
            onDismissFlag={handleDismissFlag}
          />
          {railOpen && (
            <SimilarClaimsRail similar={selected.similar} onClose={() => setRailOpen(false)} />
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
