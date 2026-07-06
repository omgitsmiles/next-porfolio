'use client'

import { useState, useRef, useEffect } from "react";
import { Palette, Sun, Moon, SunMoon } from "lucide-react";
import { useC, MONO, THEMES, THEME_KEYS, type ThemeName } from "./theme";
import { useUI } from "./hooks";
import { WINDOW_ICONS } from "./icons";
import type { WinState } from "./types";
import type { WallpaperMode } from "./DynamicWallpaper";

const WALLPAPER_MODES: WallpaperMode[] = ["auto", "day", "night"];
const WALLPAPER_MODE_ICON = { auto: SunMoon, day: Sun, night: Moon } as const;
const WALLPAPER_MODE_LABEL = { auto: "Auto", day: "Day", night: "Night" } as const;

const MENU_WINDOWS = [
  { id: "terminal", label: "Terminal"        },
  { id: "about",    label: "About"           },
  { id: "projects", label: "Projects"        },
  { id: "contact",  label: "Contact"         },
  { id: "snake",    label: "Snake"           },
  { id: "space",    label: "Space Invaders"  },
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
  theme: ThemeName;
  onSetTheme: (t: ThemeName) => void;
  wallpaperMode: WallpaperMode;
  onSetWallpaperMode: (m: WallpaperMode) => void;
};

export function MenuBar({ wins, open, close, toggle, reset, theme, onSetTheme, wallpaperMode, onSetWallpaperMode }: MenuBarProps) {
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
              <div style={{ ...dd, minWidth: 180, animation: "dropdown-in 0.12s ease" }}>
                <div style={{ padding: "4px 18px 2px", fontSize: 10, color: C.textFaint, letterSpacing: "0.07em" }}>OPEN WINDOW</div>
                {MENU_WINDOWS.map(w => {
                  const Icon = WINDOW_ICONS[w.id];
                  return (
                    <div
                      key={w.id}
                      onClick={dismiss(() => open(w.id))}
                      style={{ padding: "5px 18px", fontSize: 11, color: C.text, cursor: "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 8 }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(128,100,50,0.12)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      {Icon && <Icon size={12} strokeWidth={1.5} color={C.textDim} />}
                      {w.label}
                    </div>
                  );
                })}
                <DSep />
                <DItem label="Close All Windows" onClick={dismiss(() => openWins.forEach(w => close(w.id)))} faint />
              </div>
            )}
          </div>

          <div style={{ position: "relative" }}>
            {label("View")}
            {active === "View" && (
              <div style={{ ...dd, minWidth: 190, animation: "dropdown-in 0.12s ease" }}>
                <DItem label="Minimize All" onClick={dismiss(() => notMinimized.forEach(w => toggle(w.id)))} faint={notMinimized.length === 0} />
                <DItem label="Restore All"  onClick={dismiss(() => minimized.forEach(w => toggle(w.id)))}  faint={minimized.length === 0} />
                <DSep />
                <DItem label="Reset Layout" onClick={dismiss(reset)} />
                <DSep />
                <div style={{ padding: "4px 18px 2px", fontSize: 10, color: C.textFaint, letterSpacing: "0.07em" }}>THEME</div>
                {THEME_KEYS.map(key => (
                  <div
                    key={key}
                    onClick={dismiss(() => onSetTheme(key))}
                    style={{ padding: "5px 18px", fontSize: 11, color: theme === key ? C.amber : C.text, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(128,100,50,0.12)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    {THEMES[key].name}
                    {theme === key && <span style={{ color: C.amber, fontSize: 10 }}>✓</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ position: "relative" }}>
            {label("Help")}
            {active === "Help" && (
              <div style={{ ...dd, minWidth: 200, animation: "dropdown-in 0.12s ease" }}>
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
          onClick={() => onSetWallpaperMode(WALLPAPER_MODES[(WALLPAPER_MODES.indexOf(wallpaperMode) + 1) % WALLPAPER_MODES.length])}
          title={`Wallpaper: ${WALLPAPER_MODE_LABEL[wallpaperMode]} — click to cycle`}
          style={{
            background: "none", border: "none", cursor: "pointer",
            lineHeight: 1, padding: "2px 6px", borderRadius: 4,
            color: C.amber, display: "flex", alignItems: "center", gap: 5,
          }}
        >
          {(() => { const Icon = WALLPAPER_MODE_ICON[wallpaperMode]; return <Icon size={13} strokeWidth={1.5} />; })()}
          <span style={{ fontFamily: MONO, fontSize: 10 }}>{WALLPAPER_MODE_LABEL[wallpaperMode]}</span>
        </button>
        <button
          onClick={() => onSetTheme(THEME_KEYS[(THEME_KEYS.indexOf(theme) + 1) % THEME_KEYS.length])}
          title={`Theme: ${THEMES[theme].name} — click to cycle`}
          style={{
            background: "none", border: "none", cursor: "pointer",
            lineHeight: 1, padding: "2px 6px", borderRadius: 4,
            color: C.amber, display: "flex", alignItems: "center", gap: 5,
          }}
        >
          <Palette size={13} strokeWidth={1.5} />
          <span style={{ fontFamily: MONO, fontSize: 10 }}>{THEMES[theme].name}</span>
        </button>
        <span style={{ fontSize: 11, color: C.textFaint }}>guest</span>
        <Clock />
      </div>
    </div>
  );
}
