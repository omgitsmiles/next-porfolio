'use client'

import { useEffect, useRef } from "react";
import { useC, MONO, THEMES, THEME_KEYS, type ThemeName } from "./theme";

const WINDOWS = [
  { id: "terminal", label: "Terminal"       },
  { id: "about",    label: "About"          },
  { id: "projects", label: "Projects"       },
  { id: "contact",  label: "Contact"        },
  { id: "snake",    label: "Snake"          },
  { id: "space",    label: "Space Invaders" },
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

  const itemClass = "flex items-center justify-between px-4 py-[5px] text-[11px] whitespace-nowrap cursor-pointer";
  const itemFont: React.CSSProperties = { fontFamily: MONO };

  const hover = (e: React.MouseEvent<HTMLDivElement>, on: boolean) => {
    e.currentTarget.style.background = on ? `${C.border}cc` : "transparent";
  };

  const section = (label: string) => (
    <div className="px-4 pt-1 pb-0.5 text-[9px] tracking-[0.1em]" style={{ color: C.textFaint, fontFamily: MONO }}>
      {label}
    </div>
  );

  const sep = () => <div className="h-px my-[3px]" style={{ background: C.border }} />;

  return (
    <div
      ref={ref}
      className="fixed z-[4000] backdrop-blur-[20px] rounded-[7px] py-1 min-w-[192px] border shadow-[0_16px_48px_rgba(0,0,0,0.65)] [animation:dropdown-in_0.12s_ease]"
      style={{ left: cx, top: cy, background: C.win, borderColor: C.border }}
    >
      {section("OPEN WINDOW")}
      {WINDOWS.map(w => (
        <div
          key={w.id}
          onClick={() => { onOpen(w.id); onClose(); }}
          className={itemClass}
          style={{ ...itemFont, color: C.text }}
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
          className={itemClass}
          style={{ ...itemFont, color: theme === k ? C.amber : C.text }}
          onMouseEnter={e => hover(e, true)}
          onMouseLeave={e => hover(e, false)}
        >
          {THEMES[k].name}
          {theme === k && <span className="text-[9px]" style={{ color: C.amber }}>✓</span>}
        </div>
      ))}

      {sep()}
      <div
        onClick={() => { onReset(); onClose(); }}
        className={itemClass}
        style={{ ...itemFont, color: C.textDim }}
        onMouseEnter={e => hover(e, true)}
        onMouseLeave={e => hover(e, false)}
      >
        Reset Layout
      </div>
    </div>
  );
}
