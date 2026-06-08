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
      type: "Parking lot collision",
      description:
        "Severe front-end damage from collision with concrete barrier. Front bumper destroyed, structural damage suspected.",
      damageLocation: "Front bumper",
      damageType: "Impact",
      severity: "Severe",
    },
    photo: claim9022,
    flags: [
      {
        kind: "severity",
        title: "Severity mismatch",
        detail:
          "Photo shows minor cosmetic damage (paint scuff, hairline crack). Claim reports 'Severe' with structural damage.",
      },
    ],
    estimate: {
      overallConfidence: 82,
      summary:
        "Damage appears cosmetic. Replacement of bumper cover recommended; structural inspection not indicated.",
      lines: [
        {
          id: "l1",
          action: "Front Bumper Cover (Tesla OEM)",
          type: "Replacement",
          laborHours: 2.5,
          cost: 1142,
          confidence: 94,
        },
        {
          id: "l2",
          action: "Headlamp Assembly (Left)",
          type: "Repair",
          laborHours: 0.8,
          cost: 340,
          confidence: 71,
        },
        {
          id: "l3",
          action: "Paint & Refinish (Metallic Pearl)",
          type: "Refinish",
          laborHours: 4.5,
          cost: 585,
          confidence: 58,
        },
      ],
    },
    similar: [
      {
        id: "CLM-1205",
        vehicle: "2021 Tesla Model 3",
        finalCost: 1980,
        matchPct: 92,
        matchedOn: "Bumper + headlamp damage pattern",
        photo: hist1205,
      },
      {
        id: "CLM-0982",
        vehicle: "2020 Honda Accord",
        finalCost: 2450,
        matchPct: 78,
        matchedOn: "Severity classification (Level 2 impact)",
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
      coverage: "Standard Collision",
    },
    vehicle: { make: "BMW", model: "X5", year: 2020, vin: "5UXCR6C0XL9XXXXXX" },
    accident: {
      type: "Parking incident",
      description: "Rear door dented by shopping cart at grocery store parking lot.",
      damageLocation: "Rear passenger door",
      damageType: "Dent",
      severity: "Minor",
    },
    photo: claim8841,
    flags: [],
    estimate: {
      overallConfidence: 94,
      summary:
        "Clean minor-damage claim. Paintless dent repair viable; no parts replacement required.",
      lines: [
        {
          id: "l1",
          action: "Paintless Dent Repair (rear door)",
          type: "Repair",
          laborHours: 2.0,
          cost: 380,
          confidence: 96,
        },
        {
          id: "l2",
          action: "Touch-up Paint",
          type: "Refinish",
          laborHours: 0.5,
          cost: 95,
          confidence: 91,
        },
      ],
    },
    similar: [
      {
        id: "CLM-1418",
        vehicle: "2019 BMW X5",
        finalCost: 420,
        matchPct: 96,
        matchedOn: "Door panel PDR pattern",
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
    vehicle: { make: "Honda", model: "Civic", year: 2023, vin: "2HGFE2F50PHXXXXXX" },
    accident: {
      type: "Sideswipe",
      description:
        "Vehicle sideswiped while parked. Long scrape along passenger side from front door to rear quarter panel.",
      damageLocation: "Passenger side panels",
      damageType: "Scrape / Paint damage",
      severity: "Moderate",
    },
    photo: claim8712,
    flags: [],
    estimate: {
      overallConfidence: 76,
      summary:
        "Surface damage requiring panel refinish. No structural concerns; sensor recalibration not required.",
      lines: [
        {
          id: "l1",
          action: "Passenger Door Panel Refinish",
          type: "Refinish",
          laborHours: 3.5,
          cost: 620,
          confidence: 88,
        },
        {
          id: "l2",
          action: "Rear Quarter Panel Blend",
          type: "Refinish",
          laborHours: 2.5,
          cost: 480,
          confidence: 74,
        },
        {
          id: "l3",
          action: "Clear Coat Application",
          type: "Service",
          laborHours: 1.5,
          cost: 210,
          confidence: 82,
        },
      ],
    },
    similar: [
      {
        id: "CLM-0871",
        vehicle: "2022 Honda Civic",
        finalCost: 1380,
        matchPct: 89,
        matchedOn: "Side panel scrape length & depth",
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
    vehicle: { make: "Ford", model: "F-150", year: 2021, vin: "1FTFW1E50MFXXXXXX" },
    accident: {
      type: "Front-end collision",
      description:
        "Head-on collision at low speed intersection. Hood crumpled, grille destroyed, possible radiator damage.",
      damageLocation: "Front end",
      damageType: "Crumple / Impact",
      severity: "Severe",
    },
    photo: claim8654,
    flags: [],
    estimate: {
      overallConfidence: 87,
      summary:
        "Severe front-end damage with high confidence. Radiator inspection recommended before final approval.",
      lines: [
        {
          id: "l1",
          action: "Hood Assembly (Ford OEM)",
          type: "Replacement",
          laborHours: 3.0,
          cost: 1450,
          confidence: 95,
        },
        {
          id: "l2",
          action: "Front Grille & Chrome Trim",
          type: "Replacement",
          laborHours: 1.5,
          cost: 680,
          confidence: 93,
        },
        {
          id: "l3",
          action: "Radiator Inspection + Replace (likely)",
          type: "Replacement",
          laborHours: 4.0,
          cost: 1280,
          confidence: 68,
        },
        {
          id: "l4",
          action: "Hood Paint & Refinish",
          type: "Refinish",
          laborHours: 5.0,
          cost: 720,
          confidence: 89,
        },
      ],
    },
    similar: [
      {
        id: "CLM-0712",
        vehicle: "2020 Ford F-150",
        finalCost: 4980,
        matchPct: 91,
        matchedOn: "Front-end crumple severity",
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
      type: "Rear-end collision",
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
          "Claim filed for 2019 Toyota Camry, but photo shows a Hyundai Elantra (visible Hyundai badge). Verify VIN before proceeding.",
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