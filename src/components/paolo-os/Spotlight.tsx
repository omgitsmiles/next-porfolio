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
      className="absolute inset-0 z-[3000] flex items-start justify-center pt-[15vh] backdrop-blur-[6px] bg-[rgba(0,0,0,0.52)]"
    >
      <div
        onMouseDown={e => e.stopPropagation()}
        className="w-[500px] overflow-hidden rounded-[10px] border shadow-[0_32px_80px_rgba(0,0,0,0.85)] [animation:win-open_0.15s_ease]"
        style={{ background: C.win, borderColor: C.border }}
      >
        <div className="flex items-center gap-2.5 px-4 py-3 border-b" style={{ borderColor: C.border }}>
          <Search size={14} strokeWidth={1.5} color={C.textFaint} />
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={onKey}
            placeholder="Search windows and themes…"
            className="flex-1 bg-transparent border-none outline-none text-[13px]"
            style={{ color: C.text, fontFamily: MONO }}
          />
          <kbd
            className="text-[9px] border rounded-[3px] px-[5px] py-px"
            style={{ color: C.textFaint, fontFamily: MONO, borderColor: C.border }}
          >esc</kbd>
        </div>

        {results.length > 0 ? (
          <div className="max-h-[320px] overflow-y-auto">
            {results.map((r, i) => {
              const Icon = r.group === "window" ? WINDOW_ICONS[WINDOWS.find(w => w.label === r.label)?.id ?? ""] : null;
              return (
                <div
                  key={i}
                  onClick={() => confirm(r)}
                  onMouseEnter={() => setSel(i)}
                  className="flex items-center justify-between py-[9px] px-4 cursor-pointer transition-[background] duration-[0.08s]"
                  style={{ background: i === sel ? `${C.border}cc` : "transparent" }}
                >
                  <div className="flex items-center gap-2.5">
                    {Icon && <Icon size={13} strokeWidth={1.5} color={C.textDim} />}
                    <span className="text-[13px]" style={{ color: C.text, fontFamily: MONO }}>{r.label}</span>
                    <span className="text-[10px]" style={{ color: C.textFaint, fontFamily: MONO }}>{r.sub}</span>
                  </div>
                  <span
                    className="text-[9px] uppercase tracking-[0.1em]"
                    style={{ color: groupColor(r.group), fontFamily: MONO }}
                  >{r.group}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-5 px-4 text-center text-xs" style={{ color: C.textFaint, fontFamily: MONO }}>
            No results for &quot;{q}&quot;
          </div>
        )}

        <div className="flex gap-4 px-4 py-1.5 border-t" style={{ borderColor: C.border }}>
          <span className="text-[9px]" style={{ color: C.textFaint, fontFamily: MONO }}>
            ⌘K toggle · ↑↓ navigate · ↵ select
          </span>
        </div>
      </div>
    </div>
  );
}
