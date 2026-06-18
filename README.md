# Claims Agent Inbox

An AI-assisted car insurance claims review console. Policyholders submit accident details and upload damage photos; claims agents review AI-generated repair estimates, compare them against historical claims, and approve or override line items with a full audit trail.

## What it does

- **Submit a Claim** — A policyholder-facing form to report an accident, describe damage, and upload a photo.
- **Agent Inbox** — A triage view where claims agents see incoming submissions, confidence scores, and AI-generated repair estimates.
- **AI Repair Estimate** — Each claim shows estimated repair costs broken down by line item (labor, parts, paint, etc.) with per-item confidence scores.
- **Similar Claims Rail** — Side panel that surfaces historical claims with comparable damage to help the agent calibrate the estimate.
- **Overrides & Audit Trail** — Agents can override any line-item cost. Every override is stamped with the agent’s name, rationale, timestamp, and previous value.
- **Flags & Review** — Claims may raise automatic flags (e.g., photo/description mismatch). Agents can review and dismiss them.

## How to run / access the app

### Local development

```bash
# Install dependencies
bun install

# Start the dev server
bun run dev
```

The app will open at the local URL printed in your terminal (usually `http://localhost:3000`).

### Preview & publish

This project is managed in **Lovable**. The live preview updates automatically as you edit code.

- **Preview URL** — Visit the project preview link in Lovable to see the latest build.
- **Publish** — Use the Publish button in Lovable to deploy the app to a permanent public URL.

No manual build or hosting setup is required; Lovable handles deployment.
