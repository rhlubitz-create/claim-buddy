import claim9022 from "@/assets/claim-9022.jpg";
import claim8841 from "@/assets/claim-8841.jpg";
import claim8712 from "@/assets/claim-8712.jpg";
import claim8654 from "@/assets/claim-8654.jpg";
import claim8590 from "@/assets/claim-8590.jpg";
import hist1205 from "@/assets/hist-1205.jpg";
import hist0982 from "@/assets/hist-0982.jpg";
import hist1418 from "@/assets/hist-1418.jpg";

export type Severity = "Minor" | "Moderate" | "Severe";
export type ClaimStatus = "New" | "In Review" | "Sent for Approval";

export type MismatchFlag = {
  kind: "severity" | "vehicle" | "description";
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
    | "claim_accepted";
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
    id: "CLM-8841",
    status: "New",
    filedAt: "2026-06-07T11:08:00Z",
    policyholder: {
      userId: "881-44-201",
      name: "Elena Rossi",
      policyNumber: "P-88410029",
      coverage: "Comprehensive + Vandalism",
    },
    vehicle: { make: "Fiat", model: "Cinquecento", year: 1995, vin: "ZFA17000000XXXXXX" },
    accident: {
      type: "Vandalism / Parts theft",
      description:
        "Vehicle vandalized overnight while parked on the street. Front bumper assembly and headlamps removed, extensive spray-paint graffiti across hood, doors and quarter panels.",
      damageLocation: "Front end + body panels",
      damageType: "Vandalism / Theft",
      severity: "Severe",
    },
    photo: claim8841,
    flags: [],
    estimate: {
      overallConfidence: 88,
      summary:
        "Vandalism + parts theft. Front bumper and headlamps require replacement; full exterior repaint needed to remove graffiti.",
      lines: [
        {
          id: "l1",
          action: "Front Bumper Assembly (Fiat OEM)",
          type: "Replacement",
          laborHours: 2.5,
          laborRate: 95,
          partsCost: 380,
          confidence: 93,
        },
        {
          id: "l2",
          action: "Headlamp Assemblies (Pair)",
          type: "Replacement",
          laborHours: 1.4,
          laborRate: 95,
          partsCost: 280,
          confidence: 91,
        },
        {
          id: "l3",
          action: "Full Exterior Repaint (Red)",
          type: "Refinish",
          laborHours: 12.0,
          laborRate: 120,
          partsCost: 650,
          confidence: 84,
        },
      ],
    },
    similar: [
      {
        id: "CLM-1418",
        vehicle: "1998 Fiat Punto",
        finalCost: 2840,
        matchPct: 86,
        matchedOn: "Vandalism + graffiti removal scope",
        photo: hist1418,
      },
    ],
  },
  {
    id: "CLM-8712",
    status: "In Review",
    filedAt: "2026-06-06T16:45:00Z",
    policyholder: {
      userId: "871-22-918",
      name: "Julian Chen",
      policyNumber: "P-87120118",
      coverage: "Standard Comprehensive",
    },
    vehicle: { make: "Audi", model: "RS5", year: 2022, vin: "WUAPWAF55NA0XXXXX" },
    accident: {
      type: "Curb strike",
      description:
        "Driver scraped a high curb during a tight parking maneuver. Black abrasion marks across front-left fender and bumper corner.",
      damageLocation: "Front-left fender & bumper corner",
      damageType: "Scrape / Paint damage",
      severity: "Moderate",
    },
    photo: claim8712,
    flags: [],
    estimate: {
      overallConfidence: 76,
      summary:
        "Surface damage requiring fender refinish and bumper blend. No structural concerns; suspension geometry check recommended.",
      lines: [
        {
          id: "l1",
          action: "Front-Left Fender Refinish",
          type: "Refinish",
          laborHours: 3.0,
          laborRate: 120,
          partsCost: 220,
          confidence: 88,
        },
        {
          id: "l2",
          action: "Front Bumper Corner Blend",
          type: "Refinish",
          laborHours: 2.0,
          laborRate: 120,
          partsCost: 140,
          confidence: 74,
        },
        {
          id: "l3",
          action: "Suspension Geometry Check",
          type: "Service",
          laborHours: 1.0,
          laborRate: 180,
          partsCost: 0,
          confidence: 82,
        },
      ],
    },
    similar: [
      {
        id: "CLM-0871",
        vehicle: "2021 Audi A4",
        finalCost: 1240,
        matchPct: 89,
        matchedOn: "Front fender curb-strike abrasion pattern",
        photo: hist0982,
      },
    ],
  },
  {
    id: "CLM-8654",
    status: "New",
    filedAt: "2026-06-06T09:12:00Z",
    policyholder: {
      userId: "865-77-303",
      name: "Priya Sharma",
      policyNumber: "P-86540077",
      coverage: "Premium Comprehensive",
    },
    vehicle: { make: "Mercedes-Benz", model: "GLE 350", year: 2020, vin: "4JGDA5HB1LA0XXXXX" },
    accident: {
      type: "Front-end collision (reported)",
      description:
        "Policyholder reports head-on collision at low-speed intersection. Hood and grille reported as damaged; submitted photo does not show damage from this angle.",
      damageLocation: "Front end (reported)",
      damageType: "Impact (reported)",
      severity: "Severe",
    },
    photo: claim8654,
    flags: [
      {
        kind: "description",
        title: "Photo insufficient",
        detail:
          "Submitted photo shows the front of a black Mercedes-Benz GLE with no visible damage. Claim reports 'Severe' front-end collision. Request additional photos before approval.",
      },
    ],
    estimate: {
      overallConfidence: 41,
      summary:
        "Estimate held pending additional photos. No damage detectable in current image; cannot validate reported severity.",
      lines: [
        {
          id: "l1",
          action: "Pending — additional photos required",
          type: "Service",
          laborHours: 0,
          laborRate: 180,
          partsCost: 0,
          confidence: 30,
        },
      ],
    },
    similar: [],
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
  "881-44-201": {
    userId: "881-44-201",
    name: "Elena Rossi",
    policyNumber: "P-88410029",
    coverage: "Comprehensive + Vandalism",
    vehicle: { make: "Fiat", model: "Cinquecento", year: 1995, vin: "ZFA17000000XXXXXX" },
  },
  "871-22-918": {
    userId: "871-22-918",
    name: "Julian Chen",
    policyNumber: "P-87120118",
    coverage: "Standard Comprehensive",
    vehicle: { make: "Audi", model: "RS5", year: 2022, vin: "WUAPWAF55NA0XXXXX" },
  },
  "865-77-303": {
    userId: "865-77-303",
    name: "Priya Sharma",
    policyNumber: "P-86540077",
    coverage: "Premium Comprehensive",
    vehicle: { make: "Mercedes-Benz", model: "GLE 350", year: 2020, vin: "4JGDA5HB1LA0XXXXX" },
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
        key: "visualEvidence",
        label: "Visual evidence in photo",
        weight: 0.25,
        score: scores[0],
        detail:
          "How clearly the submitted photo shows the damage that this repair action targets — angle, lighting, and whether the affected panel is fully visible.",
      },
      {
        key: "actionFit",
        label: "Repair action fit",
        weight: 0.25,
        score: scores[1],
        detail:
          "How well this specific action (replace vs. repair vs. refinish) matches the damage type and severity the model detected.",
      },
      {
        key: "pricingFit",
        label: "Parts & labor pricing fit",
        weight: 0.25,
        score: scores[2],
        detail:
          "How closely the estimated labor hours and parts cost track the regional rate table and historical comparables for this action.",
      },
      {
        key: "comparableStrength",
        label: "Historical comparable strength",
        weight: 0.25,
        score: scores[3],
        detail:
          "How many similar past claims included this exact line item, and how tight the cost distribution was across them.",
      },
    ],
  };
}

export function getConfidenceBreakdown(claim: Claim): {
  metrics: ConfidenceMetric[];
  overall: number;
} {
  const lines = claim.estimate.lines;
  const lineItemAvg = lines.length
    ? Math.round(lines.reduce((s, l) => s + l.confidence, 0) / lines.length)
    : 0;
  const historicalMatch = claim.similar.length
    ? Math.round(
        claim.similar.reduce((s, x) => s + x.matchPct, 0) / claim.similar.length,
      )
    : 0;

  const hasPhotoMismatch = claim.flags.some(
    (f) => f.kind === "description" || f.kind === "vehicle",
  );
  const hasSeverityFlag = claim.flags.some((f) => f.kind === "severity");
  const hasPending = lines.some((l) =>
    l.action.toLowerCase().includes("pending"),
  );

  // Photo & input quality: high when photo matches the reported damage; low
  // when an explicit photo/vehicle mismatch flag was raised.
  const photoCompleteness = hasPhotoMismatch ? 32 : hasSeverityFlag ? 64 : 84;

  // Damage complexity & scope: simpler damage = higher confidence.
  const complexityBase =
    claim.accident.severity === "Severe"
      ? 62
      : claim.accident.severity === "Moderate"
        ? 76
        : 88;
  const damageComplexity = Math.max(
    25,
    complexityBase - (claim.flags.length ? 10 : 0),
  );

  // Repair scope completeness: derived from line-item confidence, with a
  // penalty when the scope contains pending or unconfirmed items.
  const repairScope = hasPending
    ? Math.round(lineItemAvg * 0.75)
    : lineItemAvg;

  // Claim consistency: penalized when any mismatch flag is active.
  const claimConsistency = claim.flags.length > 0 ? 20 : 85;

  const metrics: ConfidenceMetric[] = [
    {
      key: "photoCompleteness",
      label: "Photo & input quality",
      weight: 0.20,
      score: photoCompleteness,
      detail: hasPhotoMismatch
        ? "Submitted photo does not match claim description or vehicle. Request additional documentation."
        : hasSeverityFlag
          ? "Single rear-quarter photo provided. Angle partially obscures taillamp area. Claimant description consistent with photo location."
          : "Photo coverage, focus and angle align well with reported damage location.",
    },
    {
      key: "damageComplexity",
      label: "Damage complexity & scope",
      weight: 0.20,
      score: damageComplexity,
      detail:
        claim.accident.severity === "Severe"
          ? "Multi-area damage (panel + taillamp + paint). Structural damage reported but unconfirmed — expands uncertainty window significantly."
          : claim.accident.severity === "Moderate"
            ? "Moderate cosmetic and minor structural damage. Scope is bounded to specific panels."
            : "Minor cosmetic damage. Well-scoped to a single panel or small area.",
    },
    {
      key: "repairScope",
      label: "Repair scope completeness",
      weight: 0.20,
      score: repairScope,
      detail: hasPending
        ? `${lines.length} repair actions identified. 1 pending item — model cannot confirm scope is complete until inspection done.`
        : `${lines.length} repair actions identified. Model can confirm scope is complete for all visible damage.`,
    },
    {
      key: "historicalMatch",
      label: "Historical match strength",
      weight: 0.20,
      score: historicalMatch,
      detail: claim.similar.length
        ? `${claim.similar.length} comparable closed claim${claim.similar.length === 1 ? "" : "s"} matched (${claim.similar.map((s) => `${s.matchPct}%`).join(" and ")}). Strong precedent for ${claim.accident.damageLocation.toLowerCase()} damage on similar vehicles.`
        : "No comparable historical claims found.",
    },
    {
      key: "claimConsistency",
      label: "Claim consistency",
      weight: 0.20,
      score: claimConsistency,
      detail: claim.flags.length
        ? `Severity mismatch detected. Reported: ${claim.accident.severity} / ${claim.accident.damageType}. Photo evidence: cosmetic Level 1. Flagged for agent review.`
        : "Photo, vehicle, and severity classification align. No inconsistencies detected.",
    },
  ];

  const overall = Math.round(
    metrics.reduce((s, m) => s + m.score * m.weight, 0),
  );

  return { metrics, overall };
}