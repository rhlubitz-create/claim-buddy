import claim9022 from "@/assets/claim-9022.jpg";
import claim8590 from "@/assets/claim-8590.jpg";
import claim8712 from "@/assets/claim-8712.jpg";
import hist1205 from "@/assets/hist-1205.jpg";
import hist0982 from "@/assets/hist-0982.jpg";

export type Severity = "Minor" | "Moderate" | "Severe";
export type ClaimStatus = "New" | "In Review" | "Sent for Approval";

export type MismatchFlag = {
  kind: "severity" | "vehicle" | "description" | "policy";
  title: string;
  detail: string;
};

export type EstimateLine = {
  id: string;
  action: string;
  type: "Replacement" | "Repair" | "Refinish" | "Service" | "Labor";
  laborHours: number;
  laborRate: number; // $/hr — looked up from LABOR_RATES by type, editable as a correction
  partsCost: number;
  confidence: number; // 0-100
  overridden?: boolean;
  override?: {
    by: string;
    rationale: string;
    at: string; // ISO timestamp
    previousLaborHours: number;
    previousLaborRate: number;
    previousPartsCost: number;
  };
};

// Regional average labor rates by repair-action type (USD/hr). Sourced from
// market survey data across shops in the policyholder's region, refreshed
// periodically by ops. Agents can override the per-line rate to reflect a
// specific shop's bid; they edit hours to express judgment about repair
// complexity.
export const LABOR_RATES: Record<EstimateLine["type"], number> = {
  Replacement: 95,
  Repair: 145,
  Refinish: 120,
  Service: 180,
  Labor: 110,
};

export function laborCostOf(l: EstimateLine): number {
  return Math.round((l.laborHours ?? 0) * (l.laborRate ?? 0));
}

export function lineTotal(l: EstimateLine): number {
  return laborCostOf(l) + (l.partsCost ?? 0);
}

export type AuditEntry = {
  at: string; // ISO timestamp
  actor: string;
  kind:
    | "claim_filed"
    | "ai_estimate_generated"
    | "flag_reviewed"
    | "override_saved"
    | "line_added"
    | "claim_accepted"
    | "claim_rejected";
  summary: string;
  detail?: string;
};

export type SimilarClaim = {
  id: string;
  vehicle: string;
  finalCost: number;
  matchPct: number;
  matchedOn: string;
  photo: string;
};

export type Claim = {
  id: string;
  status: ClaimStatus;
  filedAt: string;
  policyholder: {
    userId: string;
    name: string;
    policyNumber: string;
    coverage: string;
  };
  vehicle: { make: string; model: string; year: number; vin: string };
  accident: {
    type: string;
    description: string;
    damageLocation: string;
    damageType: string;
    severity: Severity;
  };
  photo: string;
  flags: MismatchFlag[];
  estimate: {
    lines: EstimateLine[];
    overallConfidence: number;
    summary: string;
  };
  similar: SimilarClaim[];
  auditLog?: AuditEntry[];
};

export const CLAIMS: Claim[] = [
  {
    id: "CLM-9022",
    status: "New",
    filedAt: "2026-06-07T14:22:00Z",
    policyholder: {
      userId: "992-00-112",
      name: "Marcus Vance",
      policyNumber: "P-99120034",
      coverage: "Premium Comprehensive",
    },
    vehicle: { make: "Tesla", model: "Model 3", year: 2022, vin: "5YJ3E1EA6NF40XXXX" },
    accident: {
      type: "Reversing collision",
      description:
        "Severe rear-end damage after backing into a steel post. Rear quarter panel crushed, taillamp housing destroyed, structural damage suspected.",
      damageLocation: "Rear right quarter panel",
      damageType: "Impact",
      severity: "Severe",
    },
    photo: claim9022,
    flags: [
      {
        kind: "severity",
        title: "Severity mismatch",
        detail:
          "Photo shows minor cosmetic damage at rear quarter panel (hairline paint crack, small dent near taillamp). Claim reports 'Severe' with structural damage.",
      },
    ],
    estimate: {
      overallConfidence: 82,
      summary:
        "Damage appears cosmetic at rear quarter panel. Paint refinish and minor dent repair recommended; structural inspection not indicated.",
      lines: [
        {
          id: "l1",
          action: "Rear Quarter Panel Dent Repair",
          type: "Repair",
          laborHours: 2.2,
          laborRate: 145,
          partsCost: 60,
          confidence: 94,
        },
        {
          id: "l2",
          action: "Taillamp Housing Inspection",
          type: "Repair",
          laborHours: 0.6,
          laborRate: 145,
          partsCost: 0,
          confidence: 71,
        },
        {
          id: "l3",
          action: "Paint & Refinish (Metallic Pearl)",
          type: "Refinish",
          laborHours: 3.5,
          laborRate: 120,
          partsCost: 180,
          confidence: 58,
        },
      ],
    },
    similar: [
      {
        id: "CLM-1205",
        vehicle: "2020 Toyota 86",
        finalCost: 1240,
        matchPct: 92,
        matchedOn: "Rear quarter panel paint crack pattern",
        photo: hist1205,
      },
      {
        id: "CLM-0982",
        vehicle: "1986 Ford LTD",
        finalCost: 980,
        matchPct: 78,
        matchedOn: "Severity classification (Level 1 cosmetic)",
        photo: hist0982,
      },
    ],
  },
  {
    id: "CLM-8590",
    status: "New",
    filedAt: "2026-06-05T18:30:00Z",
    policyholder: {
      userId: "859-01-440",
      name: "David Okonkwo",
      policyNumber: "P-85900118",
      coverage: "Standard Collision",
    },
    vehicle: { make: "Toyota", model: "Camry", year: 2019, vin: "4T1B11HK9KUXXXXXX" },
    accident: {
      type: "Front-end collision",
      description: "Hit from front while stopped. Driver-side headlight smashed.",
      damageLocation: "Front left",
      damageType: "Impact / Broken assembly",
      severity: "Moderate",
    },
    photo: claim8590,
    flags: [
      {
        kind: "vehicle",
        title: "Vehicle mismatch",
        detail:
          "Claim filed for 2019 Toyota Camry, but photo shows a black Volkswagen Touareg (VW badge visible on grille, intact headlamp). Verify VIN before proceeding.",
      },
    ],
    estimate: {
      overallConfidence: 45,
      summary:
        "Estimate suppressed pending vehicle verification. Mismatch between claim metadata and submitted photo.",
      lines: [
        {
          id: "l1",
          action: "Headlamp Assembly (verify vehicle first)",
          type: "Replacement",
          laborHours: 1.2,
          laborRate: 95,
          partsCost: 0,
          confidence: 35,
        },
      ],
    },
    similar: [],
  },
];

// Out-of-policy demo claim — coverage is "Liability Only" which excludes
// damage to the policyholder's own vehicle. Should be rejected on intake.
CLAIMS.push({
  id: "CLM-8501",
  status: "New",
  filedAt: "2026-06-05T08:14:00Z",
  policyholder: {
    userId: "850-12-007",
    name: "Robert Hayes",
    policyNumber: "P-85010044",
    coverage: "Liability Only",
  },
  vehicle: { make: "Subaru", model: "Outback", year: 2017, vin: "4S4BSANC7H30XXXXX" },
  accident: {
    type: "Single-vehicle collision",
    description:
      "Driver lost control on wet road and struck a guardrail. Front-left fender and bumper damaged. Filing for own-vehicle repair costs.",
    damageLocation: "Front-left fender & bumper",
    damageType: "Impact / Scrape",
    severity: "Moderate",
  },
  photo: claim8712,
  flags: [
    {
      kind: "policy",
      title: "Out of policy",
      detail:
        "Policyholder's coverage is 'Liability Only', which covers damage to other parties but excludes damage to the insured's own vehicle. This single-vehicle collision claim is not covered. Recommend rejection with explanation and offer to upgrade coverage.",
    },
  ],
  estimate: {
    overallConfidence: 38,
    summary:
      "Claim falls outside policy coverage. No estimate generated — recommend rejection at intake.",
    lines: [
      {
        id: "l1",
        action: "Coverage review — not covered under Liability Only policy",
        type: "Service",
        laborHours: 0,
        laborRate: 180,
        partsCost: 0,
        confidence: 30,
      },
    ],
  },
  similar: [],
});

// Registry of known policyholders for the "Submit a Claim" lookup.
// Entering a User ID in the form auto-fills name, policy #, and vehicle.
export type PolicyholderRecord = {
  userId: string;
  name: string;
  policyNumber: string;
  coverage: string;
  vehicle: { make: string; model: string; year: number; vin: string };
};

export const POLICYHOLDERS: Record<string, PolicyholderRecord> = {
  "100-55-880": {
    userId: "100-55-880",
    name: "Sarah Bennett",
    policyNumber: "P-10055088",
    coverage: "Premium Comprehensive",
    vehicle: { make: "Honda", model: "Accord", year: 2021, vin: "1HGCV1F30MA0XXXXX" },
  },
  "992-00-112": {
    userId: "992-00-112",
    name: "Marcus Vance",
    policyNumber: "P-99120034",
    coverage: "Premium Comprehensive",
    vehicle: { make: "Tesla", model: "Model 3", year: 2022, vin: "5YJ3E1EA6NF40XXXX" },
  },
  "859-01-440": {
    userId: "859-01-440",
    name: "David Okonkwo",
    policyNumber: "P-85900118",
    coverage: "Standard Collision",
    vehicle: { make: "Toyota", model: "Camry", year: 2019, vin: "4T1B11HK9KUXXXXXX" },
  },
  "850-12-007": {
    userId: "850-12-007",
    name: "Robert Hayes",
    policyNumber: "P-85010044",
    coverage: "Liability Only",
    vehicle: { make: "Subaru", model: "Outback", year: 2017, vin: "4S4BSANC7H30XXXXX" },
  },
};

// Default historical comparables shown in the rail for newly-submitted claims.
export const DEFAULT_SIMILAR: SimilarClaim[] = [
  {
    id: "CLM-1205",
    vehicle: "2020 Toyota 86",
    finalCost: 1240,
    matchPct: 84,
    matchedOn: "Front fender / bumper corner impact pattern",
    photo: hist1205,
  },
  {
    id: "CLM-0982",
    vehicle: "1986 Ford LTD",
    finalCost: 980,
    matchPct: 71,
    matchedOn: "Severity classification (Level 1 cosmetic)",
    photo: hist0982,
  },
];

// Generate a plausible AI estimate for a freshly-submitted claim, based on
// damage severity. Used by the Submit-a-Claim flow so new inbox items show a
// realistic AI review without hand-authoring each one.
export function generateEstimateForNewClaim(severity: Severity): Claim["estimate"] {
  if (severity === "Severe") {
    return {
      overallConfidence: 68,
      summary:
        "Damage appears significant. Recommend panel replacement, headlamp/taillamp inspection, and full refinish. Structural inspection advised before final approval.",
      lines: [
        { id: "l1", action: "Panel Replacement", type: "Replacement", laborHours: 4.5, laborRate: 95, partsCost: 950, confidence: 78 },
        { id: "l2", action: "Lamp Assembly Replacement", type: "Replacement", laborHours: 1.2, laborRate: 95, partsCost: 300, confidence: 74 },
        { id: "l3", action: "Paint & Refinish", type: "Refinish", laborHours: 5.0, laborRate: 120, partsCost: 280, confidence: 66 },
        { id: "l4", action: "Structural Inspection", type: "Service", laborHours: 1.5, laborRate: 180, partsCost: 0, confidence: 55 },
      ],
    };
  }
  if (severity === "Moderate") {
    return {
      overallConfidence: 81,
      summary:
        "Moderate cosmetic and minor structural damage. Dent repair, bumper blend, and partial refinish recommended.",
      lines: [
        { id: "l1", action: "Dent Repair", type: "Repair", laborHours: 2.5, laborRate: 145, partsCost: 80, confidence: 88 },
        { id: "l2", action: "Bumper Corner Blend", type: "Refinish", laborHours: 2.0, laborRate: 120, partsCost: 140, confidence: 79 },
        { id: "l3", action: "Paint & Refinish (partial)", type: "Refinish", laborHours: 2.5, laborRate: 120, partsCost: 130, confidence: 76 },
      ],
    };
  }
  return {
    overallConfidence: 90,
    summary:
      "Minor cosmetic damage. Paintless dent repair and spot refinish should restore the affected area.",
    lines: [
      { id: "l1", action: "Paintless Dent Repair", type: "Repair", laborHours: 1.2, laborRate: 145, partsCost: 0, confidence: 93 },
      { id: "l2", action: "Spot Refinish", type: "Refinish", laborHours: 1.0, laborRate: 120, partsCost: 60, confidence: 89 },
    ],
  };
}

// Per-line confidence is the simple average of four non-overlapping signals
// the model evaluates for each repair action. Sub-scores are derived
// deterministically from the line so they always average back to the
// displayed line.confidence value.
export type LineConfidenceFactor = {
  key:
    | "damageClassification"
    | "photoSufficiency"
    | "costPrecision"
    | "comparableStrength";
  label: string;
  weight: number; // 0-1, equal at 0.25 across all four factors
  score: number; // 0-100
  detail: string;
};

export function getLineConfidenceBreakdown(line: EstimateLine): {
  factors: LineConfidenceFactor[];
  overall: number;
} {
  // Deterministic offsets seeded from the line id so sub-scores feel varied
  // but always average back to line.confidence.
  const seed = Array.from(line.id).reduce((s, ch) => s + ch.charCodeAt(0), 0);
  const base = line.confidence;
  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

  // Offsets sum to 0 so the average equals base.
  const offsets = [
    ((seed % 7) - 3),       // visual evidence
    (((seed + 2) % 5) - 2), // action fit
  ];
  const o3 = ((seed + 5) % 9) - 4; // pricing fit
  const o4 = -(offsets[0] + offsets[1] + o3); // comparable strength balances
  const allOffsets = [offsets[0], offsets[1], o3, o4];

  // Action fit is anchored higher for "Replacement" / "Repair" of the same
  // damage area (the action obviously matches the visible damage); pricing
  // fit is anchored slightly lower to reflect that parts/labor pricing has
  // more spread in real comparables.
  const anchors =
    line.type === "Replacement" || line.type === "Repair"
      ? [+2, +4, -3, -3]
      : line.type === "Refinish"
        ? [+1, +2, -2, -1]
        : [0, 0, 0, 0];
  // Re-balance anchors so they sum to 0 (preserve the average).
  const anchorMean = anchors.reduce((a, b) => a + b, 0) / anchors.length;
  const balancedAnchors = anchors.map((a) => a - anchorMean);

  const scores = allOffsets.map((o, i) => clamp(base + o + balancedAnchors[i]));

  return {
    overall: base,
    factors: [
      {
        key: "damageClassification",
        label: "Damage classification confidence",
        weight: 0.25,
        score: scores[0],
        detail:
          "How confident the model is that this is the correct repair action for the damage visible in the photo (e.g. dent requiring PDR vs. crack requiring panel replacement). Identifies what's wrong before pricing it.",
      },
      {
        key: "photoSufficiency",
        label: "Photo evidence sufficiency",
        weight: 0.25,
        score: scores[1],
        detail:
          "How much of this specific repair area is actually visible, in focus, and at a usable angle. Scoped to this line — a single photo set can have very different sufficiency scores per line.",
      },
      {
        key: "costPrecision",
        label: "Cost estimate precision",
        weight: 0.25,
        score: scores[2],
        detail:
          "Given the classified damage, how tight the labor-hour and parts-cost band is based on historical density for this action × this vehicle type. Lower for rare combinations.",
      },
      {
        key: "comparableStrength",
        label: "Historical comparable strength",
        weight: 0.25,
        score: scores[3],
        detail:
          "How many closely-matched historical repairs (same action, similar vehicle class & severity) exist, and how tightly their actual outcomes cluster — supporting evidence for the precision claim above.",
      },
    ],
  };
}

// Total claim confidence is a transparent two-step calculation:
//   Step 1: rolledUp = simple avg of each line's confidence (each line
//           is itself an equal-weight avg of its 4 sub-signals)
//   Step 2: overall  = round(rolledUp × consistencyMultiplier)
// The multiplier is 1.0 with no active flags; severe mismatches drop it
// proportionally so the penalty is transparent rather than diluted into
// a fixed equal-weight slice.
export type ClaimConfidenceBreakdown = {
  rolledUp: number;
  lineContribs: { id: string; action: string; confidence: number }[];
  multiplier: number;
  multiplierLabel: string;
  multiplierDetail: string;
  activeFlags: MismatchFlag[];
  overall: number;
};

function consistencyMultiplierFor(flags: MismatchFlag[]): {
  multiplier: number;
  label: string;
  detail: string;
} {
  if (flags.length === 0) {
    return {
      multiplier: 1.0,
      label: "No active flags",
      detail:
        "Photo, vehicle, and severity classification all align. No consistency penalty applied.",
    };
  }
  const hasSevere = flags.some(
    (f) => f.kind === "vehicle" || f.kind === "description" || f.kind === "policy",
  );
  if (hasSevere) {
    return {
      multiplier: 0.65,
      label: "Severe mismatch",
      detail:
        "Severe flag active (vehicle, description, or policy coverage) — claim cannot be validated against the submitted evidence or coverage. Heavy penalty applied until reviewed.",
    };
  }
  return {
    multiplier: 0.85,
    label: "Moderate mismatch",
    detail:
      "Reported severity does not match photo evidence. Moderate penalty applied until the flag is reviewed.",
  };
}

export function getConfidenceBreakdown(
  claim: Claim,
): ClaimConfidenceBreakdown {
  const lines = claim.estimate.lines;
  const rolledUp = lines.length
    ? Math.round(lines.reduce((s, l) => s + l.confidence, 0) / lines.length)
    : 0;
  const { multiplier, label, detail } = consistencyMultiplierFor(claim.flags);
  const overall = Math.round(rolledUp * multiplier);

  return {
    rolledUp,
    lineContribs: lines.map((l) => ({
      id: l.id,
      action: l.action,
      confidence: l.confidence,
    })),
    multiplier,
    multiplierLabel: label,
    multiplierDetail: detail,
    activeFlags: claim.flags,
    overall,
  };
}