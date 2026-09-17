# NairaVolt manual energy audit suite

## Goal
Replace the simulator-led monitoring workspace with a manual, local-first audit workspace. Keep useful manual alerts and reporting, while removing all IoT, sensor, occupancy, environmental-feed, AI-prediction, and smart-classroom-control language and behavior.

## User-visible changes
1. **Location navigation**
   - Add a location selector to the main header with create, switch, rename, and delete actions.
   - Seed realistic `Home` and `Office` locations on first load so the dashboard is useful immediately.
   - Keep each location independent, with its own buildings, rooms, appliances, tariff, alerts, notes, limits, and audit history.
   - Add an `All locations` overview showing combined kWh and monthly cost, with a clear active-location state.

2. **Manual audit workspace**
   - Replace the current Monitor tab and simulator cards with a location dashboard for manual energy audits.
   - Add editable buildings and rooms/spaces, then assign appliances to each space.
   - Support appliance name, quantity, watts/kW, estimated daily hours, and the existing NERC Band/custom ₦/kWh rate.
   - Keep quantity-aware VAT-inclusive daily, monthly, annual kWh, and cost calculations.
   - Add summary cards for monthly kWh, monthly cost, top space, and top appliance.
   - Add thin-line charts for usage by room/building and cost by appliance category.
   - Add a detailed table with inline edit/delete actions.

3. **Alerts and settings**
   - Retain an Alert Centre, but generate alerts only from manually entered thresholds and audit flags, such as a space exceeding its daily kWh baseline or an appliance exceeding its configured watt/hour limit.
   - Retain delivery preferences for in-app, browser/mobile, and email summaries as saved settings; do not simulate sensors or automatic control.
   - Add per-location wattage and maximum-hours limits.
   - Add a prominent Data Memory toggle: ON persists local data; OFF uses guest mode and clears custom audit data when the session ends.
   - Add Clear Saved Data with confirmation and restore the fallback Home/Office examples.

4. **Guidance, savings, maintenance, and export**
   - Replace the current simulator-oriented onboarding copy with a modal walkthrough covering locations, spaces/appliances, thresholds, and report export.
   - Add a permanent Replay Tutorial action in the header/settings.
   - Add a manual scenario planner for reducing hours or replacing wattage, showing monthly/annual naira savings and kWh reduction without changing saved audit data.
   - Add a manual audit log for notes, faulty equipment flags, and scheduled physical checks.
   - Expand report export to active location or all locations, supporting the existing printable PDF and CSV/Excel-style raw audit export, with logo, location breakdowns, tariffs, VAT, notes, and totals.

## Technical approach
- Introduce a typed local audit model for locations, buildings, spaces, appliance rows, thresholds, delivery preferences, logs, and memory settings.
- Persist the model through one versioned localStorage key, with safe parsing, migration/default fallback, and session-only guest behavior when memory is OFF.
- Keep existing authenticated profile/appliance data compatible where practical, but make the new manual location workspace the source of truth for this experience; avoid new backend tables unless a later requirement explicitly asks for cross-device sync.
- Replace `MonitoringDashboard` with focused manual-audit components and hooks, then update `Index` navigation and onboarding targets.
- Reuse existing tariff, appliance catalog, logo, PDF styling, shadcn controls, Recharts, and semantic design tokens. Remove unused simulator imports and state.
- Keep the existing auth flow and owner-only backend rules unchanged.

## Removal checklist
- Remove live simulator intervals, random readings, reset/pause feed controls, simulated sensor labels, occupancy counts, temperatures, daylight percentages, sensor health, automation decisions, AI prediction copy, smart classroom actions, and simulator-specific ROI/safety claims.
- Do not add browser notifications that pretend to receive live hardware events. Browser/email preferences remain configuration controls for manually generated audit alerts.

## Validation
- Verify first load shows Home and Office fallback audits.
- Verify creating, switching, renaming, deleting, and viewing all locations preserves independent data.
- Verify a room/appliance edit immediately updates kWh, VAT-inclusive daily/monthly/annual costs, charts, alerts, scenario estimates, and exports.
- Verify memory ON survives refresh and memory OFF does not retain custom entries after session end.
- Verify tutorial replay, clear-data confirmation, inline edits, report exports, mobile layout, and dark mode.
- Run the project’s build/tests and browser-check the dashboard for simulator terms, console errors, and key workflows.
