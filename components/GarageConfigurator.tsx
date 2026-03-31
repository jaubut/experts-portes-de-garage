"use client";

import { useState } from "react";
import { useBookingModal } from "@/context/BookingModalContext";

// ── Data ─────────────────────────────────────────────────────────────────────

const COLOR_OPTIONS = [
  { id: "blanc",   label: "Blanc",               hex: "#F0F0EE", border: "#C8C8C6" },
  { id: "noir",    label: "Noir Protex",          hex: "#1C1C1C", border: "#050505" },
  { id: "chene",   label: "Chêne foncé",          hex: "#4A2F1A", border: "#2A0F00" },
  { id: "minerai", label: "Minerai de fer",       hex: "#4A4A55", border: "#2A2A35" },
  { id: "brun",    label: "Brun commercial",      hex: "#6B3D2A", border: "#4B1D0A" },
  { id: "sablon",  label: "Sablon",               hex: "#CAC0A0", border: "#AAA080" },
  { id: "taupe",   label: "Taupe",                hex: "#8B7D6B", border: "#6B5D4B" },
  { id: "kaki",    label: "Kaki",                 hex: "#9B9470", border: "#7B7450" },
  { id: "charbon", label: "Charbon",              hex: "#4A4A4A", border: "#2A2A2A" },
  { id: "argent",  label: "Argent",               hex: "#A8A8A8", border: "#888888" },
  { id: "custom",  label: "Couleur personnalisée", hex: null,     border: null      },
];

const STYLE_OPTIONS = [
  { id: "traditionnel",  label: "Traditionnel"        },
  { id: "contemporain",  label: "Contemporain"        },
  { id: "carriage",      label: "Carriage House"      },
  { id: "premium",       label: "Premium"             },
  { id: "urbain",        label: "Urbain"              },
  { id: "seigneurie",    label: "Seigneurie Heritage" },
  { id: "vermont",       label: "Vermont"             },
  { id: "new_hampshire", label: "New Hampshire"       },
  { id: "shaker",        label: "Shaker"              },
];

const MATERIAL_OPTIONS = [
  { id: "acier",     label: "Acier",            sub: "Steel"        },
  { id: "aluminium", label: "Aluminium",        sub: "Aluminum"     },
  { id: "vitre",     label: "Entièrement vitré", sub: "Fully Glazed" },
];

const INSULATION_OPTIONS = [
  { id: "r16",  label: "R-16",      sub: '1 3/4"', desc: "Isolation maximale"      },
  { id: "r12",  label: "R-12",      sub: '1 3/8"', desc: "Isolation intermédiaire" },
  { id: "none", label: "Non-isolé", sub: '2"',     desc: "Sans isolation"          },
];

const WINDOW_OPTIONS = [
  { id: "none",      label: "Aucune fenêtre"         },
  { id: "4",         label: "4 fenêtres décoratives" },
  { id: "6",         label: "6 fenêtres décoratives" },
  { id: "8",         label: "8 fenêtres décoratives" },
  { id: "panoramic", label: "Fenêtres panoramiques"  },
  { id: "custom",    label: "Placement personnalisé" },
];

const FINISH_OPTIONS = [
  { id: "quantum", label: "Quantum Lisse", sub: "Smooth"     },
  { id: "veine",   label: "Veiné bois",    sub: "Wood grain" },
];

// ── SVG constants ─────────────────────────────────────────────────────────────

const VW = 500, VH = 240, FW = 14, PGAP = 4, NP = 4;
const DW = VW - 2 * FW;
const DH = VH - 2 * FW;
const PH = (DH - (NP - 1) * PGAP) / NP; // ~50px per panel

// ── SVG helpers ───────────────────────────────────────────────────────────────

function GlassRect({ x, y, w, h, id }: { x: number; y: number; w: number; h: number; id: string }) {
  return (
    <g key={id}>
      <rect x={x} y={y} width={w} height={h} fill="#A8CCE0" fillOpacity="0.55" stroke="#7AAEC8" strokeWidth="1" rx="1" />
      <line x1={x + 3} y1={y + 2} x2={x + 3} y2={y + h - 2} stroke="white" strokeOpacity="0.5" strokeWidth="1.5" />
      <line x1={x + 4} y1={y + 3} x2={x + w - 4} y2={y + 3} stroke="white" strokeOpacity="0.3" strokeWidth="0.8" />
    </g>
  );
}

function WindowRow({ x, y, w, h, windows }: { x: number; y: number; w: number; h: number; windows: string }) {
  const pad = 4;
  const ix = x + pad, iy = y + pad, iw = w - 2 * pad, ih = h - 2 * pad;

  if (windows === "panoramic") return <GlassRect x={ix} y={iy} w={iw} h={ih} id="pan" />;
  if (windows === "custom") {
    const segW = iw / 3;
    return <>{[0, 1, 2].map(i => <GlassRect key={i} id={`cw${i}`} x={ix + i * (segW + 2)} y={iy} w={segW - 2} h={ih} />)}</>;
  }

  const count = windows === "4" ? 4 : windows === "6" ? 6 : windows === "8" ? 8 : 0;
  if (!count) return null;
  const gap = 3;
  const segW = (iw - (count - 1) * gap) / count;
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <GlassRect key={i} id={`w${i}`} x={ix + i * (segW + gap)} y={iy} w={segW} h={ih} />
      ))}
    </>
  );
}

type PanelProps = {
  style: string; material: string;
  px: number; py: number; pw: number; ph: number;
  fill: string; border: string;
  topRow: boolean; windows: string;
};

function DoorPanel({ style, material, px, py, pw, ph, fill, border, topRow, windows }: PanelProps) {
  const ins = 5;
  const ix = px + ins, iy = py + ins, iw = pw - 2 * ins, ih = ph - 2 * ins;
  const showWindows = topRow && windows !== "none";
  const base = <rect x={px} y={py} width={pw} height={ph} fill={fill} stroke={border} strokeWidth="1" strokeOpacity="0.4" />;

  // Helper: render a raised section with full 4-sided bevel + gradient
  function RaisedSection({ x1, y1, x2, y2, k }: { x1: number; y1: number; x2: number; y2: number; k: number }) {
    const w = x2 - x1, h = y2 - y1;
    return (
      <g key={k}>
        <rect x={x1} y={y1} width={w} height={h} fill={fill} stroke={border} strokeWidth="1" strokeOpacity="0.55" />
        <rect x={x1} y={y1} width={w} height={h} fill="url(#bevelGrad)" />
        {/* Highlight: top */}
        <line x1={x1} y1={y1} x2={x2} y2={y1} stroke="white" strokeWidth="1.2" strokeOpacity="0.45" />
        {/* Highlight: left */}
        <line x1={x1} y1={y1} x2={x1} y2={y2} stroke="white" strokeWidth="1.2" strokeOpacity="0.35" />
        {/* Shadow: bottom */}
        <line x1={x1} y1={y2} x2={x2} y2={y2} stroke="black" strokeWidth="1" strokeOpacity="0.22" />
        {/* Shadow: right */}
        <line x1={x2} y1={y1} x2={x2} y2={y2} stroke="black" strokeWidth="1" strokeOpacity="0.18" />
      </g>
    );
  }

  // Fully glazed material overrides all styles
  if (material === "vitre") {
    return (
      <g>
        <rect x={px} y={py} width={pw} height={ph} fill="#A8CCE0" fillOpacity="0.22" stroke="#7AAEC8" strokeWidth="1" />
        <rect x={px + ins} y={py + ins} width={pw - 2 * ins} height={ph - 2 * ins} fill="#A8CCE0" fillOpacity="0.5" stroke="#7AAEC8" strokeWidth="0.75" rx="1" />
        <line x1={px + ins + 3} y1={py + ins + 2} x2={px + ins + 3} y2={py + ph - ins - 2} stroke="white" strokeWidth="2" strokeOpacity="0.5" />
        <line x1={px + ins + 4} y1={py + ins + 3} x2={px + pw - ins - 4} y2={py + ins + 3} stroke="white" strokeWidth="1" strokeOpacity="0.35" />
      </g>
    );
  }

  // Traditionnel — 4-col raised panels with full bevel
  if (style === "traditionnel") {
    const cols = 4, segW = iw / cols;
    return (
      <g>
        {base}
        {showWindows
          ? <WindowRow x={ix} y={iy} w={iw} h={ih} windows={windows} />
          : Array.from({ length: cols }, (_, c) => {
              const sx = ix + c * segW;
              return <RaisedSection key={c} k={c} x1={sx + 3} y1={iy + 3} x2={sx + segW - 3} y2={iy + ih - 3} />;
            })
        }
      </g>
    );
  }

  // Vermont — 3-col raised panels with full bevel
  if (style === "vermont") {
    const cols = 3, segW = iw / cols;
    return (
      <g>
        {base}
        {showWindows
          ? <WindowRow x={ix} y={iy} w={iw} h={ih} windows={windows} />
          : Array.from({ length: cols }, (_, c) => {
              const sx = ix + c * segW;
              return <RaisedSection key={c} k={c} x1={sx + 4} y1={iy + 4} x2={sx + segW - 4} y2={iy + ih - 4} />;
            })
        }
      </g>
    );
  }

  // Premium — 2-col wide panels with double-inset and overhead lighting
  if (style === "premium") {
    const cols = 2, segW = iw / cols;
    return (
      <g>
        {base}
        {showWindows
          ? <WindowRow x={ix} y={iy} w={iw} h={ih} windows={windows} />
          : Array.from({ length: cols }, (_, c) => {
              const sx = ix + c * segW;
              // Inner panel coords
              const px1 = sx + 8, py1 = iy + 8, pw = segW - 16, ph2 = ih - 16;
              return (
                <g key={c}>
                  {/* Outer groove */}
                  <rect x={sx + 4} y={iy + 4} width={segW - 8} height={ih - 8}
                    fill="none" stroke={border} strokeWidth="0.8" strokeOpacity="0.35" />
                  {/* Inner raised panel */}
                  <rect x={px1} y={py1} width={pw} height={ph2}
                    fill={fill} stroke={border} strokeWidth="0.6" strokeOpacity="0.5"
                    filter="url(#premiumShadow)" />
                  <rect x={px1} y={py1} width={pw} height={ph2}
                    fill="url(#premiumPanelGrad)" />
                  {/* Highlight top */}
                  <line x1={px1} y1={py1} x2={px1 + pw} y2={py1}
                    stroke="white" strokeWidth="1.2" strokeOpacity="0.45" />
                  {/* Highlight left */}
                  <line x1={px1} y1={py1} x2={px1} y2={py1 + ph2}
                    stroke="white" strokeWidth="1.2" strokeOpacity="0.35" />
                  {/* Shadow bottom */}
                  <line x1={px1} y1={py1 + ph2} x2={px1 + pw} y2={py1 + ph2}
                    stroke="black" strokeWidth="1" strokeOpacity="0.20" />
                  {/* Shadow right */}
                  <line x1={px1 + pw} y1={py1} x2={px1 + pw} y2={py1 + ph2}
                    stroke="black" strokeWidth="1" strokeOpacity="0.16" />
                </g>
              );
            })
        }
      </g>
    );
  }

  // New Hampshire — 2-col double-inset with bevel on inner rect
  if (style === "new_hampshire") {
    const cols = 2, segW = iw / cols;
    return (
      <g>
        {base}
        {showWindows
          ? <WindowRow x={ix} y={iy} w={iw} h={ih} windows={windows} />
          : Array.from({ length: cols }, (_, c) => {
              const sx = ix + c * segW;
              return (
                <g key={c}>
                  {/* Outer frame */}
                  <rect x={sx + 3} y={iy + 3} width={segW - 6} height={ih - 6} fill="none" stroke={border} strokeWidth="1" strokeOpacity="0.4" />
                  {/* Inner raised panel */}
                  <RaisedSection k={c} x1={sx + 7} y1={iy + 7} x2={sx + segW - 7} y2={iy + ih - 7} />
                </g>
              );
            })
        }
      </g>
    );
  }

  // Urbain — flat, horizontal groove lines for steel texture
  if (style === "urbain") {
    return (
      <g>
        {base}
        <rect x={px} y={py} width={pw} height={ph} fill="url(#bevelGrad)" fillOpacity="0.5" />
        <line x1={px + 2} y1={py + 2} x2={px + pw - 2} y2={py + 2} stroke="white" strokeWidth="1" strokeOpacity="0.3" />
        {[0.33, 0.66].map((t, i) => (
          <line key={i} x1={px + 1} y1={py + ph * t} x2={px + pw - 1} y2={py + ph * t}
            stroke={border} strokeWidth="0.8" strokeOpacity="0.25" />
        ))}
        {showWindows && <WindowRow x={ix} y={iy} w={iw} h={ih} windows={windows} />}
      </g>
    );
  }

  // Shaker — flat with bold inner frame and bevel on frame edges
  if (style === "shaker") {
    const fi = 7; // frame inset
    return (
      <g>
        {base}
        <rect x={px} y={py} width={pw} height={ph} fill="url(#bevelGrad)" fillOpacity="0.4" />
        {showWindows
          ? <WindowRow x={ix} y={iy} w={iw} h={ih} windows={windows} />
          : (
            <>
              <rect x={px + fi} y={py + fi} width={pw - fi * 2} height={ph - fi * 2} fill="none" stroke={border} strokeWidth="2" strokeOpacity="0.55" />
              <line x1={px + fi} y1={py + fi} x2={px + pw - fi} y2={py + fi} stroke="white" strokeWidth="1.2" strokeOpacity="0.4" />
              <line x1={px + fi} y1={py + fi} x2={px + fi} y2={py + ph - fi} stroke="white" strokeWidth="1.2" strokeOpacity="0.3" />
              <line x1={px + fi} y1={py + ph - fi} x2={px + pw - fi} y2={py + ph - fi} stroke="black" strokeWidth="1" strokeOpacity="0.2" />
              <line x1={px + pw - fi} y1={py + fi} x2={px + pw - fi} y2={py + ph - fi} stroke="black" strokeWidth="1" strokeOpacity="0.16" />
            </>
          )
        }
      </g>
    );
  }

  // Contemporain — corrugated ribs with gradient depth
  if (style === "contemporain") {
    const ribs = 4, ribH = ph / ribs;
    return (
      <g>
        {Array.from({ length: ribs }, (_, r) => {
          const ry = py + r * ribH;
          return (
            <g key={r}>
              <rect x={px} y={ry} width={pw} height={ribH} fill={fill} stroke={border} strokeWidth="0.8" strokeOpacity="0.35" />
              <rect x={px} y={ry} width={pw} height={ribH} fill="url(#ribGrad)" />
            </g>
          );
        })}
        {showWindows && <WindowRow x={ix} y={iy} w={iw} h={ih} windows={windows} />}
      </g>
    );
  }

  // Carriage House — 2-col with thick X cross + arch hint
  if (style === "carriage") {
    const cols = 2, segW = iw / cols;
    return (
      <g>
        {base}
        <rect x={px} y={py} width={pw} height={ph} fill="url(#bevelGrad)" fillOpacity="0.35" />
        {showWindows
          ? <WindowRow x={ix} y={iy} w={iw} h={ih} windows={windows} />
          : Array.from({ length: cols }, (_, c) => {
              const sx = ix + c * segW;
              const x1 = sx + 4, y1 = iy + 4, x2 = sx + segW - 4, y2 = iy + ih - 4;
              const cx = (x1 + x2) / 2;
              return (
                <g key={c}>
                  <rect x={x1} y={y1} width={x2 - x1} height={y2 - y1} fill="none" stroke={border} strokeWidth="1.2" strokeOpacity="0.55" />
                  {/* X cross */}
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={border} strokeWidth="1.5" strokeOpacity="0.5" />
                  <line x1={x2} y1={y1} x2={x1} y2={y2} stroke={border} strokeWidth="1.5" strokeOpacity="0.5" />
                  {/* Arch hint at top */}
                  <path d={`M${x1},${y1 + 8} Q${cx},${y1 - 4} ${x2},${y1 + 8}`} stroke={border} strokeWidth="1" strokeOpacity="0.45" fill="none" />
                </g>
              );
            })
        }
      </g>
    );
  }

  // Seigneurie Heritage — 2x2 grid with thick cross in each cell
  if (style === "seigneurie") {
    const cols = 2, rows = 2;
    const segW = iw / cols, segH = ih / rows;
    return (
      <g>
        {base}
        <rect x={px} y={py} width={pw} height={ph} fill="url(#bevelGrad)" fillOpacity="0.35" />
        {showWindows
          ? <WindowRow x={ix} y={iy} w={iw} h={ih} windows={windows} />
          : Array.from({ length: cols * rows }, (_, i) => {
              const c = i % cols, r = Math.floor(i / cols);
              const sx = ix + c * segW, sy = iy + r * segH;
              const x1 = sx + 4, y1 = sy + 3, x2 = sx + segW - 4, y2 = sy + segH - 3;
              return (
                <g key={i}>
                  <rect x={x1} y={y1} width={x2 - x1} height={y2 - y1} fill="none" stroke={border} strokeWidth="1" strokeOpacity="0.55" />
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={border} strokeWidth="1.2" strokeOpacity="0.45" />
                  <line x1={x2} y1={y1} x2={x1} y2={y2} stroke={border} strokeWidth="1.2" strokeOpacity="0.45" />
                </g>
              );
            })
        }
      </g>
    );
  }

  return <>{base}</>;
}

function DoorVisualizer({ style, material, fill, border, windows, finish }: {
  style: string; material: string; fill: string; border: string; windows: string; finish: string;
}) {
  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full h-full" style={{ maxHeight: 320 }}>
      <defs>
        {/* Diagonal bevel gradient — top-left light, bottom-right dark */}
        <linearGradient id="bevelGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="white" stopOpacity="0.18" />
          <stop offset="40%"  stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="black" stopOpacity="0.14" />
        </linearGradient>
        {/* Rib gradient — light top, dark bottom (corrugation cross-section) */}
        <linearGradient id="ribGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="white" stopOpacity="0.22" />
          <stop offset="35%"  stopColor="white" stopOpacity="0.04" />
          <stop offset="70%"  stopColor="black" stopOpacity="0.10" />
          <stop offset="100%" stopColor="black" stopOpacity="0.02" />
        </linearGradient>
        {/* Wood grain pattern */}
        {finish === "veine" && (
          <pattern id="woodgrain" x="0" y="0" width="80" height="20" patternUnits="userSpaceOnUse">
            <path d="M0,4 Q40,5.5 80,3.5"   stroke="rgba(0,0,0,0.18)" strokeWidth="1.5" fill="none" />
            <path d="M0,9 Q40,7.5 80,10.5"  stroke="rgba(0,0,0,0.13)" strokeWidth="1"   fill="none" />
            <path d="M0,14 Q40,15.5 80,13"  stroke="rgba(0,0,0,0.16)" strokeWidth="1.8" fill="none" />
            <path d="M0,18 Q40,17 80,19.5"  stroke="rgba(0,0,0,0.09)" strokeWidth="0.7" fill="none" />
            <path d="M0,2 Q40,3 80,1.5"     stroke="rgba(0,0,0,0.07)" strokeWidth="0.5" fill="none" />
            <path d="M0,11.5 Q40,12.5 80,10" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5" fill="none" />
            <path d="M0,6 Q40,7 80,5.5"     stroke="rgba(255,255,255,0.09)" strokeWidth="0.8" fill="none" />
          </pattern>
        )}
        {/* Premium: vertical overhead-lighting gradient */}
        <linearGradient id="premiumPanelGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="white" stopOpacity="0.14" />
          <stop offset="25%"  stopColor="white" stopOpacity="0.04" />
          <stop offset="75%"  stopColor="black" stopOpacity="0.03" />
          <stop offset="100%" stopColor="black" stopOpacity="0.11" />
        </linearGradient>
        <filter id="premiumShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.12" />
        </filter>
        <filter id="doorshadow" x="-5%" y="-5%" width="110%" height="115%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* Garage wall */}
      <rect x="0" y="0" width={VW} height={VH} fill="#D2CFC8" />
      <rect x="0" y="0" width={FW + 4} height={VH} fill="#C0BBB2" />
      <rect x={VW - FW - 4} y="0" width={FW + 4} height={VH} fill="#C0BBB2" />
      <rect x="0" y="0" width={VW} height={FW + 2} fill="#C0BBB2" />

      {/* Door frame / tracks */}
      <rect x={FW - 4} y={FW - 4} width={DW + 8} height={DH + 8} fill="#787878" rx="1" />
      <rect x={FW - 2} y={FW - 2} width={DW + 4} height={DH + 4} fill="#606060" />

      {/* Door surface */}
      <rect x={FW} y={FW} width={DW} height={DH} fill={fill} filter="url(#doorshadow)" />

      {/* Wood grain overlay */}
      {finish === "veine" && (
        <rect x={FW} y={FW} width={DW} height={DH} fill="url(#woodgrain)" />
      )}

      {/* Panels */}
      {Array.from({ length: NP }, (_, i) => {
        const py = FW + i * (PH + PGAP);
        return (
          <DoorPanel
            key={i}
            style={style}
            material={material}
            px={FW} py={py} pw={DW} ph={PH}
            fill={fill} border={border}
            topRow={i === 0}
            windows={windows}
          />
        );
      })}

      {/* Outer border */}
      <rect x={FW} y={FW} width={DW} height={DH} fill="none" stroke={border} strokeWidth="1.5" />

      {/* Corner bolts */}
      {([[FW / 2, FW / 2], [VW - FW / 2, FW / 2], [FW / 2, VH - FW / 2], [VW - FW / 2, VH - FW / 2]] as [number, number][]).map(([bx, by], i) => (
        <circle key={i} cx={bx} cy={by} r="2.5" fill="#555" stroke="#444" strokeWidth="0.5" />
      ))}
    </svg>
  );
}

// ── UI helpers ────────────────────────────────────────────────────────────────

function SectionCard({ title, badge, children }: {
  title: string; badge?: "required" | "optional"; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-heading text-sm uppercase text-gray-800 tracking-wide">{title}</h3>
        {badge === "required" && (
          <span className="text-[9px] font-bold bg-brand text-white px-1.5 py-0.5 rounded uppercase tracking-wide">Requis</span>
        )}
        {badge === "optional" && (
          <span className="text-[9px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded uppercase tracking-wide">Optionnel</span>
        )}
      </div>
      {children}
    </div>
  );
}

function Pill({ label, sub, selected, onClick }: {
  label: string; sub?: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left px-3 py-2.5 rounded-xl border-2 text-sm transition-all ${
        selected
          ? "border-brand bg-brand/5 text-brand font-semibold"
          : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
      }`}
    >
      {label}
      {sub && <span className="block text-xs text-gray-400 font-normal mt-0.5">{sub}</span>}
    </button>
  );
}

function ConfigChip({ label, colorHex }: { label: string; colorHex?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full border border-gray-200">
      {colorHex && (
        <span
          className="w-2.5 h-2.5 rounded-full inline-block shrink-0 border border-white ring-1 ring-gray-300"
          style={{ backgroundColor: colorHex }}
        />
      )}
      {label}
    </span>
  );
}

// ── Quote Modal ───────────────────────────────────────────────────────────────

interface QuoteConfig { style: string; material: string; color: string; insulation: string; windows: string; finish: string; }

function QuoteModal({ onClose, config }: { onClose: () => void; config: QuoteConfig }) {
  const [form, setForm] = useState({ nom: "", telephone: "", courriel: "", notes: "" });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [submitted, setSubmitted] = useState(false);

  const upd = (k: keyof typeof form, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: "" }));
  };

  const submit = () => {
    const errs: Partial<typeof form> = {};
    if (!form.nom.trim()) errs.nom = "Requis";
    if (!form.telephone.trim()) errs.telephone = "Requis";
    if (!form.courriel.trim()) errs.courriel = "Requis";
    else if (!/\S+@\S+\.\S+/.test(form.courriel)) errs.courriel = "Courriel invalide";
    setErrors(errs);
    if (!Object.keys(errs).length) setSubmitted(true);
  };

  const inp = (err: boolean) =>
    `w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors ${
      err ? "border-red-400 focus:ring-red-200" : "border-gray-200 focus:ring-brand/20 focus:border-brand"
    }`;

  const rows = [
    ["Style",    STYLE_OPTIONS.find(s => s.id === config.style)?.label ?? config.style],
    ["Matériau", MATERIAL_OPTIONS.find(m => m.id === config.material)?.label ?? config.material],
    ["Couleur",  config.color],
    ["Isolation", INSULATION_OPTIONS.find(i => i.id === config.insulation)?.label ?? config.insulation],
    ["Fenêtres", WINDOW_OPTIONS.find(w => w.id === config.windows)?.label ?? config.windows],
    ["Fini",     FINISH_OPTIONS.find(f => f.id === config.finish)?.label ?? config.finish],
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-brand px-6 py-4 flex items-center justify-between">
          <span className="font-heading text-white text-lg uppercase">Obtenir une soumission</span>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-heading text-xl text-brand uppercase mb-2">Demande envoyée!</h3>
              <p className="text-gray-500 text-sm mb-6">Nous vous contacterons rapidement avec votre soumission personnalisée.</p>
              <button onClick={onClose} className="bg-brand text-white font-bold px-8 py-3 rounded-lg hover:bg-brand-dark transition-colors">
                Fermer
              </button>
            </div>
          ) : (
            <>
              <div className="bg-gray-50 rounded-xl p-4 mb-5 border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Votre configuration</p>
                <div className="flex flex-col gap-1.5 text-xs">
                  {rows.map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4">
                      <span className="text-gray-400 shrink-0">{k}</span>
                      <span className="font-medium text-gray-700 text-right">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {[
                  { key: "nom",       label: "Prénom et Nom",  type: "text",  placeholder: "Jean Tremblay"         },
                  { key: "telephone", label: "Téléphone",      type: "tel",   placeholder: "450-558-5788"           },
                  { key: "courriel",  label: "Courriel",       type: "email", placeholder: "jean@exemple.com"       },
                ].map(({ key, label, type, placeholder }) => (
                  <div key={key}>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
                    <input
                      type={type}
                      value={form[key as keyof typeof form]}
                      onChange={e => upd(key as keyof typeof form, e.target.value)}
                      placeholder={placeholder}
                      className={inp(!!errors[key as keyof typeof errors])}
                    />
                    {errors[key as keyof typeof errors] && (
                      <p className="text-xs text-red-500 mt-1">{errors[key as keyof typeof errors]}</p>
                    )}
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Notes additionnelles <span className="font-normal text-gray-400">(optionnel)</span>
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={e => upd("notes", e.target.value)}
                    placeholder="Mesures, contraintes particulières, questions..."
                    rows={3}
                    className={inp(false) + " resize-none"}
                  />
                </div>
              </div>

              <button
                onClick={submit}
                className="w-full mt-5 bg-brand text-white font-bold py-3.5 rounded-xl hover:bg-brand-dark transition-colors shadow-sm"
              >
                Envoyer ma demande
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function GarageConfigurator() {
  const { openModal } = useBookingModal();
  const [style, setStyle] = useState("traditionnel");
  const [material, setMaterial] = useState("acier");
  const [color, setColor] = useState("blanc");
  const [customColor, setCustomColor] = useState("#888888");
  const [insulation, setInsulation] = useState("r16");
  const [windows, setWindows] = useState("none");
  const [finish, setFinish] = useState("quantum");
  const [showQuote, setShowQuote] = useState(false);

  const selectedColor = COLOR_OPTIONS.find(c => c.id === color);
  const fill = color === "custom" ? customColor : (selectedColor?.hex ?? "#F0F0EE");
  const border = color === "custom" ? "#666666" : (selectedColor?.border ?? "#C8C8C6");
  const colorLabel = color === "custom" ? customColor.toUpperCase() : (selectedColor?.label ?? "");
  const styleLabel = STYLE_OPTIONS.find(s => s.id === style)?.label ?? "";
  const materialLabel = MATERIAL_OPTIONS.find(m => m.id === material)?.label ?? "";
  const insulLabel = INSULATION_OPTIONS.find(i => i.id === insulation)?.label ?? "";
  const winLabel = WINDOW_OPTIONS.find(w => w.id === windows)?.label ?? "";
  const finLabel = FINISH_OPTIONS.find(f => f.id === finish)?.label ?? "";

  const ctaButtons = (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <button
        onClick={openModal}
        className="bg-brand text-white font-bold px-6 py-4 rounded-xl hover:bg-brand-dark transition-colors text-sm shadow-sm"
      >
        Planifier une consultation
      </button>
      <button
        onClick={() => setShowQuote(true)}
        className="border-2 border-brand text-brand font-bold px-6 py-4 rounded-xl hover:bg-brand hover:text-white transition-colors text-sm"
      >
        Obtenir une soumission
      </button>
    </div>
  );

  return (
    <>
      <div className="bg-gray-50 min-h-screen">
        {/* Page header */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-10">
            <p className="text-brand text-xs font-bold uppercase tracking-widest mb-2">Outil de conception</p>
            <h1 className="font-heading text-3xl md:text-4xl text-[#1a1a1a] uppercase mb-2">
              Configurez votre porte Garex
            </h1>
            <p className="text-gray-500 text-sm md:text-base max-w-xl">
              Personnalisez chaque détail et visualisez votre porte en temps réel. Un de nos experts vous contactera pour confirmer les détails et vous fournir une soumission.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* ── Left: Preview ── */}
            <div className="w-full lg:w-3/5 lg:sticky lg:top-24">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gray-100 p-4 sm:p-8 flex items-center justify-center">
                  <DoorVisualizer style={style} material={material} fill={fill} border={border} windows={windows} finish={finish} />
                </div>
                <div className="p-4 border-t border-gray-100 flex flex-wrap gap-2">
                  <ConfigChip label={styleLabel} />
                  <ConfigChip label={materialLabel} />
                  <ConfigChip label={colorLabel} colorHex={fill} />
                  <ConfigChip label={insulLabel} />
                  {windows !== "none" && <ConfigChip label={winLabel} />}
                  <ConfigChip label={finLabel} />
                </div>
              </div>
              <div className="mt-4 hidden lg:block">{ctaButtons}</div>
            </div>

            {/* ── Right: Options ── */}
            <div className="w-full lg:w-2/5 flex flex-col gap-4">

              {/* 1. Style */}
              <SectionCard title="Style de porte" badge="required">
                <div className="grid grid-cols-2 gap-2">
                  {STYLE_OPTIONS.map(s => (
                    <Pill key={s.id} label={s.label} selected={style === s.id} onClick={() => setStyle(s.id)} />
                  ))}
                </div>
              </SectionCard>

              {/* 2. Material */}
              <SectionCard title="Matériau" badge="required">
                <div className="grid grid-cols-3 gap-2">
                  {MATERIAL_OPTIONS.map(m => (
                    <Pill key={m.id} label={m.label} sub={m.sub} selected={material === m.id} onClick={() => setMaterial(m.id)} />
                  ))}
                </div>
              </SectionCard>

              {/* 2. Color */}
              <SectionCard title="Couleur" badge="required">
                <div className="flex flex-wrap gap-3">
                  {COLOR_OPTIONS.map(c => (
                    <button key={c.id} onClick={() => setColor(c.id)} title={c.label} className="flex flex-col items-center gap-1.5 group">
                      {c.id === "custom" ? (
                        <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center bg-white transition-all ${color === c.id ? "border-brand ring-2 ring-brand/30 scale-110" : "border-dashed border-gray-400 group-hover:border-gray-500"}`}>
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                      ) : (
                        <div
                          className={`w-9 h-9 rounded-full border-2 transition-all ${color === c.id ? "border-brand ring-2 ring-brand/30 scale-110" : "border-gray-300 group-hover:border-gray-400"}`}
                          style={{ backgroundColor: c.hex! }}
                        />
                      )}
                      <span className="text-[10px] text-gray-500 text-center leading-tight max-w-[44px]">{c.label}</span>
                    </button>
                  ))}
                </div>
                {color === "custom" && (
                  <div className="mt-4 flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <input
                      type="color"
                      value={customColor}
                      onChange={e => setCustomColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Couleur personnalisée</p>
                      <p className="text-xs text-gray-400">{customColor.toUpperCase()}</p>
                    </div>
                  </div>
                )}
              </SectionCard>

              {/* 3. Insulation */}
              <SectionCard title="Épaisseur / Isolation" badge="required">
                <div className="flex flex-col gap-2">
                  {INSULATION_OPTIONS.map(ins => (
                    <button
                      key={ins.id}
                      onClick={() => setInsulation(ins.id)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 text-left transition-all ${
                        insulation === ins.id
                          ? "border-brand bg-brand/5"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm ${insulation === ins.id ? "text-brand" : "text-gray-800"}`}>{ins.label}</span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-medium">{ins.sub}</span>
                      </div>
                      <span className="text-xs text-gray-400">{ins.desc}</span>
                    </button>
                  ))}
                </div>
              </SectionCard>

              {/* 4. Windows */}
              <SectionCard title="Fenêtres / Vitres" badge="optional">
                <div className="grid grid-cols-1 gap-2">
                  {WINDOW_OPTIONS.map(w => (
                    <Pill key={w.id} label={w.label} selected={windows === w.id} onClick={() => setWindows(w.id)} />
                  ))}
                </div>
              </SectionCard>

              {/* 5. Finish */}
              <SectionCard title="Fini de surface" badge="optional">
                <div className="grid grid-cols-2 gap-2">
                  {FINISH_OPTIONS.map(f => (
                    <Pill key={f.id} label={f.label} sub={f.sub} selected={finish === f.id} onClick={() => setFinish(f.id)} />
                  ))}
                </div>
              </SectionCard>

              {/* Mobile CTA */}
              <div className="lg:hidden mt-2">{ctaButtons}</div>
            </div>
          </div>
        </div>
      </div>

      {showQuote && (
        <QuoteModal
          onClose={() => setShowQuote(false)}
          config={{ style, material, color: colorLabel, insulation, windows, finish }}
        />
      )}
    </>
  );
}
