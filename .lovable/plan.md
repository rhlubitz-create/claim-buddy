## Goal
Eliminate the overlap between the Similar Historical Claims rail and the Audit Log sheet by merging them into a single right-side panel with two tabs: **Similar Claims** and **Audit Log**. Always-visible, no overlay, no sheet.

## Changes

### 1. New component: `src/components/ContextRail.tsx`
- Fixed-width right sidebar (`w-80`), full height, flex column, border-left.
- Top: tab strip with two pills — "Similar Claims" and "Audit Log" (with event count badge).
- Active tab styled per the chosen prototype (white pill with subtle shadow on a slate background).
- Body: scrollable area that renders either `<SimilarClaimsList>` or `<AuditLogList>` based on active tab.
- Close button (X) in the corner to hide the entire rail (preserves existing collapse behavior).
- Reuses existing similar-claim card markup and existing audit row + day-grouping logic.

### 2. `src/components/ClaimDetail.tsx`
- Remove the standalone `History` icon button that opened the audit sheet.
- Keep "Show similar claims" button as the way to re-open the rail when collapsed (rename to "Show context" or similar).
- Remove `AuditLogPanel` import + `auditOpen` state.

### 3. `src/routes/index.tsx`
- Replace `<SimilarClaimsRail>` render with `<ContextRail>`, passing `similar`, `auditLog`, `claimId`, and `onClose`.

### 4. Cleanup
- Delete `src/components/AuditLogPanel.tsx` and `src/components/SimilarClaimsRail.tsx` once `ContextRail` covers their content (move the historical-claim Dialog detail view into `ContextRail` too).

## Out of scope
- No data model changes.
- No changes to per-claim audit semantics or similar-claims data.
- Bottom drawer / modal alternatives (rejected in favor of tabs).

## Visual reference
```text
┌─ Claim Review ─────────────────┬─ [Similar Claims | Audit Log (6)] ─┐
│  ...claim detail...            │  Active tab content scrolls here   │
│                                │  Cards / timeline / day groups     │
└────────────────────────────────┴────────────────────────────────────┘
```
