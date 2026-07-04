'use client'

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { useC, MONO, THEMES, THEME_KEYS, type ThemeName } from "./theme";
import { WINDOW_ICONS } from "./icons";

type Result = {
  group: "window" | "theme";
  label: string;
  sub: string;
  action: () => void;
};

const WINDOWS = [
  { id: "terminal", label: "Terminal"       },
  { id: "about",    label: "About"          },
  { id: "projects", label: "Projects"       },
  { id: "contact",  label: "Contact"        },
  { id: "snake",    label: "Snake"          },
  { id: "space",    label: "Space Invaders" },
];

type Props = {
  onOpen: (id: string) => void;
  onSetTheme: (t: ThemeName) => void;
  onClose: () => void;
};

export function Spotlight({ onOpen, onSetTheme, onClose }: Props) {
  const C = useC();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const allResults: Result[] = [
    ...WINDOWS.map(w => ({
      group: "window" as const,
      label: w.label,
      sub: "Open window",
      action: () => { onOpen(w.id); onClose(); },
    })),
    ...THEME_KEYS.map(k => ({
      group: "theme" as const,
      label: THEMES[k].name,
      sub: "Switch theme",
      action: () => { onSetTheme(k); onClose(); },
    })),
  ];

  const results = q.trim()
    ? allResults.filter(r =>
        r.label.toLowerCase().includes(q.toLowerCase()) ||
        r.sub.toLowerCase().includes(q.toLowerCase()) ||
        r.group.toLowerCase().includes(q.toLowerCase())
      )
    : allResults;

  useEffect(() => { setSel(0); }, [q]);

  const confirm = (r: Result) => r.action();

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape")    { onClose(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setSel(s => Math.min(s + 1, results.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setSel(s => Math.max(s - 1, 0)); }
    if (e.key === "Enter" && results[sel]) confirm(results[sel]);
  };

  const groupColor = (g: string) => g === "window" ? C.blue : C.cyan;

  return (
    <div
      onMouseDown={onClose}
      style={{
        position: "absolute", inset: 0, zIndex: 3000,
        background: "rgba(0,0,0,0.52)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        paddingTop: "15vh",
      }}
    >
      <div
        onMouseDown={e => e.stopPropagation()}
        style={{
          width: 500, background: C.win, border: `1px solid ${C.border}`,
          borderRadius: 10, overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0,0,0,0.85)",
          animation: "win-open 0.15s ease",
        }}
      >
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "12px 16px", borderBottom: `1px solid ${C.border}`,
        }}>
          <Search size={14} strokeWidth={1.5} color={C.textFaint} />
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={onKey}
            placeholder="Search windows and themes…"
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: C.text, fontFamily: MONO, fontSize: 13,
            }}
          />
          <kbd style={{
            fontSize: 9, color: C.textFaint, fontFamily: MONO,
            border: `1px solid ${C.border}`, borderRadius: 3, padding: "1px 5px",
          }}>esc</kbd>
        </div>

        {results.length > 0 ? (
          <div style={{ maxHeight: 320, overflowY: "auto" }}>
            {results.map((r, i) => {
              const Icon = r.group === "window" ? WINDOW_ICONS[WINDOWS.find(w => w.label === r.label)?.id ?? ""] : null;
              return (
                <div
                  key={i}
                  onClick={() => confirm(r)}
                  onMouseEnter={() => setSel(i)}
                  style={{
                    padding: "9px 16px", cursor: "pointer",
                    background: i === sel ? `${C.border}cc` : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    transition: "background 0.08s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {Icon && <Icon size={13} strokeWidth={1.5} color={C.textDim} />}
                    <span style={{ color: C.text, fontFamily: MONO, fontSize: 13 }}>{r.label}</span>
                    <span style={{ color: C.textFaint, fontFamily: MONO, fontSize: 10 }}>{r.sub}</span>
                  </div>
                  <span style={{
                    fontSize: 9, color: groupColor(r.group),
                    fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.1em",
                  }}>{r.group}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: "20px 16px", textAlign: "center", color: C.textFaint, fontFamily: MONO, fontSize: 12 }}>
            No results for &quot;{q}&quot;
          </div>
        )}

        <div style={{
          padding: "6px 16px", borderTop: `1px solid ${C.border}`,
          display: "flex", gap: 16,
        }}>
          <span style={{ fontSize: 9, color: C.textFaint, fontFamily: MONO }}>
            ⌘K toggle · ↑↓ navigate · ↵ select
          </span>
        </div>
      </div>
    </div>
  );
}
