"use client";

import { useState } from "react";
import { useBookingModal } from "@/context/BookingModalContext";

// ── Data ─────────────────────────────────────────────────────────────────────

const COLOR_OPTIONS = [
  { id: "blanc",   label: "Blanc",               hex: "#F0F0EE", border: "#C8C8C6" },
  { id: "kaki",    label: "Kaki",                hex: "#9B9470", border: "#7B7450" },
  { id: "brun",    label: "Brun commercial",      hex: "#6B3D2A", border: "#4B1D0A" },
  { id: "sablon",  label: "Sablon",               hex: "#CAC0A0", border: "#AAA080" },
  { id: "chene",   label: "Chêne foncé",          hex: "#4A2F1A", border: "#2A0F00" },
  { id: "charbon", label: "Charbon",              hex: "#4A4A4A", border: "#2A2A2A" },
  { id: "argent",  label: "Argent",               hex: "#A8A8A8", border: "#888888" },
  { id: "noir",    label: "Noir",                 hex: "#1C1C1C", border: "#050505" },
  { id: "minerai", label: "Minerai de fer",       hex: "#4A4A55", border: "#2A2A35" },
  { id: "custom",  label: "Personnalisée",        hex: null,      border: null      },
];

type StyleOption = { id: string; label: string; collection: string; sub: string };

const STYLE_OPTIONS: StyleOption[] = [
  // Moderne
  { id: "quantum",      label: "Quantum",          collection: "Moderne",      sub: "Lisse et épuré"       },
  { id: "grain_bois",   label: "Grain de Bois",    collection: "Moderne",      sub: "Texture boisée"       },
  { id: "urbaine",      label: "Urbaine",           collection: "Moderne",      sub: "Épurée"               },
  { id: "urbaine_mr",   label: "Urbaine MR",        collection: "Moderne",      sub: "Multi-rainures"       },
  { id: "rainuree",     label: "Rainurée",          collection: "Moderne",      sub: "Rainures définies"    },
  { id: "multi_groove", label: "Multi-Groove",      collection: "Moderne",      sub: "Lignes parallèles"    },
  { id: "shaker",       label: "Shaker",            collection: "Moderne",      sub: "Cadre encastré"       },
  { id: "shaker_xl",    label: "Shaker XL",         collection: "Moderne",      sub: "Grand format"         },
  // Traditionnel
  { id: "classique",    label: "Classique",         collection: "Traditionnel", sub: "Panneaux relevés"     },
  { id: "premium",      label: "Premium",           collection: "Traditionnel", sub: "Double incrustés"     },
  { id: "premium_mx",   label: "Premium MX",        collection: "Traditionnel", sub: "3 panneaux"           },
  { id: "premium_xl",   label: "Premium XL",        collection: "Traditionnel", sub: "Grand panneau"        },
  { id: "seigneurie",   label: "Seigneurie",        collection: "Traditionnel", sub: "Moulures décoratives" },
  // Champêtre
  { id: "vermont",      label: "Vermont",           collection: "Champêtre",    sub: "Planche & latte"      },
  { id: "new_hampshire",label: "New Hampshire",     collection: "Champêtre",    sub: "Wainscot classique"   },
  { id: "new_hamp_xl",  label: "New Hampshire XL",  collection: "Champêtre",    sub: "Lignes verticales"    },
  // Recouvrement
  { id: "port_royal",   label: "Port Royal",        collection: "Recouvrement", sub: "Moulure rectangulaire"},
  { id: "villeray",     label: "Villeray",          collection: "Recouvrement", sub: "Sections uniformes"   },
  { id: "mitis",        label: "Mitis",             collection: "Recouvrement", sub: "Diagonal V-grain"     },
  { id: "lotbiniere",   label: "Lotbinière",        collection: "Recouvrement", sub: "Diagonal croisé"      },
];

const COLLECTIONS = ["Moderne", "Traditionnel", "Champêtre", "Recouvrement"] as const;

const MATERIAL_OPTIONS = [
  { id: "acier",     label: "Acier",             sub: "Steel"      },
  { id: "aluminium", label: "Aluminium",         sub: "Aluminum"   },
  { id: "vitre",     label: "Entièrement vitré", sub: "Full View"  },
];

const INSULATION_OPTIONS = [
  { id: "r16",  label: "R-16",      sub: '1¾"', desc: "Isolation maximale"      },
  { id: "r12",  label: "R-12",      sub: '1⅜"', desc: "Isolation intermédiaire" },
  { id: "none", label: "Non-isolé", sub: "—",   desc: "Sans isolation"          },
];

const WINDOW_OPTIONS = [
  { id: "none",      label: "Aucune fenêtre"         },
  { id: "4",         label: "4 fenêtres décoratives" },
  { id: "6",         label: "6 fenêtres décoratives" },
  { id: "panoramic", label: "Fenêtres panoramiques"  },
  { id: "custom",    label: "Placement personnalisé" },
];

const FINISH_OPTIONS = [
  { id: "lisse", label: "Lisse",      sub: "Smooth"     },
  { id: "veine", label: "Veiné bois", sub: "Wood grain" },
];

// ── Size data ─────────────────────────────────────────────────────────────────

const SINGLE_WIDTHS = [6, 7, 8, 9, 10];
const DOUBLE_WIDTHS = [11, 12, 13, 14, 15, 16];
const HEIGHTS = [7, 8];
const NP = 4; // always 4 panel rows (standard residential)
const FW = 14, PGAP = 4;

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
  const count = windows === "4" ? 4 : windows === "6" ? 6 : 0;
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
  showWindows: boolean; windows: string;
};

function DoorPanel({ style, material, px, py, pw, ph, fill, border, showWindows, windows }: PanelProps) {
  const ins = 5;
  const ix = px + ins, iy = py + ins, iw = pw - 2 * ins, ih = ph - 2 * ins;
  const base = <rect x={px} y={py} width={pw} height={ph} fill={fill} stroke={border} strokeWidth="1" strokeOpacity="0.4" />;

  function RaisedSection({ x1, y1, x2, y2, k }: { x1: number; y1: number; x2: number; y2: number; k: number }) {
    const w = x2 - x1, h = y2 - y1;
    return (
      <g key={k}>
        <rect x={x1} y={y1} width={w} height={h} fill={fill} stroke={border} strokeWidth="1" strokeOpacity="0.55" />
        <rect x={x1} y={y1} width={w} height={h} fill="url(#bevelGrad)" />
        <line x1={x1} y1={y1} x2={x2} y2={y1} stroke="white" strokeWidth="1.2" strokeOpacity="0.45" />
        <line x1={x1} y1={y1} x2={x1} y2={y2} stroke="white" strokeWidth="1.2" strokeOpacity="0.35" />
        <line x1={x1} y1={y2} x2={x2} y2={y2} stroke="black" strokeWidth="1" strokeOpacity="0.22" />
        <line x1={x2} y1={y1} x2={x2} y2={y2} stroke="black" strokeWidth="1" strokeOpacity="0.18" />
      </g>
    );
  }

  // Fully glazed overrides all styles
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

  // ── MODERNE ──────────────────────────────────────────────────────────────────

  // Quantum — completely flat, very subtle gradient only
  if (style === "quantum") {
    return (
      <g>
        {base}
        <rect x={px} y={py} width={pw} height={ph} fill="url(#bevelGrad)" fillOpacity="0.22" />
        <line x1={px + 2} y1={py + 2} x2={px + pw - 2} y2={py + 2} stroke="white" strokeWidth="0.8" strokeOpacity="0.18" />
        {showWindows && <WindowRow x={ix} y={iy} w={iw} h={ih} windows={windows} />}
      </g>
    );
  }

  // Grain de Bois — flat (woodgrain applied via finish overlay)
  if (style === "grain_bois") {
    return (
      <g>
        {base}
        <rect x={px} y={py} width={pw} height={ph} fill="url(#bevelGrad)" fillOpacity="0.22" />
        <line x1={px + 2} y1={py + 2} x2={px + pw - 2} y2={py + 2} stroke="white" strokeWidth="0.8" strokeOpacity="0.18" />
        {showWindows && <WindowRow x={ix} y={iy} w={iw} h={ih} windows={windows} />}
      </g>
    );
  }

  // Urbaine — flat with 2 subtle horizontal groove lines
  if (style === "urbaine") {
    return (
      <g>
        {base}
        <rect x={px} y={py} width={pw} height={ph} fill="url(#bevelGrad)" fillOpacity="0.38" />
        <line x1={px + 2} y1={py + 2} x2={px + pw - 2} y2={py + 2} stroke="white" strokeWidth="1" strokeOpacity="0.22" />
        {[0.35, 0.68].map((t, i) => (
          <g key={i}>
            <line x1={px + 1} y1={py + ph * t} x2={px + pw - 1} y2={py + ph * t} stroke={border} strokeWidth="1" strokeOpacity="0.28" />
            <line x1={px + 1} y1={py + ph * t + 1} x2={px + pw - 1} y2={py + ph * t + 1} stroke="white" strokeWidth="0.5" strokeOpacity="0.15" />
          </g>
        ))}
        {showWindows && <WindowRow x={ix} y={iy} w={iw} h={ih} windows={windows} />}
      </g>
    );
  }

  // Urbaine MR — 5 tight parallel horizontal grooves
  if (style === "urbaine_mr") {
    return (
      <g>
        {base}
        <rect x={px} y={py} width={pw} height={ph} fill="url(#bevelGrad)" fillOpacity="0.32" />
        {[1, 2, 3, 4, 5].map(n => {
          const ly = py + ph * (n / 6);
          return (
            <g key={n}>
              <line x1={px + 1} y1={ly} x2={px + pw - 1} y2={ly} stroke={border} strokeWidth="0.9" strokeOpacity="0.27" />
              <line x1={px + 1} y1={ly + 0.9} x2={px + pw - 1} y2={ly + 0.9} stroke="white" strokeWidth="0.4" strokeOpacity="0.13" />
            </g>
          );
        })}
        {showWindows && <WindowRow x={ix} y={iy} w={iw} h={ih} windows={windows} />}
      </g>
    );
  }

  // Rainurée — 3 defined grooves with clear shadow depth
  if (style === "rainuree") {
    return (
      <g>
        {base}
        <rect x={px} y={py} width={pw} height={ph} fill="url(#ribGrad)" fillOpacity="0.45" />
        {[0.28, 0.54, 0.78].map((t, i) => {
          const ly = py + ph * t;
          return (
            <g key={i}>
              <line x1={px + 2} y1={ly - 0.8} x2={px + pw - 2} y2={ly - 0.8} stroke="white" strokeWidth="0.8" strokeOpacity="0.25" />
              <line x1={px + 2} y1={ly} x2={px + pw - 2} y2={ly} stroke={border} strokeWidth="2" strokeOpacity="0.42" />
              <line x1={px + 2} y1={ly + 2} x2={px + pw - 2} y2={ly + 2} stroke="white" strokeWidth="0.5" strokeOpacity="0.16" />
            </g>
          );
        })}
        {showWindows && <WindowRow x={ix} y={iy} w={iw} h={ih} windows={windows} />}
      </g>
    );
  }

  // Multi-Groove — 8 fine parallel horizontal lines
  if (style === "multi_groove") {
    return (
      <g>
        {base}
        <rect x={px} y={py} width={pw} height={ph} fill="url(#ribGrad)" fillOpacity="0.38" />
        {Array.from({ length: 8 }, (_, i) => {
          const ly = py + ph * ((i + 1) / 9);
          return (
            <g key={i}>
              <line x1={px + 1} y1={ly} x2={px + pw - 1} y2={ly} stroke={border} strokeWidth="0.7" strokeOpacity="0.22" />
              <line x1={px + 1} y1={ly + 0.7} x2={px + pw - 1} y2={ly + 0.7} stroke="white" strokeWidth="0.3" strokeOpacity="0.1" />
            </g>
          );
        })}
        {showWindows && <WindowRow x={ix} y={iy} w={iw} h={ih} windows={windows} />}
      </g>
    );
  }

  // Shaker — flat with single recessed frame
  if (style === "shaker") {
    const fi = 7;
    return (
      <g>
        {base}
        <rect x={px} y={py} width={pw} height={ph} fill="url(#bevelGrad)" fillOpacity="0.38" />
        {showWindows
          ? <WindowRow x={ix} y={iy} w={iw} h={ih} windows={windows} />
          : (
            <>
              <rect x={px + fi} y={py + fi} width={pw - fi * 2} height={ph - fi * 2} fill="none" stroke={border} strokeWidth="2" strokeOpacity="0.52" />
              <line x1={px + fi} y1={py + fi} x2={px + pw - fi} y2={py + fi} stroke="white" strokeWidth="1.2" strokeOpacity="0.38" />
              <line x1={px + fi} y1={py + fi} x2={px + fi} y2={py + ph - fi} stroke="white" strokeWidth="1.2" strokeOpacity="0.28" />
              <line x1={px + fi} y1={py + ph - fi} x2={px + pw - fi} y2={py + ph - fi} stroke="black" strokeWidth="1" strokeOpacity="0.18" />
              <line x1={px + pw - fi} y1={py + fi} x2={px + pw - fi} y2={py + ph - fi} stroke="black" strokeWidth="1" strokeOpacity="0.14" />
            </>
          )
        }
      </g>
    );
  }

  // Shaker XL — larger/thicker recessed frame
  if (style === "shaker_xl") {
    const fi = 4;
    return (
      <g>
        {base}
        <rect x={px} y={py} width={pw} height={ph} fill="url(#bevelGrad)" fillOpacity="0.38" />
        {showWindows
          ? <WindowRow x={ix} y={iy} w={iw} h={ih} windows={windows} />
          : (
            <>
              <rect x={px + fi} y={py + fi} width={pw - fi * 2} height={ph - fi * 2} fill="none" stroke={border} strokeWidth="3.5" strokeOpacity="0.52" />
              <line x1={px + fi} y1={py + fi} x2={px + pw - fi} y2={py + fi} stroke="white" strokeWidth="1.5" strokeOpacity="0.38" />
              <line x1={px + fi} y1={py + fi} x2={px + fi} y2={py + ph - fi} stroke="white" strokeWidth="1.5" strokeOpacity="0.28" />
              <line x1={px + fi} y1={py + ph - fi} x2={px + pw - fi} y2={py + ph - fi} stroke="black" strokeWidth="1.2" strokeOpacity="0.20" />
              <line x1={px + pw - fi} y1={py + fi} x2={px + pw - fi} y2={py + ph - fi} stroke="black" strokeWidth="1.2" strokeOpacity="0.16" />
            </>
          )
        }
      </g>
    );
  }

  // ── TRADITIONNEL ─────────────────────────────────────────────────────────────

  // Classique — 4-col raised panels
  if (style === "classique") {
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

  // Premium — 2-col with double inset and overhead lighting
  if (style === "premium") {
    const cols = 2, segW = iw / cols;
    return (
      <g>
        {base}
        {showWindows
          ? <WindowRow x={ix} y={iy} w={iw} h={ih} windows={windows} />
          : Array.from({ length: cols }, (_, c) => {
              const sx = ix + c * segW;
              const px1 = sx + 8, py1 = iy + 8, pw2 = segW - 16, ph2 = ih - 16;
              return (
                <g key={c}>
                  <rect x={sx + 4} y={iy + 4} width={segW - 8} height={ih - 8} fill="none" stroke={border} strokeWidth="0.8" strokeOpacity="0.35" />
                  <rect x={px1} y={py1} width={pw2} height={ph2} fill={fill} stroke={border} strokeWidth="0.6" strokeOpacity="0.5" filter="url(#premiumShadow)" />
                  <rect x={px1} y={py1} width={pw2} height={ph2} fill="url(#premiumPanelGrad)" />
                  <line x1={px1} y1={py1} x2={px1 + pw2} y2={py1} stroke="white" strokeWidth="1.2" strokeOpacity="0.45" />
                  <line x1={px1} y1={py1} x2={px1} y2={py1 + ph2} stroke="white" strokeWidth="1.2" strokeOpacity="0.35" />
                  <line x1={px1} y1={py1 + ph2} x2={px1 + pw2} y2={py1 + ph2} stroke="black" strokeWidth="1" strokeOpacity="0.20" />
                  <line x1={px1 + pw2} y1={py1} x2={px1 + pw2} y2={py1 + ph2} stroke="black" strokeWidth="1" strokeOpacity="0.16" />
                </g>
              );
            })
        }
      </g>
    );
  }

  // Premium MX — 3-col raised rectangular panels
  if (style === "premium_mx") {
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

  // Premium Select XL — 2 wide flat inset panels per row (matching garex.com reference)
  if (style === "premium_xl") {
    const cols = 2, segW = iw / cols;
    return (
      <g>
        {base}
        {showWindows
          ? <WindowRow x={ix} y={iy} w={iw} h={ih} windows={windows} />
          : Array.from({ length: cols }, (_, c) => {
              const sx = ix + c * segW;
              const fi = 8;
              const x1 = sx + fi, y1 = iy + fi, x2 = sx + segW - fi, y2 = iy + ih - fi;
              const w = x2 - x1, h = y2 - y1;
              return (
                <g key={c}>
                  {/* Groove channel around panel */}
                  <rect x={x1 - 3} y={y1 - 3} width={w + 6} height={h + 6}
                    fill="none" stroke={border} strokeWidth="0.5" strokeOpacity="0.22" />
                  {/* Flat inset panel face */}
                  <rect x={x1} y={y1} width={w} height={h} fill={fill} />
                  {/* Top highlight — light from above */}
                  <line x1={x1} y1={y1} x2={x2} y2={y1}
                    stroke="white" strokeWidth="1.5" strokeOpacity="0.40" />
                  {/* Left highlight */}
                  <line x1={x1} y1={y1} x2={x1} y2={y2}
                    stroke="white" strokeWidth="1.5" strokeOpacity="0.28" />
                  {/* Bottom shadow */}
                  <line x1={x1} y1={y2} x2={x2} y2={y2}
                    stroke="black" strokeWidth="1.5" strokeOpacity="0.18" />
                  {/* Right shadow */}
                  <line x1={x2} y1={y1} x2={x2} y2={y2}
                    stroke="black" strokeWidth="1.5" strokeOpacity="0.14" />
                </g>
              );
            })
        }
      </g>
    );
  }

  // Seigneurie — double overlay molding frame with corner accents
  if (style === "seigneurie") {
    return (
      <g>
        {base}
        <rect x={px} y={py} width={pw} height={ph} fill="url(#bevelGrad)" fillOpacity="0.28" />
        {showWindows
          ? <WindowRow x={ix} y={iy} w={iw} h={ih} windows={windows} />
          : (
            <>
              <rect x={ix + 2} y={iy + 2} width={iw - 4} height={ih - 4} fill="none" stroke={border} strokeWidth="1.5" strokeOpacity="0.5" />
              <rect x={ix + 7} y={iy + 7} width={iw - 14} height={ih - 14} fill="none" stroke={border} strokeWidth="1" strokeOpacity="0.38" />
              <line x1={ix + 2} y1={iy + 2} x2={ix + iw - 2} y2={iy + 2} stroke="white" strokeWidth="1" strokeOpacity="0.3" />
              <line x1={ix + 2} y1={iy + 2} x2={ix + 2} y2={iy + ih - 2} stroke="white" strokeWidth="1" strokeOpacity="0.22" />
            </>
          )
        }
      </g>
    );
  }

  // ── CHAMPÊTRE ────────────────────────────────────────────────────────────────

  // Vermont — board-and-batten: horizontal board line + vertical battens
  if (style === "vermont") {
    return (
      <g>
        {base}
        <rect x={px} y={py} width={pw} height={ph} fill="url(#bevelGrad)" fillOpacity="0.28" />
        {showWindows
          ? <WindowRow x={ix} y={iy} w={iw} h={ih} windows={windows} />
          : (
            <>
              {/* Horizontal board center line */}
              <line x1={px + 2} y1={py + ph * 0.5} x2={px + pw - 2} y2={py + ph * 0.5} stroke={border} strokeWidth="1.5" strokeOpacity="0.38" />
              <line x1={px + 2} y1={py + ph * 0.5 + 1.5} x2={px + pw - 2} y2={py + ph * 0.5 + 1.5} stroke="white" strokeWidth="0.6" strokeOpacity="0.18" />
              {/* Vertical battens */}
              {[1 / 3, 2 / 3].map((t, i) => (
                <g key={i}>
                  <rect x={px + pw * t - 2.5} y={py + 1} width={5} height={ph - 2} fill={fill} stroke={border} strokeWidth="0.8" strokeOpacity="0.38" />
                  <line x1={px + pw * t - 1.5} y1={py + 2} x2={px + pw * t - 1.5} y2={py + ph - 2} stroke="white" strokeWidth="0.7" strokeOpacity="0.18" />
                </g>
              ))}
            </>
          )
        }
      </g>
    );
  }

  // New Hampshire — 2-col double-inset with bevel
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
                  <rect x={sx + 3} y={iy + 3} width={segW - 6} height={ih - 6} fill="none" stroke={border} strokeWidth="1" strokeOpacity="0.4" />
                  <RaisedSection k={c} x1={sx + 7} y1={iy + 7} x2={sx + segW - 7} y2={iy + ih - 7} />
                </g>
              );
            })
        }
      </g>
    );
  }

  // New Hampshire XL — 11 evenly spaced vertical lines
  if (style === "new_hamp_xl") {
    return (
      <g>
        {base}
        <rect x={px} y={py} width={pw} height={ph} fill="url(#bevelGrad)" fillOpacity="0.28" />
        {showWindows
          ? <WindowRow x={ix} y={iy} w={iw} h={ih} windows={windows} />
          : Array.from({ length: 11 }, (_, i) => {
              const lx = px + pw * ((i + 1) / 12);
              return (
                <g key={i}>
                  <line x1={lx} y1={py + 2} x2={lx} y2={py + ph - 2} stroke={border} strokeWidth="1" strokeOpacity="0.32" />
                  <line x1={lx + 1} y1={py + 2} x2={lx + 1} y2={py + ph - 2} stroke="white" strokeWidth="0.4" strokeOpacity="0.13" />
                </g>
              );
            })
        }
      </g>
    );
  }

  // ── RECOUVREMENT ─────────────────────────────────────────────────────────────

  // Port Royal — rectangular border overlay molding (double nested frames)
  if (style === "port_royal") {
    return (
      <g>
        {base}
        <rect x={px} y={py} width={pw} height={ph} fill="url(#bevelGrad)" fillOpacity="0.28" />
        {showWindows
          ? <WindowRow x={ix} y={iy} w={iw} h={ih} windows={windows} />
          : (
            <>
              <rect x={ix + 2} y={iy + 2} width={iw - 4} height={ih - 4} fill="none" stroke={border} strokeWidth="2.2" strokeOpacity="0.52" />
              <rect x={ix + 7} y={iy + 7} width={iw - 14} height={ih - 14} fill="none" stroke={border} strokeWidth="1" strokeOpacity="0.38" />
              <line x1={ix + 2} y1={iy + 2} x2={ix + iw - 2} y2={iy + 2} stroke="white" strokeWidth="1.2" strokeOpacity="0.32" />
              <line x1={ix + 2} y1={iy + 2} x2={ix + 2} y2={iy + ih - 2} stroke="white" strokeWidth="1.2" strokeOpacity="0.24" />
            </>
          )
        }
      </g>
    );
  }

  // Villeray — 2 uniform rectangular sections with double molding
  if (style === "villeray") {
    const cols = 2, segW = iw / cols;
    return (
      <g>
        {base}
        <rect x={px} y={py} width={pw} height={ph} fill="url(#bevelGrad)" fillOpacity="0.28" />
        {showWindows
          ? <WindowRow x={ix} y={iy} w={iw} h={ih} windows={windows} />
          : Array.from({ length: cols }, (_, c) => {
              const sx = ix + c * segW;
              return (
                <g key={c}>
                  <rect x={sx + 4} y={iy + 4} width={segW - 8} height={ih - 8} fill="none" stroke={border} strokeWidth="2" strokeOpacity="0.48" />
                  <rect x={sx + 8} y={iy + 8} width={segW - 16} height={ih - 16} fill="none" stroke={border} strokeWidth="0.8" strokeOpacity="0.32" />
                  <line x1={sx + 4} y1={iy + 4} x2={sx + segW - 4} y2={iy + 4} stroke="white" strokeWidth="1" strokeOpacity="0.28" />
                  <line x1={sx + 4} y1={iy + 4} x2={sx + 4} y2={iy + ih - 4} stroke="white" strokeWidth="1" strokeOpacity="0.22" />
                </g>
              );
            })
        }
      </g>
    );
  }

  // Mitis — 2-col with rectangular frame + diagonal V-grain pattern
  if (style === "mitis") {
    const cols = 2, segW = iw / cols;
    return (
      <g>
        {base}
        <rect x={px} y={py} width={pw} height={ph} fill="url(#bevelGrad)" fillOpacity="0.28" />
        {showWindows
          ? <WindowRow x={ix} y={iy} w={iw} h={ih} windows={windows} />
          : Array.from({ length: cols }, (_, c) => {
              const sx = ix + c * segW;
              const x1 = sx + 4, y1 = iy + 4, x2 = sx + segW - 4, y2 = iy + ih - 4;
              const cx = (x1 + x2) / 2;
              return (
                <g key={c}>
                  <rect x={x1} y={y1} width={x2 - x1} height={y2 - y1} fill="none" stroke={border} strokeWidth="1.5" strokeOpacity="0.48" />
                  <line x1={x1 + 2} y1={y1 + 2} x2={cx} y2={y2 - 4} stroke={border} strokeWidth="1" strokeOpacity="0.38" />
                  <line x1={x2 - 2} y1={y1 + 2} x2={cx} y2={y2 - 4} stroke={border} strokeWidth="1" strokeOpacity="0.38" />
                </g>
              );
            })
        }
      </g>
    );
  }

  // Lotbinière — diagonal crossed X pattern per section
  if (style === "lotbiniere") {
    const cols = 2, segW = iw / cols;
    return (
      <g>
        {base}
        <rect x={px} y={py} width={pw} height={ph} fill="url(#bevelGrad)" fillOpacity="0.32" />
        {showWindows
          ? <WindowRow x={ix} y={iy} w={iw} h={ih} windows={windows} />
          : Array.from({ length: cols }, (_, c) => {
              const sx = ix + c * segW;
              const x1 = sx + 4, y1 = iy + 4, x2 = sx + segW - 4, y2 = iy + ih - 4;
              return (
                <g key={c}>
                  <rect x={x1} y={y1} width={x2 - x1} height={y2 - y1} fill="none" stroke={border} strokeWidth="1.2" strokeOpacity="0.44" />
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={border} strokeWidth="1.5" strokeOpacity="0.44" />
                  <line x1={x2} y1={y1} x2={x1} y2={y2} stroke={border} strokeWidth="1.5" strokeOpacity="0.44" />
                </g>
              );
            })
        }
      </g>
    );
  }

  return <>{base}</>;
}

function DoorVisualizer({ style, material, fill, border, windows, finish, widthFt, heightFt, windowRows }: {
  style: string; material: string; fill: string; border: string;
  windows: string; finish: string;
  widthFt: number; heightFt: number; windowRows: Set<number>;
}) {
  // Dynamic viewport: preserve real door aspect ratio, clamped to sensible canvas sizes
  const VW = 500;
  const VH = Math.max(180, Math.min(460, Math.round(VW * heightFt / widthFt)));
  const DW = VW - 2 * FW;
  const DH = VH - 2 * FW;
  const PH = (DH - (NP - 1) * PGAP) / NP;

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full h-full" style={{ maxHeight: 420 }}>
      <defs>
        <linearGradient id="bevelGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="white" stopOpacity="0.18" />
          <stop offset="40%"  stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="black" stopOpacity="0.14" />
        </linearGradient>
        <linearGradient id="ribGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="white" stopOpacity="0.22" />
          <stop offset="35%"  stopColor="white" stopOpacity="0.04" />
          <stop offset="70%"  stopColor="black" stopOpacity="0.10" />
          <stop offset="100%" stopColor="black" stopOpacity="0.02" />
        </linearGradient>
        {/* Fine steel horizontal texture — always visible on real doors */}
        <pattern id="steelgrain" x="0" y="0" width="400" height="5" patternUnits="userSpaceOnUse">
          <line x1="0" y1="1"   x2="400" y2="1.2"  stroke="rgba(0,0,0,0.030)" strokeWidth="0.5" />
          <line x1="0" y1="2.8" x2="400" y2="2.6"  stroke="rgba(0,0,0,0.022)" strokeWidth="0.4" />
          <line x1="0" y1="4.2" x2="400" y2="4.5"  stroke="rgba(0,0,0,0.018)" strokeWidth="0.3" />
          <line x1="0" y1="0.4" x2="400" y2="0.3"  stroke="rgba(255,255,255,0.025)" strokeWidth="0.3" />
        </pattern>
        {/* Pronounced woodgrain for "veine" finish */}
        {finish === "veine" && (
          <pattern id="woodgrain" x="0" y="0" width="400" height="7" patternUnits="userSpaceOnUse">
            <line x1="0" y1="1"   x2="400" y2="1.4"  stroke="rgba(0,0,0,0.07)" strokeWidth="0.8" />
            <line x1="0" y1="3"   x2="400" y2="2.7"  stroke="rgba(0,0,0,0.10)" strokeWidth="1.0" />
            <line x1="0" y1="5"   x2="400" y2="5.3"  stroke="rgba(0,0,0,0.06)" strokeWidth="0.7" />
            <line x1="0" y1="6.5" x2="400" y2="6.2"  stroke="rgba(0,0,0,0.08)" strokeWidth="0.9" />
            <line x1="0" y1="0.3" x2="400" y2="0.5"  stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
            <line x1="0" y1="2"   x2="400" y2="2.2"  stroke="rgba(255,255,255,0.04)" strokeWidth="0.4" />
          </pattern>
        )}
        {/* Vertical lighting gradient — simulates overhead light source */}
        <linearGradient id="doorLightGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="white" stopOpacity="0.09" />
          <stop offset="25%"  stopColor="white" stopOpacity="0.02" />
          <stop offset="65%"  stopColor="black" stopOpacity="0.01" />
          <stop offset="100%" stopColor="black" stopOpacity="0.11" />
        </linearGradient>
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
      <rect x="0" y="0" width={VW} height={VH} fill="#CACAC8" />
      {/* Wall texture gradient */}
      <rect x="0" y="0" width={VW} height={VH} fill="url(#doorLightGrad)" fillOpacity="0.4" />
      {/* Side pillars */}
      <rect x="0" y="0" width={FW + 6} height={VH} fill="#B8B5AE" />
      <rect x={VW - FW - 6} y="0" width={FW + 6} height={VH} fill="#B8B5AE" />
      {/* Header */}
      <rect x="0" y="0" width={VW} height={FW + 3} fill="#B8B5AE" />

      {/* Door frame outer track — dark steel channel */}
      <rect x={FW - 5} y={FW - 5} width={DW + 10} height={DH + 10} fill="#6A6A6A" rx="1" />
      {/* Track inner face */}
      <rect x={FW - 2} y={FW - 2} width={DW + 4} height={DH + 4} fill="#505050" />
      {/* Track highlight top */}
      <line x1={FW - 5} y1={FW - 5} x2={FW + DW + 5} y2={FW - 5} stroke="white" strokeWidth="1" strokeOpacity="0.22" />
      {/* Track highlight left */}
      <line x1={FW - 5} y1={FW - 5} x2={FW - 5} y2={FW + DH + 5} stroke="white" strokeWidth="1" strokeOpacity="0.16" />

      {/* Door surface base */}
      <rect x={FW} y={FW} width={DW} height={DH} fill={fill} filter="url(#doorshadow)" />

      {/* Steel horizontal grain — always on (simulates real pressed-steel texture) */}
      {material !== "vitre" && (
        <rect x={FW} y={FW} width={DW} height={DH} fill="url(#steelgrain)" />
      )}
      {/* Woodgrain finish overlay */}
      {finish === "veine" && (
        <rect x={FW} y={FW} width={DW} height={DH} fill="url(#woodgrain)" />
      )}
      {/* Door-wide vertical lighting */}
      <rect x={FW} y={FW} width={DW} height={DH} fill="url(#doorLightGrad)" />

      {/* Panels */}
      {Array.from({ length: NP }, (_, i) => {
        const py = FW + i * (PH + PGAP);
        const panelHasWindows = windows !== "none" && windowRows.has(i);
        return (
          <DoorPanel
            key={i}
            style={style}
            material={material}
            px={FW} py={py} pw={DW} ph={PH}
            fill={fill} border={border}
            showWindows={panelHasWindows}
            windows={windows}
          />
        );
      })}

      {/* Panel gap shadows */}
      {Array.from({ length: NP - 1 }, (_, i) => {
        const gapY = FW + (i + 1) * (PH + PGAP) - PGAP;
        return (
          <g key={i}>
            <rect x={FW} y={gapY} width={DW} height={PGAP} fill="black" fillOpacity="0.10" />
            <line x1={FW} y1={gapY + PGAP} x2={FW + DW} y2={gapY + PGAP}
              stroke="white" strokeWidth="0.7" strokeOpacity="0.20" />
          </g>
        );
      })}

      {/* Outer border */}
      <rect x={FW} y={FW} width={DW} height={DH} fill="none" stroke={border} strokeWidth="1" strokeOpacity="0.5" />

      {/* Dimension overlay */}
      <text x={VW / 2} y={VH - 4} textAnchor="middle" fontSize="9" fill="#888" fontFamily="sans-serif">
        {widthFt} pi × {heightFt} pi
      </text>

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

interface QuoteConfig { style: string; material: string; color: string; insulation: string; windows: string; finish: string; size: string; }

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
    ["Modèle",    STYLE_OPTIONS.find(s => s.id === config.style)?.label ?? config.style],
    ["Dimensions",config.size],
    ["Matériau",  MATERIAL_OPTIONS.find(m => m.id === config.material)?.label ?? config.material],
    ["Couleur",   config.color],
    ["Isolation", INSULATION_OPTIONS.find(i => i.id === config.insulation)?.label ?? config.insulation],
    ["Fenêtres",  WINDOW_OPTIONS.find(w => w.id === config.windows)?.label ?? config.windows],
    ["Fini",      FINISH_OPTIONS.find(f => f.id === config.finish)?.label ?? config.finish],
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
                  { key: "nom",       label: "Prénom et Nom", type: "text",  placeholder: "Jean Tremblay"   },
                  { key: "telephone", label: "Téléphone",     type: "tel",   placeholder: "450-558-5788"     },
                  { key: "courriel",  label: "Courriel",      type: "email", placeholder: "jean@exemple.com" },
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
  const [collection, setCollection] = useState<typeof COLLECTIONS[number]>("Moderne");
  const [style, setStyle] = useState("quantum");
  const [material, setMaterial] = useState("acier");
  const [color, setColor] = useState("blanc");
  const [customColor, setCustomColor] = useState("#888888");
  const [insulation, setInsulation] = useState("r16");
  const [windows, setWindows] = useState("none");
  const [finish, setFinish] = useState("lisse");
  const [showQuote, setShowQuote] = useState(false);
  // Size
  const [doorType, setDoorType] = useState<"single" | "double">("single");
  const [widthFt, setWidthFt] = useState(8);
  const [heightFt, setHeightFt] = useState(7);
  // Window row placement (which panel rows show windows)
  const [windowRows, setWindowRows] = useState<Set<number>>(new Set([0]));

  const selectedColor = COLOR_OPTIONS.find(c => c.id === color);
  const fill = color === "custom" ? customColor : (selectedColor?.hex ?? "#F0F0EE");
  const border = color === "custom" ? "#666666" : (selectedColor?.border ?? "#C8C8C6");
  const colorLabel = color === "custom" ? customColor.toUpperCase() : (selectedColor?.label ?? "");
  const styleLabel = STYLE_OPTIONS.find(s => s.id === style)?.label ?? "";
  const materialLabel = MATERIAL_OPTIONS.find(m => m.id === material)?.label ?? "";
  const insulLabel = INSULATION_OPTIONS.find(i => i.id === insulation)?.label ?? "";
  const winLabel = WINDOW_OPTIONS.find(w => w.id === windows)?.label ?? "";
  const finLabel = FINISH_OPTIONS.find(f => f.id === finish)?.label ?? "";
  const sizeLabel = `${widthFt} pi × ${heightFt} pi — ${doorType === "single" ? "Simple" : "Double"}`;

  const handleCollectionChange = (col: typeof COLLECTIONS[number]) => {
    setCollection(col);
    const first = STYLE_OPTIONS.find(s => s.collection === col);
    if (first) setStyle(first.id);
  };

  const handleDoorTypeChange = (type: "single" | "double") => {
    setDoorType(type);
    // Reset to a sensible default width for the new type
    setWidthFt(type === "single" ? 8 : 12);
  };

  const toggleWindowRow = (row: number) => {
    setWindowRows(prev => {
      const next = new Set(prev);
      if (next.has(row)) next.delete(row);
      else next.add(row);
      return next;
    });
  };

  // When window type is set to "none", clear row selections
  const handleWindowChange = (id: string) => {
    setWindows(id);
    if (id === "none") setWindowRows(new Set());
    else if (windowRows.size === 0) setWindowRows(new Set([0]));
  };

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
                  <DoorVisualizer
                    style={style} material={material} fill={fill} border={border}
                    windows={windows} finish={finish}
                    widthFt={widthFt} heightFt={heightFt} windowRows={windowRows}
                  />
                </div>
                <div className="p-4 border-t border-gray-100 flex flex-wrap gap-2">
                  <ConfigChip label={styleLabel} />
                  <ConfigChip label={sizeLabel} />
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

              {/* 1. Model / Style */}
              <SectionCard title="Modèle de porte" badge="required">
                {/* Collection tabs */}
                <div className="flex gap-1 mb-3 bg-gray-100 rounded-xl p-1">
                  {COLLECTIONS.map(col => (
                    <button
                      key={col}
                      onClick={() => handleCollectionChange(col)}
                      className={`flex-1 text-[11px] font-semibold py-1.5 rounded-lg transition-all ${
                        collection === col
                          ? "bg-white text-brand shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
                {/* Models for selected collection */}
                <div className="grid grid-cols-2 gap-2">
                  {STYLE_OPTIONS.filter(s => s.collection === collection).map(s => (
                    <Pill key={s.id} label={s.label} sub={s.sub} selected={style === s.id} onClick={() => setStyle(s.id)} />
                  ))}
                </div>
              </SectionCard>

              {/* 2. Size */}
              <SectionCard title="Dimensions" badge="required">
                {/* Door type toggle */}
                <div className="flex gap-2 mb-4">
                  {(["single", "double"] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => handleDoorTypeChange(type)}
                      className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                        doorType === type
                          ? "border-brand bg-brand/5 text-brand"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {type === "single" ? "Porte simple" : "Porte double"}
                      <span className="block text-[10px] font-normal text-gray-400 mt-0.5">
                        {type === "single" ? "6 – 10 pi" : "11 – 16 pi"}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Width */}
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Largeur</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(doorType === "single" ? SINGLE_WIDTHS : DOUBLE_WIDTHS).map(w => (
                    <button
                      key={w}
                      onClick={() => setWidthFt(w)}
                      className={`px-3 py-1.5 rounded-lg border-2 text-sm font-semibold transition-all ${
                        widthFt === w
                          ? "border-brand bg-brand/5 text-brand"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {w} pi
                    </button>
                  ))}
                </div>

                {/* Height */}
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Hauteur</p>
                <div className="flex gap-2">
                  {HEIGHTS.map(h => (
                    <button
                      key={h}
                      onClick={() => setHeightFt(h)}
                      className={`flex-1 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                        heightFt === h
                          ? "border-brand bg-brand/5 text-brand"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {h} pi
                    </button>
                  ))}
                </div>
              </SectionCard>

              {/* 3. Material */}
              <SectionCard title="Matériau" badge="required">
                <div className="grid grid-cols-3 gap-2">
                  {MATERIAL_OPTIONS.map(m => (
                    <Pill key={m.id} label={m.label} sub={m.sub} selected={material === m.id} onClick={() => setMaterial(m.id)} />
                  ))}
                </div>
              </SectionCard>

              {/* 3. Color */}
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

              {/* 4. Insulation */}
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

              {/* 7. Windows */}
              <SectionCard title="Fenêtres / Vitres" badge="optional">
                {/* Window type */}
                <div className="grid grid-cols-1 gap-2">
                  {WINDOW_OPTIONS.map(w => (
                    <Pill key={w.id} label={w.label} selected={windows === w.id} onClick={() => handleWindowChange(w.id)} />
                  ))}
                </div>

                {/* Panel placement selector */}
                {windows !== "none" && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Emplacement — cliquez les panneaux
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {Array.from({ length: NP }, (_, i) => {
                        const active = windowRows.has(i);
                        return (
                          <button
                            key={i}
                            onClick={() => toggleWindowRow(i)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border-2 transition-all text-sm ${
                              active
                                ? "border-sky-400 bg-sky-50 text-sky-700"
                                : "border-gray-200 text-gray-400 hover:border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            <span className="font-medium">Panneau {i + 1}</span>
                            {active ? (
                              <span className="flex items-center gap-1.5 text-xs font-semibold">
                                <span className="w-3 h-3 rounded-sm bg-sky-300 inline-block border border-sky-400" />
                                Avec fenêtre
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">Sans fenêtre</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2">
                      {windowRows.size === 0
                        ? "Aucun panneau sélectionné"
                        : `${windowRows.size} panneau${windowRows.size > 1 ? "x" : ""} sélectionné${windowRows.size > 1 ? "s" : ""}`}
                    </p>
                  </div>
                )}
              </SectionCard>

              {/* 6. Finish */}
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
          config={{ style, material, color: colorLabel, insulation, windows, finish, size: sizeLabel }}
        />
      )}
    </>
  );
}
