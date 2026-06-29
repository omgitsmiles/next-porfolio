'use client'

import { useState, useRef, useEffect } from "react";
import { useC, MONO } from "./theme";
import { useUI } from "./hooks";
import type { WinState } from "./types";

const MENU_WINDOWS = [
  { id: "terminal", icon: "⬛", label: "Terminal" },
  { id: "about",    icon: "📝", label: "About"    },
  { id: "projects", icon: "📁", label: "Projects" },
  { id: "contact",  icon: "💬", label: "Contact"  },
  { id: "snake",    icon: "🐍", label: "Snake"    },
];

const HELP_COMMANDS = [
  "whoami", "ls", "skills", "neofetch",
  "cat resume", "open resume",
  "open about", "open projects", "open contact", "open snake",
  "clear",
];

function DItem({ label, onClick, faint }: { label: string; onClick: () => void; faint?: boolean }) {
  const C = useC();
  return (
    <div
      onClick={onClick}
      style={{ padding: "5px 18px", fontSize: 11, color: faint ? C.textFaint : C.text, cursor: "pointer", whiteSpace: "nowrap" }}
      onMouseEnter={e => (e.currentTarget.style.background = "rgba(128,100,50,0.12)")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      {label}
    </div>
  );
}

function DSep() {
  const C = useC();
  return <div style={{ height: 1, background: C.border, margin: "3px 0" }} />;
}

function Clock() {
  const C = useC();
  const [t, setT] = useState<Date | null>(null);
  useEffect(() => {
    setT(new Date());
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const p = (n: number) => String(n).padStart(2, "0");
  if (!t) return null;
  return (
    <span style={{ fontFamily: MONO, fontSize: 12, color: C.textDim }}>
      {p(t.getHours())}:{p(t.getMinutes())}:{p(t.getSeconds())}
    </span>
  );
}

type MenuBarProps = {
  wins: WinState[];
  open: (id: string) => void;
  close: (id: string) => void;
  toggle: (id: string) => void;
  reset: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
};

export function MenuBar({ wins, open, close, toggle, reset, isDark, onToggleTheme }: MenuBarProps) {
  const C = useC();
  const { isMobile } = useUI();
  const [active, setActive] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const dd: React.CSSProperties = {
    position: "absolute", top: "calc(100% + 2px)", left: 0,
    background: C.win, backdropFilter: "blur(24px)",
    border: `1px solid ${C.border}`, borderRadius: 6,
    boxShadow: "0 16px 48px rgba(0,0,0,0.35)",
    padding: "4px 0", zIndex: 1001,
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setActive(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const dismiss = (action: () => void) => () => { action(); setActive(null); };

  const openWins     = wins.filter(w => !w.closed);
  const notMinimized = openWins.filter(w => !w.minimized);
  const minimized    = openWins.filter(w => w.minimized);

  const label = (name: string) => (
    <span
      onClick={() => setActive(a => a === name ? null : name)}
      style={{
        fontSize: 11, cursor: "pointer", padding: "0 10px", lineHeight: "28px", display: "block",
        color: active === name ? C.amber : C.textDim,
        background: active === name ? "rgba(128,100,50,0.12)" : "transparent",
        borderRadius: 4,
      }}
    >
      {name}
    </span>
  );

  return (
    <div ref={ref} style={{
      position: "absolute", top: 0, left: 0, right: 0, height: 28, zIndex: 999,
      background: C.menubarBg, backdropFilter: "blur(10px)",
      borderBottom: `1px solid ${C.border}`,
      display: "flex", alignItems: "center", padding: "0 16px", gap: 2,
    }}>
      <span style={{ color: C.amber, fontWeight: 700, fontSize: 13, marginRight: 10 }}>⌘ PaoloOS</span>

      {!isMobile && (
        <>
          <div style={{ position: "relative" }}>
            {label("File")}
            {active === "File" && (
              <div style={{ ...dd, minWidth: 180 }}>
                <div style={{ padding: "4px 18px 2px", fontSize: 10, color: C.textFaint, letterSpacing: "0.07em" }}>OPEN WINDOW</div>
                {MENU_WINDOWS.map(w => (
                  <DItem key={w.id} label={`${w.icon}  ${w.label}`} onClick={dismiss(() => open(w.id))} />
                ))}
                <DSep />
                <DItem label="Close All Windows" onClick={dismiss(() => openWins.forEach(w => close(w.id)))} faint />
              </div>
            )}
          </div>

          <div style={{ position: "relative" }}>
            {label("View")}
            {active === "View" && (
              <div style={{ ...dd, minWidth: 170 }}>
                <DItem label="Minimize All" onClick={dismiss(() => notMinimized.forEach(w => toggle(w.id)))} faint={notMinimized.length === 0} />
                <DItem label="Restore All" onClick={dismiss(() => minimized.forEach(w => toggle(w.id)))} faint={minimized.length === 0} />
                <DSep />
                <DItem label="Reset Layout" onClick={dismiss(reset)} />
              </div>
            )}
          </div>

          <div style={{ position: "relative" }}>
            {label("Help")}
            {active === "Help" && (
              <div style={{ ...dd, minWidth: 200 }}>
                <div style={{ padding: "4px 18px 2px", fontSize: 10, color: C.textFaint, letterSpacing: "0.07em" }}>COMMAND REFERENCE</div>
                {HELP_COMMANDS.map(cmd => (
                  <div key={cmd} style={{ padding: "2px 18px", fontSize: 11, color: C.textDim, fontFamily: MONO }}>{cmd}</div>
                ))}
                <DSep />
                <DItem label="📝  Open About" onClick={dismiss(() => open("about"))} />
              </div>
            )}
          </div>
        </>
      )}

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={onToggleTheme}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 14, lineHeight: 1, padding: "2px 4px", borderRadius: 4,
            color: C.textDim,
          }}
        >
          {isDark ? "☀️" : "🌙"}
        </button>
        <span style={{ fontSize: 11, color: C.textFaint }}>guest</span>
        <Clock />
      </div>
    </div>
  );
}
