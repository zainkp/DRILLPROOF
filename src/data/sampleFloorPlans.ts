/**
 * Sample Architectural Floor Plans for DRILLPROOF Demo Facilities.
 * Generates standards-compliant SVG floor plans as encoded Data URLs.
 * Mandatory Safety Disclaimer included on all generated plans:
 * "Illustrative Demo Plan — Not an Approved Evacuation Plan"
 */

export const DISCLAIMER_TEXT = 'Illustrative Demo Plan — Not an Approved Evacuation Plan';

function createSvgDataUrl(svgContent: string): string {
  const utf8 = encodeURIComponent(svgContent)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');
  return `data:image/svg+xml;charset=utf-8,${utf8}`;
}

export function generateAcademicGroundFloorSvg(): string {
  return createSvgDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="100%" height="100%">
  <defs>
    <pattern id="grid-acad-0" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" stroke-width="0.8"/>
    </pattern>
    <marker id="arrow-green" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 9 5 L 0 9 z" fill="#059669" />
    </marker>
    <marker id="arrow-red" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 9 5 L 0 9 z" fill="#E51C23" />
    </marker>
  </defs>

  <!-- Background Blueprint Canvas -->
  <rect width="900" height="600" fill="#F8FAFC"/>
  <rect width="900" height="600" fill="url(#grid-acad-0)"/>

  <!-- Outer Walls (Structural Concrete) -->
  <rect x="70" y="80" width="760" height="440" fill="#FFFFFF" stroke="#1E293B" stroke-width="4"/>

  <!-- Mandatory Safety Disclaimer Header -->
  <rect x="70" y="30" width="760" height="34" fill="#FEF2F2" stroke="#DC2626" stroke-width="1.5" rx="3"/>
  <text x="450" y="52" fill="#991B1B" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="700" text-anchor="middle" letter-spacing="0.5">
    &#9888; ${DISCLAIMER_TEXT} &bull; DRILLPROOF VERIFIED FACILITY
  </text>

  <!-- Plan Metadata Header inside Blueprint -->
  <rect x="85" y="95" width="320" height="48" fill="#F1F5F9" stroke="#94A3B8" stroke-width="1" rx="2"/>
  <text x="98" y="115" fill="#0F172A" font-family="sans-serif" font-size="13" font-weight="bold">ACADEMIC BLOCK &mdash; GROUND FLOOR</text>
  <text x="98" y="132" fill="#475569" font-family="monospace" font-size="10">LEVEL 0 &bull; MAX OCCUPANCY: 450 &bull; ZONE A</text>

  <!-- Compass Rose -->
  <g transform="translate(800, 120)">
    <circle cx="0" cy="0" r="18" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.5"/>
    <path d="M 0 -15 L 4 -2 L -4 -2 Z" fill="#DC2626"/>
    <path d="M 0 15 L 4 2 L -4 2 Z" fill="#64748B"/>
    <text x="0" y="-18" fill="#DC2626" font-family="sans-serif" font-size="9" font-weight="bold" text-anchor="middle">N</text>
  </g>

  <!-- Central Corridor & Atrium -->
  <rect x="250" y="170" width="400" height="260" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5" stroke-dasharray="4 4"/>
  <text x="450" y="295" fill="#334155" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle" letter-spacing="1">CENTRAL ATRIUM &amp; VESTIBULE</text>
  <text x="450" y="315" fill="#64748B" font-family="monospace" font-size="10" text-anchor="middle">PRIMARY EGRESS CONCOURSE</text>

  <!-- Lecture Hall 1 (North-West) -->
  <rect x="85" y="160" width="150" height="150" fill="#F1F5F9" stroke="#334155" stroke-width="2"/>
  <text x="160" y="230" fill="#0F172A" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">LECTURE HALL 1</text>
  <text x="160" y="248" fill="#64748B" font-family="monospace" font-size="9" text-anchor="middle">Cap: 110</text>

  <!-- Lecture Hall 2 (South-West) -->
  <rect x="85" y="330" width="150" height="175" fill="#F1F5F9" stroke="#334155" stroke-width="2"/>
  <text x="160" y="410" fill="#0F172A" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">LECTURE HALL 2</text>
  <text x="160" y="428" fill="#64748B" font-family="monospace" font-size="9" text-anchor="middle">Cap: 110</text>

  <!-- Lecture Hall 3 (North-East) -->
  <rect x="665" y="160" width="150" height="150" fill="#F1F5F9" stroke="#334155" stroke-width="2"/>
  <text x="740" y="230" fill="#0F172A" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">LECTURE HALL 3</text>
  <text x="740" y="248" fill="#64748B" font-family="monospace" font-size="9" text-anchor="middle">Cap: 110</text>

  <!-- Lecture Hall 4 (South-East) -->
  <rect x="665" y="330" width="150" height="175" fill="#F1F5F9" stroke="#334155" stroke-width="2"/>
  <text x="740" y="410" fill="#0F172A" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">LECTURE HALL 4</text>
  <text x="740" y="428" fill="#64748B" font-family="monospace" font-size="9" text-anchor="middle">Cap: 110</text>

  <!-- Reception & Security Desk -->
  <rect x="370" y="435" width="160" height="35" fill="#E2E8F0" stroke="#475569" stroke-width="1.5"/>
  <text x="450" y="457" fill="#0F172A" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">SECURITY &amp; RECEPTION</text>

  <!-- Evacuation Flow Arrows (Egress Path) -->
  <line x1="235" y1="235" x2="350" y2="280" stroke="#059669" stroke-width="3" stroke-dasharray="6 3" marker-end="url(#arrow-green)"/>
  <line x1="235" y1="410" x2="350" y2="350" stroke="#059669" stroke-width="3" stroke-dasharray="6 3" marker-end="url(#arrow-green)"/>
  <line x1="665" y1="235" x2="550" y2="280" stroke="#059669" stroke-width="3" stroke-dasharray="6 3" marker-end="url(#arrow-green)"/>
  <line x1="665" y1="410" x2="550" y2="350" stroke="#059669" stroke-width="3" stroke-dasharray="6 3" marker-end="url(#arrow-green)"/>
  <line x1="450" y1="360" x2="450" y2="510" stroke="#059669" stroke-width="4" marker-end="url(#arrow-green)"/>

  <!-- Emergency Exits -->
  <!-- Exit 1: Main Atrium Double Doors (South) -->
  <rect x="380" y="515" width="140" height="24" fill="#059669" stroke="#047857" stroke-width="2" rx="2"/>
  <text x="450" y="531" fill="#FFFFFF" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">MAIN ATRIUM EXIT (CLEAR)</text>

  <!-- Exit 2: East Courtyard Egress Door (East) -->
  <rect x="820" y="270" width="22" height="90" fill="#059669" stroke="#047857" stroke-width="2" rx="2"/>
  <text x="827" y="320" fill="#FFFFFF" font-family="sans-serif" font-size="8" font-weight="bold" transform="rotate(90 827 320)" text-anchor="middle">EAST EXIT</text>

  <!-- Exit 3: West Service Ramp (West) -->
  <rect x="58" y="270" width="22" height="90" fill="#059669" stroke="#047857" stroke-width="2" rx="2"/>
  <text x="65" y="320" fill="#FFFFFF" font-family="sans-serif" font-size="8" font-weight="bold" transform="rotate(-90 65 320)" text-anchor="middle">WEST RAMP (ADA)</text>

  <!-- Safety Assets (Extinguishers, AED, First Aid) -->
  <!-- Fire Extinguisher at Atrium Pillar -->
  <g transform="translate(365, 410)">
    <rect x="-12" y="-12" width="24" height="24" fill="#DC2626" rx="3"/>
    <text x="0" y="4" fill="#FFFFFF" font-family="sans-serif" font-size="8" font-weight="bold" text-anchor="middle">EXT</text>
  </g>
  <text x="365" y="432" fill="#DC2626" font-family="sans-serif" font-size="7" font-weight="bold" text-anchor="middle">EXT-G-01</text>

  <!-- Fire Extinguisher at Lecture Hall 2 -->
  <g transform="translate(250, 470)">
    <rect x="-12" y="-12" width="24" height="24" fill="#DC2626" rx="3"/>
    <text x="0" y="4" fill="#FFFFFF" font-family="sans-serif" font-size="8" font-weight="bold" text-anchor="middle">EXT</text>
  </g>
  <text x="250" y="492" fill="#DC2626" font-family="sans-serif" font-size="7" font-weight="bold" text-anchor="middle">EXT-G-02</text>

  <!-- AED Defibrillator at Main Lobby -->
  <g transform="translate(545, 410)">
    <rect x="-12" y="-12" width="24" height="24" fill="#0284C7" rx="3"/>
    <text x="0" y="4" fill="#FFFFFF" font-family="sans-serif" font-size="8" font-weight="bold" text-anchor="middle">AED</text>
  </g>
  <text x="545" y="432" fill="#0284C7" font-family="sans-serif" font-size="7" font-weight="bold" text-anchor="middle">AED-G-01</text>

  <!-- Legend at Bottom Left -->
  <g transform="translate(85, 532)">
    <rect x="0" y="0" width="250" height="48" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1" rx="2"/>
    <rect x="10" y="10" width="10" height="10" fill="#059669"/>
    <text x="26" y="18" fill="#334155" font-family="sans-serif" font-size="9">Emergency Exit / Route</text>
    <rect x="10" y="26" width="10" height="10" fill="#DC2626"/>
    <text x="26" y="34" fill="#334155" font-family="sans-serif" font-size="9">Fire Extinguisher (CO2/Dry)</text>
    <rect x="130" y="10" width="10" height="10" fill="#0284C7"/>
    <text x="146" y="18" fill="#334155" font-family="sans-serif" font-size="9">AED Defibrillator</text>
  </g>

  <!-- Muster Zone Callout at Bottom -->
  <g transform="translate(560, 532)">
    <rect x="0" y="0" width="255" height="48" fill="#ECFDF5" stroke="#10B981" stroke-width="1" rx="2"/>
    <text x="12" y="20" fill="#065F46" font-family="sans-serif" font-size="10" font-weight="bold">&#10140; TO ASSEMBLY POINT A</text>
    <text x="12" y="36" fill="#047857" font-family="monospace" font-size="8">East Athletic Field (60m straight egress)</text>
  </g>
</svg>`);
}

export function generateAcademicLevel1Svg(): string {
  return createSvgDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="100%" height="100%">
  <defs>
    <pattern id="grid-acad-1" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" stroke-width="0.8"/>
    </pattern>
    <marker id="arrow-green-1" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 9 5 L 0 9 z" fill="#059669" />
    </marker>
  </defs>

  <rect width="900" height="600" fill="#F8FAFC"/>
  <rect width="900" height="600" fill="url(#grid-acad-1)"/>
  <rect x="70" y="80" width="760" height="440" fill="#FFFFFF" stroke="#1E293B" stroke-width="4"/>

  <!-- Mandatory Safety Disclaimer Header -->
  <rect x="70" y="30" width="760" height="34" fill="#FEF2F2" stroke="#DC2626" stroke-width="1.5" rx="3"/>
  <text x="450" y="52" fill="#991B1B" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="700" text-anchor="middle" letter-spacing="0.5">
    &#9888; ${DISCLAIMER_TEXT} &bull; DRILLPROOF VERIFIED FACILITY
  </text>

  <!-- Plan Metadata Header -->
  <rect x="85" y="95" width="340" height="48" fill="#F1F5F9" stroke="#94A3B8" stroke-width="1" rx="2"/>
  <text x="98" y="115" fill="#0F172A" font-family="sans-serif" font-size="13" font-weight="bold">ACADEMIC BLOCK &mdash; LEVEL 1</text>
  <text x="98" y="132" fill="#475569" font-family="monospace" font-size="10">COMPUTER LABS &bull; MAX OCCUPANCY: 320 &bull; ZONE B</text>

  <!-- Compass Rose -->
  <g transform="translate(800, 120)">
    <circle cx="0" cy="0" r="18" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.5"/>
    <path d="M 0 -15 L 4 -2 L -4 -2 Z" fill="#DC2626"/>
    <path d="M 0 15 L 4 2 L -4 2 Z" fill="#64748B"/>
    <text x="0" y="-18" fill="#DC2626" font-family="sans-serif" font-size="9" font-weight="bold" text-anchor="middle">N</text>
  </g>

  <!-- North Stairwell Exit (Top Center) -->
  <rect x="380" y="68" width="140" height="24" fill="#059669" stroke="#047857" stroke-width="2" rx="2"/>
  <text x="450" y="84" fill="#FFFFFF" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">NORTH STAIRWELL (CLEAR)</text>

  <!-- East Stairwell Exit (Right Center) -->
  <rect x="820" y="270" width="22" height="90" fill="#059669" stroke="#047857" stroke-width="2" rx="2"/>
  <text x="827" y="320" fill="#FFFFFF" font-family="sans-serif" font-size="8" font-weight="bold" transform="rotate(90 827 320)" text-anchor="middle">EAST STAIR (CLEAR)</text>

  <!-- West Stairwell (Left Center) - PARTIALLY OBSTRUCTED -->
  <rect x="58" y="270" width="22" height="90" fill="#D97706" stroke="#B45309" stroke-width="2" rx="2"/>
  <text x="65" y="320" fill="#FFFFFF" font-family="sans-serif" font-size="8" font-weight="bold" transform="rotate(-90 65 320)" text-anchor="middle">WEST (OBSTRUCTED)</text>

  <!-- Central Egress Corridor -->
  <rect x="180" y="250" width="540" height="90" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
  <text x="450" y="295" fill="#475569" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">CENTRAL DISTRIBUTION CORRIDOR</text>

  <!-- Computer Lab 101 -->
  <rect x="85" y="160" width="170" height="80" fill="#F1F5F9" stroke="#334155" stroke-width="2"/>
  <text x="170" y="205" fill="#0F172A" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">COMPUTER LAB 101</text>

  <!-- Server Room 102 -->
  <rect x="265" y="160" width="130" height="80" fill="#FEF3C7" stroke="#D97706" stroke-width="2"/>
  <text x="330" y="200" fill="#92400E" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">SERVER ROOM 102</text>
  <text x="330" y="215" fill="#B45309" font-family="monospace" font-size="8" text-anchor="middle">CLEAN AGENT SUPPR.</text>

  <!-- Faculty Offices -->
  <rect x="515" y="160" width="300" height="80" fill="#F1F5F9" stroke="#334155" stroke-width="2"/>
  <text x="665" y="205" fill="#0F172A" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">FACULTY WORKSTATIONS &amp; SUITES</text>

  <!-- Computer Lab 103 -->
  <rect x="85" y="350" width="220" height="155" fill="#F1F5F9" stroke="#334155" stroke-width="2"/>
  <text x="195" y="430" fill="#0F172A" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">COMPUTER LAB 103</text>

  <!-- Computer Lab 104 -->
  <rect x="320" y="350" width="240" height="155" fill="#F1F5F9" stroke="#334155" stroke-width="2"/>
  <text x="440" y="430" fill="#0F172A" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">NETWORKING LAB 104</text>

  <!-- Staff Pantry / First Aid -->
  <rect x="575" y="350" width="240" height="155" fill="#F1F5F9" stroke="#334155" stroke-width="2"/>
  <text x="695" y="420" fill="#0F172A" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">STAFF COMMONS &amp; PANTRY</text>

  <!-- Egress Direction Arrows -->
  <line x1="300" y1="295" x2="430" y2="105" stroke="#059669" stroke-width="3" stroke-dasharray="6 3" marker-end="url(#arrow-green-1)"/>
  <line x1="600" y1="295" x2="800" y2="305" stroke="#059669" stroke-width="3" stroke-dasharray="6 3" marker-end="url(#arrow-green-1)"/>

  <!-- Equipment Markers -->
  <!-- Server Extinguisher -->
  <g transform="translate(275, 230)">
    <rect x="-10" y="-10" width="20" height="20" fill="#DC2626" rx="2"/>
    <text x="0" y="4" fill="#FFFFFF" font-family="sans-serif" font-size="7" font-weight="bold" text-anchor="middle">EXT</text>
  </g>
  <text x="275" y="248" fill="#DC2626" font-family="sans-serif" font-size="7" font-weight="bold" text-anchor="middle">Clean Agent</text>

  <!-- First Aid Kit in Pantry -->
  <g transform="translate(590, 370)">
    <rect x="-10" y="-10" width="20" height="20" fill="#16A34A" rx="2"/>
    <text x="0" y="4" fill="#FFFFFF" font-family="sans-serif" font-size="8" font-weight="bold" text-anchor="middle">+</text>
  </g>
  <text x="590" y="388" fill="#16A34A" font-family="sans-serif" font-size="7" font-weight="bold" text-anchor="middle">FAK-1-01</text>
</svg>`);
}

export function generateAcademicLevel2Svg(): string {
  return createSvgDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="100%" height="100%">
  <defs>
    <pattern id="grid-acad-2" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" stroke-width="0.8"/>
    </pattern>
    <marker id="arrow-green-2" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 9 5 L 0 9 z" fill="#059669" />
    </marker>
  </defs>

  <rect width="900" height="600" fill="#F8FAFC"/>
  <rect width="900" height="600" fill="url(#grid-acad-2)"/>
  <rect x="70" y="80" width="760" height="440" fill="#FFFFFF" stroke="#1E293B" stroke-width="4"/>

  <!-- Mandatory Safety Disclaimer Header -->
  <rect x="70" y="30" width="760" height="34" fill="#FEF2F2" stroke="#DC2626" stroke-width="1.5" rx="3"/>
  <text x="450" y="52" fill="#991B1B" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="700" text-anchor="middle" letter-spacing="0.5">
    &#9888; ${DISCLAIMER_TEXT} &bull; DRILLPROOF VERIFIED FACILITY
  </text>

  <!-- Plan Metadata Header -->
  <rect x="85" y="95" width="370" height="48" fill="#F1F5F9" stroke="#94A3B8" stroke-width="1" rx="2"/>
  <text x="98" y="115" fill="#0F172A" font-family="sans-serif" font-size="13" font-weight="bold">ACADEMIC BLOCK &mdash; LEVEL 2</text>
  <text x="98" y="132" fill="#475569" font-family="monospace" font-size="10">CHEMISTRY &amp; MATERIAL SCIENCE &bull; CAP: 260</text>

  <!-- North Stairwell Exit -->
  <rect x="380" y="68" width="140" height="24" fill="#059669" stroke="#047857" stroke-width="2" rx="2"/>
  <text x="450" y="84" fill="#FFFFFF" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">NORTH STAIRWELL (CLEAR)</text>

  <!-- East Stairwell Exit -->
  <rect x="820" y="270" width="22" height="90" fill="#059669" stroke="#047857" stroke-width="2" rx="2"/>
  <text x="827" y="320" fill="#FFFFFF" font-family="sans-serif" font-size="8" font-weight="bold" transform="rotate(90 827 320)" text-anchor="middle">EAST STAIR (CLEAR)</text>

  <!-- Laboratories -->
  <rect x="85" y="160" width="320" height="150" fill="#EFF6FF" stroke="#2563EB" stroke-width="2"/>
  <text x="245" y="230" fill="#1E3A8A" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">INORGANIC CHEMISTRY LAB 201</text>
  <text x="245" y="250" fill="#3B82F6" font-family="monospace" font-size="9" text-anchor="middle">EYE-WASH &amp; FUME HOODS EQUIPPED</text>

  <rect x="500" y="160" width="315" height="150" fill="#EFF6FF" stroke="#2563EB" stroke-width="2"/>
  <text x="657" y="230" fill="#1E3A8A" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">MATERIALS RESEARCH LAB 202</text>

  <rect x="85" y="330" width="400" height="175" fill="#EFF6FF" stroke="#2563EB" stroke-width="2"/>
  <text x="285" y="420" fill="#1E3A8A" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">ORGANIC SYNTHESIS LAB 203</text>

  <!-- Chemical Storage Vault -->
  <rect x="500" y="330" width="315" height="175" fill="#FEF2F2" stroke="#DC2626" stroke-width="2"/>
  <text x="657" y="415" fill="#991B1B" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">HAZMAT CHEMICAL STORAGE VAULT</text>
  <text x="657" y="435" fill="#B91C1C" font-family="monospace" font-size="9" text-anchor="middle">DRY CHEMICAL FOAM SYSTEM</text>

  <!-- Corridor Egress Path -->
  <line x1="450" y1="280" x2="450" y2="105" stroke="#059669" stroke-width="4" marker-end="url(#arrow-green-2)"/>
</svg>`);
}

export function generateAcademicLevel3Svg(): string {
  return createSvgDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="100%" height="100%">
  <defs>
    <pattern id="grid-acad-3" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" stroke-width="0.8"/>
    </pattern>
    <marker id="arrow-green-3" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 9 5 L 0 9 z" fill="#059669" />
    </marker>
  </defs>

  <rect width="900" height="600" fill="#F8FAFC"/>
  <rect width="900" height="600" fill="url(#grid-acad-3)"/>
  <rect x="70" y="80" width="760" height="440" fill="#FFFFFF" stroke="#1E293B" stroke-width="4"/>

  <!-- Mandatory Safety Disclaimer Header -->
  <rect x="70" y="30" width="760" height="34" fill="#FEF2F2" stroke="#DC2626" stroke-width="1.5" rx="3"/>
  <text x="450" y="52" fill="#991B1B" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="700" text-anchor="middle" letter-spacing="0.5">
    &#9888; ${DISCLAIMER_TEXT} &bull; DRILLPROOF VERIFIED FACILITY
  </text>

  <!-- Plan Metadata Header -->
  <rect x="85" y="95" width="370" height="48" fill="#F1F5F9" stroke="#94A3B8" stroke-width="1" rx="2"/>
  <text x="98" y="115" fill="#0F172A" font-family="sans-serif" font-size="13" font-weight="bold">ACADEMIC BLOCK &mdash; LEVEL 3</text>
  <text x="98" y="132" fill="#475569" font-family="monospace" font-size="10">DEPARTMENTAL LIBRARY &amp; RESEARCH &bull; CAP: 220</text>

  <!-- Exits -->
  <rect x="380" y="68" width="140" height="24" fill="#059669" stroke="#047857" stroke-width="2" rx="2"/>
  <text x="450" y="84" fill="#FFFFFF" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">NORTH STAIRWELL (CLEAR)</text>

  <rect x="820" y="270" width="22" height="90" fill="#059669" stroke="#047857" stroke-width="2" rx="2"/>
  <text x="827" y="320" fill="#FFFFFF" font-family="sans-serif" font-size="8" font-weight="bold" transform="rotate(90 827 320)" text-anchor="middle">EAST STAIR (CLEAR)</text>

  <!-- Library Stacks & Reading Room -->
  <rect x="85" y="160" width="460" height="345" fill="#F8FAFC" stroke="#334155" stroke-width="2"/>
  <text x="315" y="330" fill="#0F172A" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">MAIN READING ROOM &amp; STACKS</text>

  <!-- Research Suites -->
  <rect x="560" y="160" width="255" height="345" fill="#F1F5F9" stroke="#334155" stroke-width="2"/>
  <text x="687" y="330" fill="#0F172A" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">POSTGRADUATE RESEARCH SUITES</text>

  <!-- Corridor Egress Path -->
  <line x1="550" y1="280" x2="450" y2="105" stroke="#059669" stroke-width="4" marker-end="url(#arrow-green-3)"/>
</svg>`);
}

export function generateAdminGroundFloorSvg(): string {
  return createSvgDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="100%" height="100%">
  <defs>
    <pattern id="grid-adm-0" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" stroke-width="0.8"/>
    </pattern>
    <marker id="arrow-green-adm0" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 9 5 L 0 9 z" fill="#059669" />
    </marker>
  </defs>

  <rect width="900" height="600" fill="#F8FAFC"/>
  <rect width="900" height="600" fill="url(#grid-adm-0)"/>
  <rect x="70" y="80" width="760" height="440" fill="#FFFFFF" stroke="#1E293B" stroke-width="4"/>

  <!-- Mandatory Safety Disclaimer Header -->
  <rect x="70" y="30" width="760" height="34" fill="#FEF2F2" stroke="#DC2626" stroke-width="1.5" rx="3"/>
  <text x="450" y="52" fill="#991B1B" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="700" text-anchor="middle" letter-spacing="0.5">
    &#9888; ${DISCLAIMER_TEXT} &bull; DRILLPROOF VERIFIED FACILITY
  </text>

  <!-- Plan Metadata Header -->
  <rect x="85" y="95" width="370" height="48" fill="#F1F5F9" stroke="#94A3B8" stroke-width="1" rx="2"/>
  <text x="98" y="115" fill="#0F172A" font-family="sans-serif" font-size="13" font-weight="bold">ADMINISTRATION COMPLEX &mdash; GROUND FLOOR</text>
  <text x="98" y="132" fill="#475569" font-family="monospace" font-size="10">PUBLIC RECEPTION &amp; VISITOR SERVICES &bull; CAP: 180</text>

  <!-- Compass Rose -->
  <g transform="translate(800, 120)">
    <circle cx="0" cy="0" r="18" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.5"/>
    <path d="M 0 -15 L 4 -2 L -4 -2 Z" fill="#DC2626"/>
    <path d="M 0 15 L 4 2 L -4 2 Z" fill="#64748B"/>
    <text x="0" y="-18" fill="#DC2626" font-family="sans-serif" font-size="9" font-weight="bold" text-anchor="middle">N</text>
  </g>

  <!-- Central Reception Atrium -->
  <rect x="260" y="170" width="380" height="240" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5" stroke-dasharray="4 4"/>
  <text x="450" y="270" fill="#334155" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">MAIN EXECUTIVE FOYER</text>
  <text x="450" y="290" fill="#64748B" font-family="monospace" font-size="10" text-anchor="middle">VISITOR SCREENING &amp; CHECK-IN</text>

  <!-- Reception Security Counter -->
  <rect x="360" y="330" width="180" height="35" fill="#E2E8F0" stroke="#475569" stroke-width="1.5" rx="3"/>
  <text x="450" y="352" fill="#0F172A" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">SECURITY RECEPTION DESK</text>

  <!-- West: Conference Hall A & B -->
  <rect x="85" y="160" width="160" height="160" fill="#F1F5F9" stroke="#334155" stroke-width="2"/>
  <text x="165" y="235" fill="#0F172A" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">CONFERENCE HALL A</text>
  <text x="165" y="252" fill="#64748B" font-family="monospace" font-size="9" text-anchor="middle">Cap: 40</text>

  <rect x="85" y="335" width="160" height="170" fill="#F1F5F9" stroke="#334155" stroke-width="2"/>
  <text x="165" y="415" fill="#0F172A" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">CONFERENCE HALL B</text>
  <text x="165" y="432" fill="#64748B" font-family="monospace" font-size="9" text-anchor="middle">Cap: 40</text>

  <!-- East: Visitor Lounge & Admissions -->
  <rect x="655" y="160" width="160" height="160" fill="#F1F5F9" stroke="#334155" stroke-width="2"/>
  <text x="735" y="235" fill="#0F172A" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">VISITOR LOUNGE</text>

  <rect x="655" y="335" width="160" height="170" fill="#F1F5F9" stroke="#334155" stroke-width="2"/>
  <text x="735" y="415" fill="#0F172A" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">CENTRAL ADMISSIONS</text>

  <!-- Exits -->
  <!-- Exit 1: Central Plaza Revolving Doors (South) -->
  <rect x="360" y="515" width="180" height="24" fill="#059669" stroke="#047857" stroke-width="2" rx="2"/>
  <text x="450" y="531" fill="#FFFFFF" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">CENTRAL PLAZA PANIC DOORS (CLEAR)</text>

  <!-- Exit 2: South Garden Egress (East) -->
  <rect x="820" y="280" width="22" height="80" fill="#059669" stroke="#047857" stroke-width="2" rx="2"/>
  <text x="827" y="320" fill="#FFFFFF" font-family="sans-serif" font-size="8" font-weight="bold" transform="rotate(90 827 320)" text-anchor="middle">SOUTH GARDEN</text>

  <!-- Egress Flow Arrows -->
  <line x1="245" y1="240" x2="350" y2="280" stroke="#059669" stroke-width="3" stroke-dasharray="6 3" marker-end="url(#arrow-green-adm0)"/>
  <line x1="655" y1="240" x2="550" y2="280" stroke="#059669" stroke-width="3" stroke-dasharray="6 3" marker-end="url(#arrow-green-adm0)"/>
  <line x1="450" y1="375" x2="450" y2="510" stroke="#059669" stroke-width="4" marker-end="url(#arrow-green-adm0)"/>

  <!-- Safety Assets -->
  <g transform="translate(340, 345)">
    <rect x="-10" y="-10" width="20" height="20" fill="#DC2626" rx="2"/>
    <text x="0" y="4" fill="#FFFFFF" font-family="sans-serif" font-size="7" font-weight="bold" text-anchor="middle">EXT</text>
  </g>
  <text x="340" y="362" fill="#DC2626" font-family="sans-serif" font-size="7" font-weight="bold" text-anchor="middle">EXT-AD-01</text>

  <g transform="translate(560, 345)">
    <rect x="-10" y="-10" width="20" height="20" fill="#0284C7" rx="2"/>
    <text x="0" y="4" fill="#FFFFFF" font-family="sans-serif" font-size="7" font-weight="bold" text-anchor="middle">AED</text>
  </g>
  <text x="560" y="362" fill="#0284C7" font-family="sans-serif" font-size="7" font-weight="bold" text-anchor="middle">AED-AD-01</text>

  <!-- Muster Callout -->
  <g transform="translate(560, 532)">
    <rect x="0" y="0" width="255" height="48" fill="#ECFDF5" stroke="#10B981" stroke-width="1" rx="2"/>
    <text x="12" y="20" fill="#065F46" font-family="sans-serif" font-size="10" font-weight="bold">&#10140; TO ASSEMBLY POINT C</text>
    <text x="12" y="36" fill="#047857" font-family="monospace" font-size="8">Flagpole Rotunda (30m straight egress)</text>
  </g>
</svg>`);
}

export function generateAdminLevel1Svg(): string {
  return createSvgDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="100%" height="100%">
  <defs>
    <pattern id="grid-adm-1" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" stroke-width="0.8"/>
    </pattern>
    <marker id="arrow-green-adm1" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 9 5 L 0 9 z" fill="#059669" />
    </marker>
  </defs>

  <rect width="900" height="600" fill="#F8FAFC"/>
  <rect width="900" height="600" fill="url(#grid-adm-1)"/>
  <rect x="70" y="80" width="760" height="440" fill="#FFFFFF" stroke="#1E293B" stroke-width="4"/>

  <!-- Mandatory Safety Disclaimer Header -->
  <rect x="70" y="30" width="760" height="34" fill="#FEF2F2" stroke="#DC2626" stroke-width="1.5" rx="3"/>
  <text x="450" y="52" fill="#991B1B" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="700" text-anchor="middle" letter-spacing="0.5">
    &#9888; ${DISCLAIMER_TEXT} &bull; DRILLPROOF VERIFIED FACILITY
  </text>

  <!-- Plan Metadata Header -->
  <rect x="85" y="95" width="370" height="48" fill="#F1F5F9" stroke="#94A3B8" stroke-width="1" rx="2"/>
  <text x="98" y="115" fill="#0F172A" font-family="sans-serif" font-size="13" font-weight="bold">ADMINISTRATION COMPLEX &mdash; LEVEL 1</text>
  <text x="98" y="132" fill="#475569" font-family="monospace" font-size="10">EXECUTIVE BOARDROOM &amp; DEAN SUITES &bull; CAP: 120</text>

  <!-- Compass Rose -->
  <g transform="translate(800, 120)">
    <circle cx="0" cy="0" r="18" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.5"/>
    <path d="M 0 -15 L 4 -2 L -4 -2 Z" fill="#DC2626"/>
    <path d="M 0 15 L 4 2 L -4 2 Z" fill="#64748B"/>
    <text x="0" y="-18" fill="#DC2626" font-family="sans-serif" font-size="9" font-weight="bold" text-anchor="middle">N</text>
  </g>

  <!-- Exits -->
  <!-- North Executive Stairwell -->
  <rect x="360" y="68" width="180" height="24" fill="#059669" stroke="#047857" stroke-width="2" rx="2"/>
  <text x="450" y="84" fill="#FFFFFF" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">NORTH EXECUTIVE STAIRWELL (CLEAR)</text>

  <!-- South Staff Egress Stairwell -->
  <rect x="360" y="515" width="180" height="24" fill="#059669" stroke="#047857" stroke-width="2" rx="2"/>
  <text x="450" y="531" fill="#FFFFFF" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">SOUTH STAFF STAIRWELL (CLEAR)</text>

  <!-- Central Executive Gallery -->
  <rect x="230" y="240" width="440" height="120" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
  <text x="450" y="305" fill="#475569" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">EXECUTIVE GALLERY &amp; ARTERIAL CORRIDOR</text>

  <!-- Boardroom A (West) -->
  <rect x="85" y="160" width="240" height="160" fill="#F1F5F9" stroke="#334155" stroke-width="2"/>
  <text x="205" y="235" fill="#0F172A" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">MAIN BOARDROOM A</text>
  <text x="205" y="252" fill="#64748B" font-family="monospace" font-size="9" text-anchor="middle">Cap: 45 &bull; Dual Egress Doors</text>

  <!-- Dean's Office Suite (West South) -->
  <rect x="85" y="340" width="240" height="165" fill="#F1F5F9" stroke="#334155" stroke-width="2"/>
  <text x="205" y="420" fill="#0F172A" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">DEAN &amp; DIRECTOR SUITES</text>

  <!-- Academic Senate Chamber (East North) -->
  <rect x="575" y="160" width="240" height="160" fill="#F1F5F9" stroke="#334155" stroke-width="2"/>
  <text x="695" y="235" fill="#0F172A" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">SENATE CHAMBER</text>
  <text x="695" y="252" fill="#64748B" font-family="monospace" font-size="9" text-anchor="middle">Cap: 35</text>

  <!-- HR & Staff Commons (East South) -->
  <rect x="575" y="340" width="240" height="165" fill="#F1F5F9" stroke="#334155" stroke-width="2"/>
  <text x="695" y="415" fill="#0F172A" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">HUMAN RESOURCES &amp; BREAK</text>

  <!-- Egress Paths -->
  <line x1="325" y1="240" x2="430" y2="105" stroke="#059669" stroke-width="3" stroke-dasharray="6 3" marker-end="url(#arrow-green-adm1)"/>
  <line x1="575" y1="420" x2="470" y2="505" stroke="#059669" stroke-width="3" stroke-dasharray="6 3" marker-end="url(#arrow-green-adm1)"/>

  <!-- Equipment -->
  <g transform="translate(345, 200)">
    <rect x="-10" y="-10" width="20" height="20" fill="#DC2626" rx="2"/>
    <text x="0" y="4" fill="#FFFFFF" font-family="sans-serif" font-size="7" font-weight="bold" text-anchor="middle">EXT</text>
  </g>
  <text x="345" y="218" fill="#DC2626" font-family="sans-serif" font-size="7" font-weight="bold" text-anchor="middle">EXT-AD-101</text>

  <g transform="translate(555, 450)">
    <rect x="-10" y="-10" width="20" height="20" fill="#16A34A" rx="2"/>
    <text x="0" y="4" fill="#FFFFFF" font-family="sans-serif" font-size="8" font-weight="bold" text-anchor="middle">+</text>
  </g>
  <text x="555" y="468" fill="#16A34A" font-family="sans-serif" font-size="7" font-weight="bold" text-anchor="middle">FAK-AD-101</text>
</svg>`);
}

export function generateAdminLevel2Svg(): string {
  return createSvgDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="100%" height="100%">
  <defs>
    <pattern id="grid-adm-2" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" stroke-width="0.8"/>
    </pattern>
    <marker id="arrow-green-adm2" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 9 5 L 0 9 z" fill="#059669" />
    </marker>
  </defs>

  <rect width="900" height="600" fill="#F8FAFC"/>
  <rect width="900" height="600" fill="url(#grid-adm-2)"/>
  <rect x="70" y="80" width="760" height="440" fill="#FFFFFF" stroke="#1E293B" stroke-width="4"/>

  <!-- Mandatory Safety Disclaimer Header -->
  <rect x="70" y="30" width="760" height="34" fill="#FEF2F2" stroke="#DC2626" stroke-width="1.5" rx="3"/>
  <text x="450" y="52" fill="#991B1B" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="700" text-anchor="middle" letter-spacing="0.5">
    &#9888; ${DISCLAIMER_TEXT} &bull; DRILLPROOF VERIFIED FACILITY
  </text>

  <!-- Plan Metadata Header -->
  <rect x="85" y="95" width="410" height="48" fill="#F1F5F9" stroke="#94A3B8" stroke-width="1" rx="2"/>
  <text x="98" y="115" fill="#0F172A" font-family="sans-serif" font-size="13" font-weight="bold">ADMINISTRATION COMPLEX &mdash; LEVEL 2</text>
  <text x="98" y="132" fill="#475569" font-family="monospace" font-size="10">FINANCE, IT DATA CENTER &amp; ARCHIVES &bull; CAP: 80</text>

  <!-- Compass Rose -->
  <g transform="translate(800, 120)">
    <circle cx="0" cy="0" r="18" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.5"/>
    <path d="M 0 -15 L 4 -2 L -4 -2 Z" fill="#DC2626"/>
    <path d="M 0 15 L 4 2 L -4 2 Z" fill="#64748B"/>
    <text x="0" y="-18" fill="#DC2626" font-family="sans-serif" font-size="9" font-weight="bold" text-anchor="middle">N</text>
  </g>

  <!-- North Stairwell Exit -->
  <rect x="360" y="68" width="180" height="24" fill="#059669" stroke="#047857" stroke-width="2" rx="2"/>
  <text x="450" y="84" fill="#FFFFFF" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">NORTH STAIRWELL FIRE DOOR (CLEAR)</text>

  <!-- High-Security IT Data Center (FM-200 Clean Agent Zone) -->
  <rect x="85" y="160" width="340" height="170" fill="#FEF3C7" stroke="#D97706" stroke-width="2.5"/>
  <text x="255" y="230" fill="#92400E" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">CENTRAL IT DATA CENTER</text>
  <text x="255" y="250" fill="#B45309" font-family="monospace" font-size="9" text-anchor="middle">SEALED GASEOUS FM-200 SUPPRESSION ZONE</text>
  <text x="255" y="268" fill="#B45309" font-family="monospace" font-size="8" text-anchor="middle">RACK CLUSTER 01 - 16</text>

  <!-- Network Operations Center (NOC) -->
  <rect x="85" y="345" width="340" height="160" fill="#EFF6FF" stroke="#2563EB" stroke-width="2"/>
  <text x="255" y="420" fill="#1E3A8A" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">NETWORK OPERATIONS CENTER (NOC)</text>
  <text x="255" y="438" fill="#3B82F6" font-family="monospace" font-size="9" text-anchor="middle">24/7 Security Console</text>

  <!-- Financial Archival Vault -->
  <rect x="445" y="160" width="370" height="170" fill="#F8FAFC" stroke="#475569" stroke-width="2"/>
  <text x="630" y="235" fill="#0F172A" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">FINANCIAL ARCHIVES &amp; SECURE RECORDS</text>
  <text x="630" y="252" fill="#64748B" font-family="monospace" font-size="9" text-anchor="middle">Fire-Rated Vault Doors &bull; Restrictive Keycard</text>

  <!-- Accounts & Auditing Offices -->
  <rect x="445" y="345" width="370" height="160" fill="#F1F5F9" stroke="#334155" stroke-width="2"/>
  <text x="630" y="420" fill="#0F172A" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">FINANCE &amp; INTERNAL AUDITING WING</text>

  <!-- Corridor Egress Path -->
  <line x1="435" y1="280" x2="450" y2="105" stroke="#059669" stroke-width="4" marker-end="url(#arrow-green-adm2)"/>

  <!-- Extinguisher (Clean Gas) -->
  <g transform="translate(415, 200)">
    <rect x="-10" y="-10" width="20" height="20" fill="#DC2626" rx="2"/>
    <text x="0" y="4" fill="#FFFFFF" font-family="sans-serif" font-size="7" font-weight="bold" text-anchor="middle">EXT</text>
  </g>
  <text x="415" y="218" fill="#DC2626" font-family="sans-serif" font-size="7" font-weight="bold" text-anchor="middle">EXT-AD-201</text>
</svg>`);
}

export function generateResidenceGroundFloorSvg(): string {
  return createSvgDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="100%" height="100%">
  <defs>
    <pattern id="grid-res-0" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" stroke-width="0.8"/>
    </pattern>
    <marker id="arrow-green-res0" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 9 5 L 0 9 z" fill="#059669" />
    </marker>
  </defs>

  <rect width="900" height="600" fill="#F8FAFC"/>
  <rect width="900" height="600" fill="url(#grid-res-0)"/>
  <rect x="70" y="80" width="760" height="440" fill="#FFFFFF" stroke="#1E293B" stroke-width="4"/>

  <!-- Mandatory Safety Disclaimer Header -->
  <rect x="70" y="30" width="760" height="34" fill="#FEF2F2" stroke="#DC2626" stroke-width="1.5" rx="3"/>
  <text x="450" y="52" fill="#991B1B" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="700" text-anchor="middle" letter-spacing="0.5">
    &#9888; ${DISCLAIMER_TEXT} &bull; DRILLPROOF VERIFIED FACILITY
  </text>

  <!-- Plan Metadata Header -->
  <rect x="85" y="95" width="420" height="48" fill="#F1F5F9" stroke="#94A3B8" stroke-width="1" rx="2"/>
  <text x="98" y="115" fill="#0F172A" font-family="sans-serif" font-size="13" font-weight="bold">STUDENT RESIDENCE &mdash; GROUND FLOOR COMMONS</text>
  <text x="98" y="132" fill="#475569" font-family="monospace" font-size="10">DORM LOBBY, DINING ACCESS &amp; WARDEN OFFICE &bull; CAP: 350</text>

  <!-- Compass Rose -->
  <g transform="translate(800, 120)">
    <circle cx="0" cy="0" r="18" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.5"/>
    <path d="M 0 -15 L 4 -2 L -4 -2 Z" fill="#DC2626"/>
    <path d="M 0 15 L 4 2 L -4 2 Z" fill="#64748B"/>
    <text x="0" y="-18" fill="#DC2626" font-family="sans-serif" font-size="9" font-weight="bold" text-anchor="middle">N</text>
  </g>

  <!-- Exits -->
  <!-- Exit 1: Main South Residence Entrance -->
  <rect x="340" y="515" width="220" height="24" fill="#059669" stroke="#047857" stroke-width="2" rx="2"/>
  <text x="450" y="531" fill="#FFFFFF" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">MAIN SOUTH RESIDENCE ENTRANCE (CLEAR)</text>

  <!-- Exit 2: North Dining Hall Emergency Gate -->
  <rect x="340" y="68" width="220" height="24" fill="#059669" stroke="#047857" stroke-width="2" rx="2"/>
  <text x="450" y="84" fill="#FFFFFF" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">NORTH DINING HALL EMERGENCY GATE</text>

  <!-- Central Commons & Lounge -->
  <rect x="230" y="180" width="440" height="220" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5" stroke-dasharray="4 4"/>
  <text x="450" y="275" fill="#334155" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">CENTRAL ATRIUM &amp; RECREATION COMMONS</text>
  <text x="450" y="295" fill="#64748B" font-family="monospace" font-size="9" text-anchor="middle">PRIMARY RESIDENT GATHERING CONCOURSE</text>

  <!-- Warden Duty Office (West North) -->
  <rect x="85" y="160" width="135" height="150" fill="#FEF3C7" stroke="#D97706" stroke-width="2"/>
  <text x="152" y="230" fill="#92400E" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">WARDEN POST</text>
  <text x="152" y="246" fill="#B45309" font-family="monospace" font-size="8" text-anchor="middle">24/7 Safety Desk</text>

  <!-- Student Package & Mail (West South) -->
  <rect x="85" y="325" width="135" height="180" fill="#F1F5F9" stroke="#334155" stroke-width="2"/>
  <text x="152" y="415" fill="#0F172A" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">MAIL &amp; STORAGE</text>

  <!-- Dining Hall Access Concourse (East North) -->
  <rect x="680" y="160" width="135" height="150" fill="#F1F5F9" stroke="#334155" stroke-width="2"/>
  <text x="747" y="230" fill="#0F172A" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">DINING PASS</text>
  <text x="747" y="246" fill="#64748B" font-family="monospace" font-size="8" text-anchor="middle">Turnstile Exit</text>

  <!-- Central Laundry (East South) -->
  <rect x="680" y="325" width="135" height="180" fill="#F1F5F9" stroke="#334155" stroke-width="2"/>
  <text x="747" y="415" fill="#0F172A" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">LAUNDRY BAY</text>

  <!-- Flow Arrows to South Lawn -->
  <line x1="450" y1="340" x2="450" y2="505" stroke="#059669" stroke-width="4" marker-end="url(#arrow-green-res0)"/>

  <!-- Equipment -->
  <g transform="translate(195, 230)">
    <rect x="-10" y="-10" width="20" height="20" fill="#DC2626" rx="2"/>
    <text x="0" y="4" fill="#FFFFFF" font-family="sans-serif" font-size="7" font-weight="bold" text-anchor="middle">EXT</text>
  </g>
  <text x="195" y="248" fill="#DC2626" font-family="sans-serif" font-size="7" font-weight="bold" text-anchor="middle">EXT-RES-01</text>

  <g transform="translate(255, 360)">
    <rect x="-10" y="-10" width="20" height="20" fill="#16A34A" rx="2"/>
    <text x="0" y="4" fill="#FFFFFF" font-family="sans-serif" font-size="8" font-weight="bold" text-anchor="middle">+</text>
  </g>
  <text x="255" y="378" fill="#16A34A" font-family="sans-serif" font-size="7" font-weight="bold" text-anchor="middle">FAK-RES-01</text>

  <!-- Muster Callout -->
  <g transform="translate(560, 532)">
    <rect x="0" y="0" width="255" height="48" fill="#ECFDF5" stroke="#10B981" stroke-width="1" rx="2"/>
    <text x="12" y="20" fill="#065F46" font-family="sans-serif" font-size="10" font-weight="bold">&#10140; TO ASSEMBLY POINT D</text>
    <text x="12" y="36" fill="#047857" font-family="monospace" font-size="8">South Lawn (40m straight egress)</text>
  </g>
</svg>`);
}

export function generateResidenceLevel1Svg(): string {
  return createSvgDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="100%" height="100%">
  <defs>
    <pattern id="grid-res-1" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" stroke-width="0.8"/>
    </pattern>
    <marker id="arrow-green-res1" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 9 5 L 0 9 z" fill="#059669" />
    </marker>
  </defs>

  <rect width="900" height="600" fill="#F8FAFC"/>
  <rect width="900" height="600" fill="url(#grid-res-1)"/>
  <rect x="70" y="80" width="760" height="440" fill="#FFFFFF" stroke="#1E293B" stroke-width="4"/>

  <!-- Mandatory Safety Disclaimer Header -->
  <rect x="70" y="30" width="760" height="34" fill="#FEF2F2" stroke="#DC2626" stroke-width="1.5" rx="3"/>
  <text x="450" y="52" fill="#991B1B" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="700" text-anchor="middle" letter-spacing="0.5">
    &#9888; ${DISCLAIMER_TEXT} &bull; DRILLPROOF VERIFIED FACILITY
  </text>

  <!-- Plan Metadata Header -->
  <rect x="85" y="95" width="410" height="48" fill="#F1F5F9" stroke="#94A3B8" stroke-width="1" rx="2"/>
  <text x="98" y="115" fill="#0F172A" font-family="sans-serif" font-size="13" font-weight="bold">STUDENT RESIDENCE &mdash; LEVEL 1</text>
  <text x="98" y="132" fill="#475569" font-family="monospace" font-size="10">DORMITORY ROOMS 101–130 &bull; CAP: 200</text>

  <!-- Compass Rose -->
  <g transform="translate(800, 120)">
    <circle cx="0" cy="0" r="18" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.5"/>
    <path d="M 0 -15 L 4 -2 L -4 -2 Z" fill="#DC2626"/>
    <path d="M 0 15 L 4 2 L -4 2 Z" fill="#64748B"/>
    <text x="0" y="-18" fill="#DC2626" font-family="sans-serif" font-size="9" font-weight="bold" text-anchor="middle">N</text>
  </g>

  <!-- Exits -->
  <!-- West Interior Stairwell -->
  <rect x="58" y="240" width="22" height="120" fill="#059669" stroke="#047857" stroke-width="2" rx="2"/>
  <text x="65" y="300" fill="#FFFFFF" font-family="sans-serif" font-size="9" font-weight="bold" transform="rotate(-90 65 300)" text-anchor="middle">WEST INTERIOR STAIR</text>

  <!-- East Exterior Fire Escape Staircase -->
  <rect x="820" y="240" width="22" height="120" fill="#059669" stroke="#047857" stroke-width="2" rx="2"/>
  <text x="827" y="300" fill="#FFFFFF" font-family="sans-serif" font-size="9" font-weight="bold" transform="rotate(90 827 300)" text-anchor="middle">EAST FIRE ESCAPE</text>

  <!-- North Rooms: 101 to 115 -->
  <rect x="90" y="160" width="720" height="90" fill="#F1F5F9" stroke="#334155" stroke-width="1.5"/>
  <text x="140" y="210" fill="#0F172A" font-family="sans-serif" font-size="11" font-weight="bold">RMS 101-105</text>
  <text x="320" y="210" fill="#0F172A" font-family="sans-serif" font-size="11" font-weight="bold">RMS 106-110</text>
  <text x="500" y="210" fill="#0F172A" font-family="sans-serif" font-size="11" font-weight="bold">RMS 111-113</text>
  <text x="680" y="210" fill="#0F172A" font-family="sans-serif" font-size="11" font-weight="bold">RMS 114-115</text>

  <!-- Central Double-Loaded Corridor -->
  <rect x="90" y="260" width="720" height="80" fill="#F8FAFC" stroke="#94A3B8" stroke-width="1.5"/>
  <text x="450" y="305" fill="#475569" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">CENTRAL RESIDENTIAL CORRIDOR (2.4m CLEAR WIDTH)</text>

  <!-- South Rooms: 116 to 130 -->
  <rect x="90" y="350" width="720" height="90" fill="#F1F5F9" stroke="#334155" stroke-width="1.5"/>
  <text x="140" y="400" fill="#0F172A" font-family="sans-serif" font-size="11" font-weight="bold">RMS 116-120</text>
  <text x="320" y="400" fill="#0F172A" font-family="sans-serif" font-size="11" font-weight="bold">RMS 121-125</text>
  <text x="500" y="400" fill="#0F172A" font-family="sans-serif" font-size="11" font-weight="bold">STUDY BAY</text>
  <text x="680" y="400" fill="#0F172A" font-family="sans-serif" font-size="11" font-weight="bold">RMS 126-130</text>

  <!-- Flow Arrows (Dual Egress) -->
  <line x1="380" y1="300" x2="95" y2="300" stroke="#059669" stroke-width="3" stroke-dasharray="6 3" marker-end="url(#arrow-green-res1)"/>
  <line x1="520" y1="300" x2="805" y2="300" stroke="#059669" stroke-width="3" stroke-dasharray="6 3" marker-end="url(#arrow-green-res1)"/>

  <!-- Equipment -->
  <g transform="translate(450, 240)">
    <rect x="-10" y="-10" width="20" height="20" fill="#DC2626" rx="2"/>
    <text x="0" y="4" fill="#FFFFFF" font-family="sans-serif" font-size="7" font-weight="bold" text-anchor="middle">EXT</text>
  </g>
  <text x="450" y="258" fill="#DC2626" font-family="sans-serif" font-size="7" font-weight="bold" text-anchor="middle">EXT-RES-101</text>

  <g transform="translate(790, 240)">
    <rect x="-10" y="-10" width="20" height="20" fill="#DC2626" rx="2"/>
    <text x="0" y="4" fill="#FFFFFF" font-family="sans-serif" font-size="7" font-weight="bold" text-anchor="middle">FHR</text>
  </g>
  <text x="790" y="258" fill="#DC2626" font-family="sans-serif" font-size="7" font-weight="bold" text-anchor="middle">FHR-RES-101</text>
</svg>`);
}

export function generateResidenceLevel2Svg(): string {
  return createSvgDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="100%" height="100%">
  <defs>
    <pattern id="grid-res-2" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" stroke-width="0.8"/>
    </pattern>
    <marker id="arrow-green-res2" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 9 5 L 0 9 z" fill="#059669" />
    </marker>
  </defs>

  <rect width="900" height="600" fill="#F8FAFC"/>
  <rect width="900" height="600" fill="url(#grid-res-2)"/>
  <rect x="70" y="80" width="760" height="440" fill="#FFFFFF" stroke="#1E293B" stroke-width="4"/>

  <!-- Mandatory Safety Disclaimer Header -->
  <rect x="70" y="30" width="760" height="34" fill="#FEF2F2" stroke="#DC2626" stroke-width="1.5" rx="3"/>
  <text x="450" y="52" fill="#991B1B" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="700" text-anchor="middle" letter-spacing="0.5">
    &#9888; ${DISCLAIMER_TEXT} &bull; DRILLPROOF VERIFIED FACILITY
  </text>

  <!-- Plan Metadata Header -->
  <rect x="85" y="95" width="410" height="48" fill="#F1F5F9" stroke="#94A3B8" stroke-width="1" rx="2"/>
  <text x="98" y="115" fill="#0F172A" font-family="sans-serif" font-size="13" font-weight="bold">STUDENT RESIDENCE &mdash; LEVEL 2</text>
  <text x="98" y="132" fill="#475569" font-family="monospace" font-size="10">DORMITORY ROOMS 201–230 &bull; CAP: 200</text>

  <!-- Compass Rose -->
  <g transform="translate(800, 120)">
    <circle cx="0" cy="0" r="18" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.5"/>
    <path d="M 0 -15 L 4 -2 L -4 -2 Z" fill="#DC2626"/>
    <path d="M 0 15 L 4 2 L -4 2 Z" fill="#64748B"/>
    <text x="0" y="-18" fill="#DC2626" font-family="sans-serif" font-size="9" font-weight="bold" text-anchor="middle">N</text>
  </g>

  <!-- Exits -->
  <!-- West Interior Stairwell -->
  <rect x="58" y="240" width="22" height="120" fill="#059669" stroke="#047857" stroke-width="2" rx="2"/>
  <text x="65" y="300" fill="#FFFFFF" font-family="sans-serif" font-size="9" font-weight="bold" transform="rotate(-90 65 300)" text-anchor="middle">WEST INTERIOR STAIR</text>

  <!-- East Exterior Fire Escape Staircase -->
  <rect x="820" y="240" width="22" height="120" fill="#059669" stroke="#047857" stroke-width="2" rx="2"/>
  <text x="827" y="300" fill="#FFFFFF" font-family="sans-serif" font-size="9" font-weight="bold" transform="rotate(90 827 300)" text-anchor="middle">EAST FIRE ESCAPE</text>

  <!-- North Rooms: 201 to 215 -->
  <rect x="90" y="160" width="720" height="90" fill="#F1F5F9" stroke="#334155" stroke-width="1.5"/>
  <text x="140" y="210" fill="#0F172A" font-family="sans-serif" font-size="11" font-weight="bold">RMS 201-205</text>
  <text x="320" y="210" fill="#0F172A" font-family="sans-serif" font-size="11" font-weight="bold">RMS 206-210</text>
  <text x="500" y="210" fill="#0F172A" font-family="sans-serif" font-size="11" font-weight="bold">RMS 211-213</text>
  <text x="680" y="210" fill="#0F172A" font-family="sans-serif" font-size="11" font-weight="bold">RMS 214-215</text>

  <!-- Central Double-Loaded Corridor -->
  <rect x="90" y="260" width="720" height="80" fill="#F8FAFC" stroke="#94A3B8" stroke-width="1.5"/>
  <text x="450" y="305" fill="#475569" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">CENTRAL RESIDENTIAL CORRIDOR (2.4m CLEAR WIDTH)</text>

  <!-- South Rooms: 216 to 230 -->
  <rect x="90" y="350" width="720" height="90" fill="#F1F5F9" stroke="#334155" stroke-width="1.5"/>
  <text x="140" y="400" fill="#0F172A" font-family="sans-serif" font-size="11" font-weight="bold">RMS 216-220</text>
  <text x="320" y="400" fill="#0F172A" font-family="sans-serif" font-size="11" font-weight="bold">RMS 221-225</text>
  <text x="500" y="400" fill="#0F172A" font-family="sans-serif" font-size="11" font-weight="bold">COMMUNITY KITCHEN</text>
  <text x="680" y="400" fill="#0F172A" font-family="sans-serif" font-size="11" font-weight="bold">RMS 226-230</text>

  <!-- Flow Arrows (Dual Egress) -->
  <line x1="380" y1="300" x2="95" y2="300" stroke="#059669" stroke-width="3" stroke-dasharray="6 3" marker-end="url(#arrow-green-res2)"/>
  <line x1="520" y1="300" x2="805" y2="300" stroke="#059669" stroke-width="3" stroke-dasharray="6 3" marker-end="url(#arrow-green-res2)"/>

  <!-- Equipment -->
  <g transform="translate(450, 240)">
    <rect x="-10" y="-10" width="20" height="20" fill="#DC2626" rx="2"/>
    <text x="0" y="4" fill="#FFFFFF" font-family="sans-serif" font-size="7" font-weight="bold" text-anchor="middle">EXT</text>
  </g>
  <text x="450" y="258" fill="#DC2626" font-family="sans-serif" font-size="7" font-weight="bold" text-anchor="middle">EXT-RES-201</text>
</svg>`);
}

export function generateGenericFloorSvg(buildingName: string, floorLabel: string, floorNumber: number): string {
  return createSvgDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="100%" height="100%">
  <defs>
    <pattern id="grid-gen" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" stroke-width="0.8"/>
    </pattern>
    <marker id="arrow-green-gen" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 9 5 L 0 9 z" fill="#059669" />
    </marker>
  </defs>

  <rect width="900" height="600" fill="#F8FAFC"/>
  <rect width="900" height="600" fill="url(#grid-gen)"/>
  <rect x="70" y="80" width="760" height="440" fill="#FFFFFF" stroke="#1E293B" stroke-width="4"/>

  <!-- Mandatory Safety Disclaimer Header -->
  <rect x="70" y="30" width="760" height="34" fill="#FEF2F2" stroke="#DC2626" stroke-width="1.5" rx="3"/>
  <text x="450" y="52" fill="#991B1B" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="700" text-anchor="middle" letter-spacing="0.5">
    &#9888; ${DISCLAIMER_TEXT} &bull; DRILLPROOF VERIFIED FACILITY
  </text>

  <!-- Plan Metadata Header -->
  <rect x="85" y="95" width="380" height="48" fill="#F1F5F9" stroke="#94A3B8" stroke-width="1" rx="2"/>
  <text x="98" y="115" fill="#0F172A" font-family="sans-serif" font-size="12" font-weight="bold">${buildingName.toUpperCase()} &mdash; ${floorLabel.toUpperCase()}</text>
  <text x="98" y="132" fill="#475569" font-family="monospace" font-size="10">LEVEL ${floorNumber} &bull; EVACUATION EGRESS SCHEMATIC</text>

  <!-- North Stairwell Exit -->
  <rect x="380" y="68" width="140" height="24" fill="#059669" stroke="#047857" stroke-width="2" rx="2"/>
  <text x="450" y="84" fill="#FFFFFF" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">PRIMARY EGRESS STAIRWELL</text>

  <!-- South Emergency Exit -->
  <rect x="380" y="515" width="140" height="24" fill="#059669" stroke="#047857" stroke-width="2" rx="2"/>
  <text x="450" y="531" fill="#FFFFFF" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">SECONDARY EGRESS EXIT</text>

  <!-- Central Concourse -->
  <rect x="220" y="180" width="460" height="240" fill="#F8FAFC" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="4 4"/>
  <text x="450" y="295" fill="#334155" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">CENTRAL CORRIDOR &amp; MUSTER ACCESS</text>

  <!-- Wings -->
  <rect x="85" y="180" width="120" height="240" fill="#F1F5F9" stroke="#334155" stroke-width="1.5"/>
  <text x="145" y="305" fill="#0F172A" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">WEST WING</text>

  <rect x="695" y="180" width="120" height="240" fill="#F1F5F9" stroke="#334155" stroke-width="1.5"/>
  <text x="755" y="305" fill="#0F172A" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">EAST WING</text>

  <!-- Flow Arrows -->
  <line x1="450" y1="260" x2="450" y2="105" stroke="#059669" stroke-width="4" marker-end="url(#arrow-green-gen)"/>
  <line x1="450" y1="340" x2="450" y2="505" stroke="#059669" stroke-width="4" marker-end="url(#arrow-green-gen)"/>
</svg>`);
}
