## Goal
Give the per-claim Audit Log significantly more room by replacing the current popover with a right-side slide-in drawer. The claim detail stays visible behind it, and the log can comfortably show full event details, timestamps, and rationales.

## Changes

### 1. New component: `src/components/AuditLogPanel.tsx`
- Built on shadcn `Sheet` (right side), width ~`sm:max-w-xl` (~36rem) so entries get ~2× the room of today's popover.
- Header: "Claim Audit Log" + claim ID + total event count.
- Body: scrollable timeline reusing the existing `AuditRow` styling (icon badge, summary, timestamp, detail, actor).
- Sort: newest first (same as today).
- Empty state: "No activity yet."
- Optional small touch: group entries by day with a subtle date divider, since there's now room for it.

### 2. `src/components/ClaimDetail.tsx`
- Remove `AuditLogPopover` and replace the trigger button with one that opens the new sheet (same `History` icon + count badge, same placement next to "Show similar claims").
- Move the existing `AuditRow` + `auditMeta` helpers into `AuditLogPanel.tsx` (or export them) so the new panel can render rows identically.
- Local `useState` for `auditOpen` to control the sheet.

### 3. No data model changes
- Still per-claim, driven by `claim.auditLog`. No changes to `src/data/claims.ts` or `src/routes/index.tsx`.

## Out of scope
- Global cross-claim audit log.
- Filtering/search inside the log (can be added later if useful).
- Exporting the log.

## Visual reference
```text
┌─ Claim Review ──────────────────────┬─ Audit Log (CLM-9022) · 6 events ──┐
│  ...claim detail stays visible...    │  Today                              │
│                                      │  ● Override saved on 2 line items   │
│                                      │    Alex Park · 2:14 PM              │
│                                      │    "Shop bid came in lower…"        │
│                                      │  ● Flag marked as reviewed          │
│                                      │  Yesterday                          │
│                                      │  ● AI estimate generated (78%)      │
│                                      │  ● Claim submitted                  │
└──────────────────────────────────────┴─────────────────────────────────────┘
```
