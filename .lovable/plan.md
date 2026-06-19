## Plan: Revert to earlier Damage Assessment Summary with damage-focused labels

### What we'll change
1. **Revert the damage-assessment UI in `src/components/ClaimDetail.tsx`**
   - Replace the current "Damage findings — from photo evidence" findings list with the earlier **Damage Assessment Summary** card.
   - The card will sit between the Policyholder & Claim Information box and the AI estimate table, as before.

2. **Restyle the `Detected:` row and emphasize the damage term**
   - Keep the chip format you picked: **"Rear quarter panel — dent"**.
   - Render the `damage` value as the more prominent part (e.g., slightly heavier weight) and the `action`/`location` as secondary/muted text so the eye is drawn to the damage, not the repair action.
   - Manually added items still show the "Added" warning styling.

3. **Keep the add/flag controls in the summary box**
   - The **Add damage + repair action** button stays inside the summary section.
   - Mismatch flags and the "mark as reviewed" control remain in this section, as in the earlier UI.

4. **No data-model changes**
   - The existing `EstimateLine.action` and `EstimateLine.damage` fields already support this format, so only the presentation layer needs to change.

### Outcome
The claim detail page returns to the compact summary-card layout, with the `Detected:` chips reading like **"Rear quarter panel — dent"** while visually highlighting the damage portion.