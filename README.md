## Problem

Claims agents spend significant time manually reviewing claim details, assessing vehicle damage, researching repair costs, and validating estimates. This creates operational bottlenecks and variability in initial repair estimates. Claims Buddy helps claims agents move from manual estimation workflows to AI-assisted review, enabling faster and more consistent repair estimates.

## Claims Agent Inbox

An AI-assisted car insurance claims review console. Policyholders submit accident details and upload damage photos; claims agents review AI-generated repair estimates, compare them against historical claims, and approve or override line items with a full audit trail.

## What it does

- **Claim Intake Simulation** — A policyholder-facing form to report an accident, describe damage, and upload a photo.
- **Agent Inbox** — A triage view where claims agents see incoming submissions, confidence scores, and AI-generated repair estimates.
- **AI Repair Estimate** — Each claim shows estimated repair costs broken down by line item (labor, parts, paint, etc.) with per-item confidence scores.
- **Similar Claims Rail** — Side panel that surfaces historical claims with comparable damage to help the agent calibrate the estimate.
- **Overrides & Audit Trail** — Agents can override any line-item cost. Every override is stamped with the agent’s name, rationale, timestamp, and previous value.
- **Flags & Review** — Claims may raise automatic flags (e.g., photo/description mismatch). Agents can review and dismiss them.

## AI Approach

This prototype simulates an AI-assisted claims workflow:

1. Damage Assessment
   - Analyze submitted vehicle images and claim metadata
   - Identify visible damage type, location, and severity indicators

2. Historical Claim Retrieval
   - Retrieve comparable claims based on vehicle attributes and damage characteristics

3. Cost Recommendation
   - Generate estimated repair actions, labor, parts, and total cost using historical repair outcomes, with confidence scores indicating where additional agent review may be needed.

4. Human Review
   - Claims agents validate, adjust, or override recommendations
  
## Prototype Notes

This MVP demonstrates the end-to-end claims workflow. AI outputs are simulated using notional historical claim examples and simulated AI outputs to demonstrate the intended human-AI interaction pattern. The MVP was created with Lovable.

## How to access the app

Navigate to this link: https://car-insurance-claim-buddy.lovable.app/
