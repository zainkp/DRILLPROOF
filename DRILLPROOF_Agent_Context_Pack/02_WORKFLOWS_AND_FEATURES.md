# 02 — Workflows, Roles, and Screens

## Roles and permissions

### Public visitor / occupant
- Can open a building's public emergency information page from a QR code or direct link.
- Can view approved emergency instructions, assembly point, emergency contacts, and relevant building/floor information.
- Cannot access administrative records or private occupant information.

### Institution administrator
- Can manage institution profile, buildings, floors, emergency information, staff roles, inspections, drills, and reports.
- Can create and assign corrective actions.
- Can invite or manage staff accounts in a future/full implementation.

### Safety officer / facility manager
- Can record inspections, report hazards, update equipment status, and manage assigned corrective actions.
- Can organize drills and review outcomes, depending on permissions.

### Floor warden / staff member
- Can view assigned responsibilities and drill instructions.
- Can submit drill check-ins or observations in the prototype.

For a short hackathon prototype, roles can be represented with a simple demo role switch or seeded accounts. Do not spend time building a complex permissions engine unless the rest is already working.

## Recommended page map

### 1. Public landing page (`/`)
Purpose: explain DRILLPROOF and direct users to the right action.

Suggested sections:
- Brand header and clear one-line value proposition.
- Primary CTA: `Institution Login`.
- Secondary CTA: `View Demo Building` or `Open Emergency Plan`.
- Short visual explanation: Prepare → Practice → Improve.
- Feature highlights: Building QR plans, inspections, drills, corrective actions.
- Target sectors: education, workplaces, healthcare, industry.

Avoid a generic SaaS template look. Keep the page focused and credible.

### 2. Authentication (`/login`)
- Admin/staff sign-in interface.
- For the demo, a clearly labelled demo access option is acceptable.
- After sign-in, route to the dashboard.
- Do not expose admin controls on the public emergency page.

### 3. Admin dashboard (`/dashboard`)
Show a small set of useful readiness indicators:
- Buildings / floors registered
- Inspections due or overdue
- Drills completed
- Open corrective actions
- Overall readiness status (explain how it is calculated; for demo it may be a simple illustrative score)

Include:
- Recent activity
- Upcoming inspections/drills
- Open high-priority issues
- Quick actions: `Start a Drill`, `Record Inspection`, `Add Issue`, `Manage Building`

Avoid meaningless vanity metrics. Every metric should link to a relevant workflow.

### 4. Buildings (`/buildings`)
- List buildings and their readiness status.
- Building detail page with floors, assembly points, exits, emergency contacts, wardens, and hazard-specific instructions.
- Admin can edit the sample building profile.
- Generate a QR code that opens the public page for that building.

### 5. Public emergency page (`/emergency/:buildingId`)
This is the key QR destination.
- Mobile-first and extremely clear.
- Building name and address/site label.
- Select/view floor if relevant.
- Emergency contacts.
- Assembly point.
- Approved evacuation / shelter instructions for the selected hazard.
- Exit and safety information.
- Clear note: in an actual emergency, follow local authorities and call the appropriate emergency number.
- Do not show private contact details or personal occupant data.

For the prototype, a generated QR code can point to a local route or deployed URL. If QR scanning is not practical in the room, demonstrate the page through a button/link and explain the QR flow honestly.

### 6. Inspections (`/inspections`)
- Checklist by equipment / safety area.
- Example items: fire extinguisher inspection date, first-aid kit stock, exit obstruction, emergency lighting, alarm status, signage, spill kit (where relevant).
- Status: Pass / Needs Attention / Not Checked.
- Record inspection date, notes, and responsible person.
- A failed check should be able to create a corrective action.

### 7. Drills (`/drills`)
- Create/select a drill scenario: fire, earthquake, flood, medical emergency, etc.
- Select building/floors and assign wardens or responsibilities.
- Start a timed drill session.
- Record floor/team progress and manual check-ins.
- Record total time and observations.
- Mark the session as a simulation when using seeded/demo activity.
- No GPS tracking, automatic crowd detection, or claims of real evacuation monitoring.

### 8. Corrective actions (`/actions`)
- Issue title and description.
- Linked building/floor and source (inspection or drill).
- Priority and status.
- Assigned person/team.
- Due date.
- Resolution note and closure status.
- Example: “West stairwell exit obstructed during drill” → assign Facilities → mark resolved after clearance and verification.

### 9. Reports (`/reports`)
- Drill performance summary.
- Inspection completion and overdue items.
- Open vs closed corrective actions.
- Readiness trend (only if enough sample data exists; otherwise label as demo data).
- Export/print-friendly report if time permits.

## Core end-to-end workflows

### Workflow A — QR emergency information
1. Administrator creates or edits a building profile.
2. Administrator adds floors, assembly point, contacts, and approved instructions.
3. System generates a QR code linked to `/emergency/:buildingId`.
4. Occupant scans QR code.
5. Public page displays relevant emergency information without login.

### Workflow B — Inspection to corrective action
1. Safety officer opens an inspection checklist.
2. Marks an item as `Needs Attention`.
3. Adds a note and submits the inspection.
4. System creates a corrective action or offers a one-click `Create Action`.
5. Admin assigns an owner and due date.
6. Owner marks the issue resolved with a note.
7. Dashboard updates the outstanding issue count.

### Workflow C — Mock drill to improvement
1. Admin selects a hazard-specific drill template.
2. Selects building/floors and assigns roles.
3. Starts the drill timer.
4. Warden/staff check-ins are recorded manually or with demo controls.
5. Admin records observations and completes the drill.
6. System produces a summary.
7. A drill observation becomes a corrective action.
8. Dashboard/report reflects the result.

## Feature priority

### Must work in the prototype
- Landing page navigation.
- Demo login / admin entry.
- Dashboard with coherent sample data.
- Building detail and public emergency page.
- QR generation or a clearly demonstrable QR destination.
- One inspection flow.
- One drill flow with timer / manual progress.
- Corrective action creation and status update.
- Visible dashboard/report updates after actions.

### Nice to have
- Multiple user accounts and fine-grained permissions.
- Multi-site administration.
- PDF export.
- Email notifications.
- Historical trend charts.
- Real-time multi-user updates.

### Explicitly out of scope for the prototype
- Automatic fire or hazard detection.
- Automatic location tracking of occupants.
- Automatic emergency-service dispatch.
- Hardware / sensor integrations.
- Legal compliance certification.
- Real-time building evacuation verification.
- Payment gateway / live subscription billing.
- AI-generated safety instructions presented as authoritative.
