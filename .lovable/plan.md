## Goal

Replace the current confidence model with your revised two-level design: 4 non-overlapping line signals, plus a separate claim-level consistency *multiplier* (not a 5th equal slice).

## New line-item signals (4, equally weighted at 25%)

Replaces today's `visualEvidence / actionFit / pricingFit / comparableStrength`:

1. **Damage classification confidence** — model's certainty that the identified repair *action* matches what the photo shows (subsumes today's "action fit").
2. **Photo evidence sufficiency (line-scoped)** — how visible/in-focus *this specific repair area* is. Different lines on the same claim can score differently.
3. **Cost estimate precision** — tightness of the labor-hours/parts-cost band given data density for this action × vehicle type.
4. **Historical comparable strength** — count and cluster-tightness of matched historical actions.

Line `confidence` = simple average of the four signals (rounded). This is what shows in the table and the line popover.

## New total claim confidence

Two-step, transparent calculation:

```text
Step 1: rolledUp = avg( each line's confidence )
Step 2: total    = round( rolledUp × consistencyMultiplier )
```

`consistencyMultiplier` derived from active flags:

| Flag state | Multiplier |
|---|---|
| No active flags | 1.00 |
| Any 1 moderate flag (`severity`) | 0.85 |
| Any severe mismatch (`description` or `vehicle`) | 0.65 |
| Multiple flags | min of the above (lowest wins) |

When an agent marks a flag reviewed, the multiplier recalculates → total rises → already logged via existing `handleDismissFlag` recalc audit entry.

## UI changes

### Line popover (`ClaimDetail.tsx` `LineConfidencePopover`)
- Update the 4 factor labels & detail copy to the new names.
- Math line stays: `Avg: (f1+f2+f3+f4) ÷ 4 = X%`.

### Total confidence dashboard (`ConfidenceBreakdown.tsx`)
Restructure from "5 equal-weight signals" to the two-step view:

```text
┌─ Step 1: Repair-plan confidence (avg of N lines) ──── 88%
│    [mini list: each line + its confidence]
│
├─ Step 2: Claim consistency adjustment ──────────────  × 0.65
│    [shows active flags + which multiplier applied]
│
└─ Total: 88% × 0.65 = 57%
```

- Replace the 5 metric cards with: (a) a "Line rollup" card listing each line's contribution, (b) a "Consistency adjustment" card showing flags → multiplier.
- Keep the donut hero, level label (High/Moderate/Low), and the "active flag is suppressing this score" callout — repurpose it to show the without-flag total = `rolledUp × 1.0`.
- Drop the old weighted-sum math block; replace with the `rollup × multiplier = total` math block.

### Inbox sidebar (`ClaimsInbox.tsx`)
No change — still calls `getConfidenceBreakdown(claim).overall`, will automatically reflect new total.

## Data-model changes (`src/data/claims.ts`)

- `LineConfidenceFactor.key`: rename union to `"damageClassification" | "photoSufficiency" | "costPrecision" | "comparableStrength"`. Update labels/details in `getLineConfidenceBreakdown`. Math stays seeded-deterministic so sub-signals still average back to `line.confidence`.
- `ConfidenceMetric` type: replace with a new shape:
  ```ts
  export type ConfidenceBreakdown = {
    rolledUp: number;          // step 1
    lineContribs: { id: string; action: string; confidence: number }[];
    multiplier: number;        // step 2 (e.g. 0.65)
    multiplierReason: string;  // "Severe vehicle mismatch flag active"
    activeFlags: ClaimFlag[];
    overall: number;           // final
  };
  ```
- Rewrite `getConfidenceBreakdown(claim)` to return the new shape.
- Remove the old 5-signal `metrics` array and its `photoCompleteness / damageComplexity / repairScope / claimConsistency` derivations (no longer used anywhere).

## Files touched

- `src/data/claims.ts` — types + `getConfidenceBreakdown` + `getLineConfidenceBreakdown` labels.
- `src/components/ConfidenceBreakdown.tsx` — full restructure of the dashboard.
- `src/components/ClaimDetail.tsx` — update line popover labels + the small inline "How this score is calculated" preview popover that shows on the total chip (it currently lists the 5 metrics; switch to step1/step2 summary).
- `src/components/ClaimsInbox.tsx` — no logic change; just consumes new `overall`.

## Out of scope

- Changing flag definitions or how flags get raised in `claims.ts` seed data.
- Per-line weighting (kept equal at 25% as you specified).
- Configurable multiplier thresholds (hard-coded for now; easy to tune later).