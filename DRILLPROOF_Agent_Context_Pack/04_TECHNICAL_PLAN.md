# 04 — Technical Plan and Build Boundaries

## Goal
Build the smallest coherent application that demonstrates the product's core value. A convincing, functional prototype is more important than a broad but broken feature set.

## Suggested stack
Follow the repository's existing stack first. Do not replace frameworks or restructure the app unnecessarily.

If starting from scratch:
- React + Vite
- TypeScript if the team is comfortable with it
- Tailwind CSS or the styling system already present
- React Router for page routes
- Local mock data / local storage for a fast prototype
- QR code library for building QR destinations
- Recharts or Chart.js only where a chart genuinely helps

Firebase can be added if authentication and persistence are already configured or there is enough time. Do not let backend setup consume the demo window. A local, seeded prototype is acceptable if it is clearly presented as a prototype.

## Architecture
Keep the architecture simple and modular:
- `pages/` — route-level screens
- `components/` — reusable UI elements
- `data/` — seeded demo institution, building, inspection, drill, and action data
- `types/` — shared data types
- `utils/` — readiness calculations, QR helpers, formatting
- `services/` — persistence abstraction (local first; backend later)

Use a small service/data layer so local mock data can later be replaced by Firebase or an API without rewriting every screen.

## Suggested core data entities

### Institution
- id
- name
- type
- address
- subscriptionTier (demo field only)

### Building
- id
- institutionId
- name
- address/site label
- floors
- assemblyPoint
- emergencyContacts
- emergencyInstructions by hazard
- QR destination

### Floor
- id
- buildingId
- name/number
- exits
- wardens / assigned roles

### Inspection
- id
- buildingId
- date
- inspector
- checklistItems
- overallStatus
- notes

### ChecklistItem
- id
- label
- category
- status: `pass | needs_attention | not_checked`
- note
- checkedAt

### Drill
- id
- buildingId
- hazardType
- scheduledAt
- startedAt
- completedAt
- status: `planned | in_progress | completed`
- participantsExpected
- participantsAccountedFor
- observations
- durationSeconds
- isDemo

### CorrectiveAction
- id
- buildingId
- sourceType: `inspection | drill | manual`
- sourceId
- title
- description
- priority: `low | medium | high | critical`
- assignedTo
- dueDate
- status: `open | in_progress | resolved`
- resolutionNote

### User
- id
- name
- email
- role
- institutionId

## Readiness score
If displaying a single score, keep its formula transparent and simple. For example, a prototype score can be derived from:
- inspection completion
- overdue inspections
- open high-priority corrective actions
- latest drill completion / outcome

Label it **Illustrative readiness score** in the prototype. Do not imply it is a certified or industry-standard score.

## Functional requirements
- Navigation routes should work; no dead buttons.
- Forms should validate required fields.
- Create/update actions should visibly update the UI.
- QR destination should resolve to the correct building page.
- Public emergency pages must not require admin login.
- Admin routes should be separated from public routes.
- Use seeded demo data that tells one coherent story.
- Refresh behavior should be predictable. If local storage is used, initialize it safely and provide a reset-demo-data option if practical.

## Security and safety boundaries
- Do not put private personal data on public QR pages.
- Do not expose admin-only notes, inspection history, or occupant lists publicly.
- Do not present emergency instructions as a replacement for local authority guidance or a building's approved plan.
- Do not claim automatic tracking, sensing, or dispatch.
- Avoid collecting real personal data for the demo. Use fictional sample names and details.
- For real deployment, authentication, access control, backups, audit logs, secure hosting, privacy review, and expert validation would be required.

## Implementation sequence
1. Inspect existing repository and identify framework, routes, and current working features.
2. Establish global design tokens and reusable layout.
3. Build route skeleton and navigation.
4. Add seeded institution/building data.
5. Build dashboard.
6. Build building detail and public emergency page.
7. Build QR link.
8. Build inspection flow.
9. Build drill flow.
10. Build corrective action workflow.
11. Connect dashboard metrics and report summaries to the same data.
12. Test every demo path and polish responsive layouts.

## Agent working rules
- Before editing, inspect the current codebase.
- Do not delete or rewrite working code without a clear reason.
- Make changes in small, testable steps.
- After each major feature, run the app and check the relevant route.
- Keep dependencies minimal.
- If a feature cannot be completed, leave a clear honest placeholder rather than a fake working control.
- Do not add features outside this brief just because they seem impressive.
