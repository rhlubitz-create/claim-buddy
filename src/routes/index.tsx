import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CLAIMS } from "@/data/claims";
import { ClaimsInbox } from "@/components/ClaimsInbox";
import { ClaimDetail } from "@/components/ClaimDetail";
import { SimilarClaimsRail } from "@/components/SimilarClaimsRail";

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
  const [selectedId, setSelectedId] = useState(CLAIMS[0].id);
  const [railOpen, setRailOpen] = useState(true);
  const selected = CLAIMS.find((c) => c.id === selectedId) ?? CLAIMS[0];

  return (
    <div className="flex h-screen w-full bg-background font-sans text-sm text-foreground overflow-hidden">
      <ClaimsInbox claims={CLAIMS} selectedId={selectedId} onSelect={setSelectedId} />
      <ClaimDetail claim={selected} railOpen={railOpen} onOpenRail={() => setRailOpen(true)} />
      {railOpen && (
        <SimilarClaimsRail similar={selected.similar} onClose={() => setRailOpen(false)} />
      )}
    </div>
  );
}
