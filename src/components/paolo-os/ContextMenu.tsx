'use client'

import { useEffect, useRef } from "react";
import { useC, MONO, THEMES, THEME_KEYS, type ThemeName } from "./theme";

const WINDOWS = [
  { id: "terminal", label: "Terminal" },
  { id: "about",    label: "About"    },
  { id: "projects", label: "Projects" },
  { id: "contact",  label: "Contact"  },
  { id: "snake",    label: "Snake"    },
];

type Props = {
  x: number;
  y: number;
  theme: ThemeName;
  onOpen: (id: string) => void;
  onSetTheme: (t: ThemeName) => void;
  onReset: () => void;
  onClose: () => void;
};

export function ContextMenu({ x, y, theme, onOpen, onSetTheme, onReset, onClose }: Props) {
  const C = useC();
  const ref = useRef<HTMLDivElement>(null);

  const cx = typeof window !== "undefined" ? Math.min(x, window.innerWidth  - 210) : x;
  const cy = typeof window !== "undefined" ? Math.min(y, window.innerHeight - 360) : y;

  useEffect(() => {
    const onMD  = (e: MouseEvent)   => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("mousedown", onMD);
    document.addEventListener("keydown",   onKey);
    return () => {
      document.removeEventListener("mousedown", onMD);
      document.removeEventListener("keydown",   onKey);
    };
  }, [onClose]);

  const itemStyle: React.CSSProperties = {
    padding: "5px 16px", fontSize: 11, color: C.text,
    cursor: "pointer", whiteSpace: "nowrap", fontFamily: MONO,
    display: "flex", alignItems: "center", justifyContent: "space-between",
  };

  const hover = (e: React.MouseEvent<HTMLDivElement>, on: boolean) => {
    e.currentTarget.style.background = on ? `${C.border}cc` : "transparent";
  };

  const section = (label: string) => (
    <div style={{ padding: "4px 16px 2px", fontSize: 9, color: C.textFaint, letterSpacing: "0.1em", fontFamily: MONO }}>
      {label}
    </div>
  );

  const sep = () => <div style={{ height: 1, background: C.border, margin: "3px 0" }} />;

  return (
    <div
      ref={ref}
      style={{
        position: "fixed", left: cx, top: cy, zIndex: 4000,
        background: C.win, backdropFilter: "blur(20px)",
        border: `1px solid ${C.border}`, borderRadius: 7,
        padding: "4px 0", minWidth: 192,
        boxShadow: "0 16px 48px rgba(0,0,0,0.65)",
        animation: "dropdown-in 0.12s ease",
      }}
    >
      {section("OPEN WINDOW")}
      {WINDOWS.map(w => (
        <div
          key={w.id}
          onClick={() => { onOpen(w.id); onClose(); }}
          style={itemStyle}
          onMouseEnter={e => hover(e, true)}
          onMouseLeave={e => hover(e, false)}
        >
          {w.label}
        </div>
      ))}

      {sep()}
      {section("CHANGE THEME")}
      {THEME_KEYS.map(k => (
        <div
          key={k}
          onClick={() => { onSetTheme(k); onClose(); }}
          style={{ ...itemStyle, color: theme === k ? C.amber : C.text }}
          onMouseEnter={e => hover(e, true)}
          onMouseLeave={e => hover(e, false)}
        >
          {THEMES[k].name}
          {theme === k && <span style={{ fontSize: 9, color: C.amber }}>✓</span>}
        </div>
      ))}

      {sep()}
      <div
        onClick={() => { onReset(); onClose(); }}
        style={{ ...itemStyle, color: C.textDim }}
        onMouseEnter={e => hover(e, true)}
        onMouseLeave={e => hover(e, false)}
      >
        Reset Layout
      </div>
    </div>
  );
}
