import { useEffect, useMemo, useState } from "react";

// Timeline: RUN ms of evacuation, then HOLD ms showing the result, then loop.
const RUN = 11000;
const HOLD = 3500;
const FINAL_SECS = 277; // 4:37
const TARGET_SECS = 300; // 5:00
const COUNTED = 828;
const EXPECTED = 840;
const N = 84; // dots on screen; each one stands for ~10 people

const clamp = (v) => Math.min(1, Math.max(0, v));
const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

// Seeded random, so dots land in the same spots on every render.
function mulberry(a) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Every dot gets a route: room -> corridor -> exit -> assembly point.
// Nobody uses the west exit: that is the flagged one.
function makeDots() {
  const r = mulberry(11);
  return Array.from({ length: N }, (_, i) => {
    const lab = i % 2 === 0;
    const sx = lab ? 32 + r() * 156 : 212 + r() * 156;
    const sy = 28 + r() * 56;
    const east = !lab && r() > 0.5;
    const ex = east ? 345 : 190 + r() * 20;
    const pts = [
      [sx, sy],
      [sx, 99],
      [ex, 99],
      [ex, 184],
      [124 + r() * 152, 220 + r() * 18],
    ];
    const lens = pts.slice(1).map((p, k) => Math.hypot(p[0] - pts[k][0], p[1] - pts[k][1]));
    return {
      pts,
      lens,
      total: lens.reduce((a, b) => a + b, 0),
      start: 0.07 + r() * 0.33, // when this dot starts walking (0..1 of RUN)
      dur: 0.45 + r() * 0.13, // how much of RUN the walk takes
    };
  });
}

// Position along a polyline, q = 0..1 of its total length.
function at(d, q) {
  let s = q * d.total;
  for (let i = 0; i < d.lens.length; i++) {
    if (s <= d.lens[i] || i === d.lens.length - 1) {
      const k = Math.min(s / d.lens[i], 1);
      const a = d.pts[i];
      const b = d.pts[i + 1];
      return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
    }
    s -= d.lens[i];
  }
}

const ROOMS = [
  { name: "IT labs", x: 20, y: 14, w: 180, h: 80 },
  { name: "Lecture halls", x: 200, y: 14, w: 180, h: 80 },
  { name: "West stair", x: 20, y: 104, w: 70, h: 80, flagged: true },
  { name: "Central atrium", x: 100, y: 104, w: 200, h: 80 },
  { name: "East stair", x: 310, y: 104, w: 70, h: 80 },
];

export default function LiveDrill() {
  const dots = useMemo(makeDots, []);
  const [ms, setMs] = useState(0);

  // One clock drives everything.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setMs(RUN); // show the finished state, no motion
      return;
    }
    let raf;
    const t0 = performance.now();
    const tick = (now) => {
      setMs((now - t0) % (RUN + HOLD));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const u = clamp(ms / RUN);

  // Everything below is derived from u, so the numbers always match the dots.
  let arrived = 0;
  const live = dots.map((d) => {
    const q = clamp((u - d.start) / d.dur);
    if (q >= 1) arrived++;
    const [x, y] = at(d, q);
    return { x, y, s: q >= 1 ? "safe" : q > 0 ? "run" : "wait" };
  });

  const done = arrived === N;
  const counted = Math.round((arrived / N) * COUNTED);
  const secs = Math.round(u * FINAL_SECS);
  const smokeFade = 1 - clamp((u - 0.75) / 0.25) * 0.8;

  return (
    <figure className="ld" aria-label="Animated fire drill at Northstar Academic">
      <style>{CSS}</style>

      <figcaption className="ld-head">
        <span>Northstar Academic fire drill</span>
        <span className={`ld-chip ${done ? "ok" : ""}`}>
          <i />
          {done ? "Target met" : "Evacuating"}
        </span>
      </figcaption>

      <svg viewBox="0 0 400 256" aria-hidden="true">
        <defs>
          <radialGradient id="ld-smoke">
            <stop offset="0" stopColor="#8a8178" stopOpacity=".55" />
            <stop offset="1" stopColor="#8a8178" stopOpacity="0" />
          </radialGradient>
          <pattern id="ld-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="#e0a21b" strokeWidth="1.5" opacity=".55" />
          </pattern>
        </defs>

        {ROOMS.map((r) => (
          <g key={r.name}>
            <rect x={r.x} y={r.y} width={r.w} height={r.h} rx="4" fill="#f7f2e9" stroke="#d3cabb" />
            {r.flagged && (
              <rect className="ld-warn" x={r.x} y={r.y} width={r.w} height={r.h} rx="4" fill="url(#ld-hatch)" stroke="#e0a21b" />
            )}
            <text x={r.x + 8} y={r.y + 16} className="ld-room">{r.name}</text>
          </g>
        ))}
        <text x="28" y="150" className="ld-flag">40% door</text>
        <text x="28" y="160" className="ld-flag">clearance</text>

        {/* exits: west one is flagged amber, the other two are clear */}
        <rect x="43" y="182" width="24" height="4" rx="2" fill="#e0a21b" />
        <rect x="188" y="182" width="24" height="4" rx="2" fill="#12a37a" />
        <rect x="333" y="182" width="24" height="4" rx="2" fill="#12a37a" />

        {/* assembly point */}
        <rect x="110" y="200" width="180" height="48" rx="8" fill="#12a37a" fillOpacity=".07" stroke="#12a37a" strokeOpacity=".7" strokeDasharray="4 3" />
        <text x="118" y="211" className="ld-room" style={{ fill: "#0c7a5a" }}>Assembly point A</text>

        {/* fire + smoke starting in the IT labs */}
        <circle cx="52" cy="46" r={16 + u * 26} fill="url(#ld-smoke)" opacity={smokeFade} />
        <circle cx="52" cy="46" r="5" fill="#d9402f" />
        <circle className="ld-ring" cx="52" cy="46" r="5" fill="none" stroke="#d9402f" strokeWidth="1.5" />

        {live.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="2.6" fill={p.s === "safe" ? "#12a37a" : p.s === "run" ? "#d9402f" : "#3a3632"} />
        ))}
      </svg>

      <div className="ld-stats">
        <div>
          <span className="ld-k">Evacuation time</span>
          <b className={`ld-v ${done ? "ok" : ""}`}>
            {fmt(secs)} <small>/ {fmt(TARGET_SECS)}</small>
          </b>
        </div>
        <div>
          <span className="ld-k">Accounted for at point A</span>
          <b className="ld-v">
            {counted} <small>/ {EXPECTED}</small>
          </b>
          <div className="ld-bar"><i style={{ width: `${(counted / EXPECTED) * 100}%` }} /></div>
        </div>
      </div>

      <p className="ld-note">
        {done
          ? `Finished ${TARGET_SECS - FINAL_SECS} seconds under target. One finding logged: west stair door clearance.`
          : "Alarm raised in the IT labs. Everyone heads for the clear exits."}
      </p>
    </figure>
  );
}

const CSS = `
.ld{margin:0;padding:16px;background:#fffdf9;border:1px solid #e6dfd3;border-radius:16px;box-shadow:0 20px 40px -28px rgba(40,30,20,.45);color:#2b2724;font-variant-numeric:tabular-nums}
.ld-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:10px;font-size:13px;font-weight:600}
.ld-chip{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:99px;background:#fde8e4;color:#b82f1f;font-size:12px}
.ld-chip.ok{background:#dcf4ea;color:#0c7a5a}
.ld-chip i{width:7px;height:7px;border-radius:50%;background:currentColor;animation:ld-blink 1s ease-in-out infinite}
.ld-chip.ok i{animation:none}
.ld svg{display:block;width:100%;height:auto}
.ld-room{font-size:9px;fill:#6f675d}
.ld-flag{font-size:8px;fill:#9a5b06;font-weight:600}
.ld-ring{transform-box:fill-box;transform-origin:center;animation:ld-ring 1.3s ease-out infinite}
.ld-warn{animation:ld-blink 1.6s ease-in-out infinite}
.ld-stats{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:12px}
.ld-k{display:block;font-size:12px;color:#7a7167}
.ld-v{font-size:22px;font-weight:700;letter-spacing:-.02em}
.ld-v small{font-size:13px;font-weight:500;color:#7a7167}
.ld-v.ok{color:#0c7a5a}
.ld-bar{height:4px;margin-top:6px;border-radius:2px;background:#ece5d9;overflow:hidden}
.ld-bar i{display:block;height:100%;background:#12a37a}
.ld-note{min-height:2.7em;margin:12px 0 0;font-size:13px;line-height:1.35;color:#4b443d}
@keyframes ld-blink{50%{opacity:.35}}
@keyframes ld-ring{from{transform:scale(1);opacity:.9}to{transform:scale(4);opacity:0}}
@media (prefers-reduced-motion:reduce){.ld-chip i,.ld-ring,.ld-warn{animation:none}}
`;
