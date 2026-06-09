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
  cost: number;
  confidence: number; // 0-100
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
          cost: 480,
          confidence: 94,
        },
        {
          id: "l2",
          action: "Taillamp Housing Inspection",
          type: "Repair",
          laborHours: 0.6,
          cost: 145,
          confidence: 71,
        },
        {
          id: "l3",
          action: "Paint & Refinish (Metallic Pearl)",
          type: "Refinish",
          laborHours: 3.5,
          cost: 520,
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
          cost: 540,
          confidence: 93,
        },
        {
          id: "l2",
          action: "Headlamp Assemblies (Pair)",
          type: "Replacement",
          laborHours: 1.4,
          cost: 380,
          confidence: 91,
        },
        {
          id: "l3",
          action: "Full Exterior Repaint (Red)",
          type: "Refinish",
          laborHours: 12.0,
          cost: 2150,
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
          cost: 640,
          confidence: 88,
        },
        {
          id: "l2",
          action: "Front Bumper Corner Blend",
          type: "Refinish",
          laborHours: 2.0,
          cost: 420,
          confidence: 74,
        },
        {
          id: "l3",
          action: "Suspension Geometry Check",
          type: "Service",
          laborHours: 1.0,
          cost: 180,
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
          cost: 0,
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
          cost: 0,
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
        { id: "l1", action: "Panel Replacement", type: "Replacement", laborHours: 4.5, cost: 1450, confidence: 78 },
        { id: "l2", action: "Lamp Assembly Replacement", type: "Replacement", laborHours: 1.2, cost: 420, confidence: 74 },
        { id: "l3", action: "Paint & Refinish", type: "Refinish", laborHours: 5.0, cost: 880, confidence: 66 },
        { id: "l4", action: "Structural Inspection", type: "Service", laborHours: 1.5, cost: 240, confidence: 55 },
      ],
    };
  }
  if (severity === "Moderate") {
    return {
      overallConfidence: 81,
      summary:
        "Moderate cosmetic and minor structural damage. Dent repair, bumper blend, and partial refinish recommended.",
      lines: [
        { id: "l1", action: "Dent Repair", type: "Repair", laborHours: 2.5, cost: 520, confidence: 88 },
        { id: "l2", action: "Bumper Corner Blend", type: "Refinish", laborHours: 2.0, cost: 410, confidence: 79 },
        { id: "l3", action: "Paint & Refinish (partial)", type: "Refinish", laborHours: 2.5, cost: 380, confidence: 76 },
      ],
    };
  }
  return {
    overallConfidence: 90,
    summary:
      "Minor cosmetic damage. Paintless dent repair and spot refinish should restore the affected area.",
    lines: [
      { id: "l1", action: "Paintless Dent Repair", type: "Repair", laborHours: 1.2, cost: 220, confidence: 93 },
      { id: "l2", action: "Spot Refinish", type: "Refinish", laborHours: 1.0, cost: 180, confidence: 89 },
    ],
  };
}