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
      className="py-[5px] px-[18px] text-[11px] cursor-pointer whitespace-nowrap"
      style={{ color: faint ? C.textFaint : C.text }}
      onMouseEnter={e => (e.currentTarget.style.background = "rgba(128,100,50,0.12)")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      {label}
    </div>
  );
}

function DSep() {
  const C = useC();
  return <div className="h-px my-[3px]" style={{ background: C.border }} />;
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
    <span className="text-xs" style={{ fontFamily: MONO, color: C.textDim }}>
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

  const ddClass = "absolute top-[calc(100%+2px)] left-0 border rounded-md py-1 z-[1001] shadow-[0_16px_48px_rgba(0,0,0,0.35)] backdrop-blur-[24px] [animation:dropdown-in_0.12s_ease]";
  const ddStyle: React.CSSProperties = { background: C.win, borderColor: C.border };

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
      className="text-[11px] cursor-pointer px-[10px] leading-[28px] block rounded"
      style={{
        color: active === name ? C.amber : C.textDim,
        background: active === name ? "rgba(128,100,50,0.12)" : "transparent",
      }}
    >
      {name}
    </span>
  );

  return (
    <div ref={ref} className="absolute top-0 left-0 right-0 h-7 z-[999] flex items-center px-4 gap-0.5 border-b backdrop-blur-[10px]" style={{ background: C.menubarBg, borderColor: C.border }}>
      <span className="font-bold text-[13px] mr-2.5" style={{ color: C.amber }}>⌘ PaoloOS</span>

      {!isMobile && (
        <>
          <div className="relative">
            {label("File")}
            {active === "File" && (
              <div className={`${ddClass} min-w-[180px]`} style={ddStyle}>
                <div className="pt-1 px-[18px] pb-0.5 text-[10px] tracking-[0.07em]" style={{ color: C.textFaint }}>OPEN WINDOW</div>
                {MENU_WINDOWS.map(w => {
                  const Icon = WINDOW_ICONS[w.id];
                  return (
                    <div
                      key={w.id}
                      onClick={dismiss(() => open(w.id))}
                      className="py-[5px] px-[18px] text-[11px] cursor-pointer whitespace-nowrap flex items-center gap-2"
                      style={{ color: C.text }}
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

          <div className="relative">
            {label("View")}
            {active === "View" && (
              <div className={`${ddClass} min-w-[190px]`} style={ddStyle}>
                <DItem label="Minimize All" onClick={dismiss(() => notMinimized.forEach(w => toggle(w.id)))} faint={notMinimized.length === 0} />
                <DItem label="Restore All"  onClick={dismiss(() => minimized.forEach(w => toggle(w.id)))}  faint={minimized.length === 0} />
                <DSep />
                <DItem label="Reset Layout" onClick={dismiss(reset)} />
                <DSep />
                <div className="pt-1 px-[18px] pb-0.5 text-[10px] tracking-[0.07em]" style={{ color: C.textFaint }}>THEME</div>
                {THEME_KEYS.map(key => (
                  <div
                    key={key}
                    onClick={dismiss(() => onSetTheme(key))}
                    className="py-[5px] px-[18px] text-[11px] cursor-pointer flex items-center justify-between gap-4"
                    style={{ color: theme === key ? C.amber : C.text }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(128,100,50,0.12)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    {THEMES[key].name}
                    {theme === key && <span className="text-[10px]" style={{ color: C.amber }}>✓</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            {label("Help")}
            {active === "Help" && (
              <div className={`${ddClass} min-w-[200px]`} style={ddStyle}>
                <div className="pt-1 px-[18px] pb-0.5 text-[10px] tracking-[0.07em]" style={{ color: C.textFaint }}>COMMAND REFERENCE</div>
                {HELP_COMMANDS.map(cmd => (
                  <div key={cmd} className="py-0.5 px-[18px] text-[11px]" style={{ color: C.textDim, fontFamily: MONO }}>{cmd}</div>
                ))}
                <DSep />
                <DItem label="📝  Open About" onClick={dismiss(() => open("about"))} />
              </div>
            )}
          </div>
        </>
      )}

      <div className="ml-auto flex items-center gap-3">
        <button
          onClick={() => onSetWallpaperMode(WALLPAPER_MODES[(WALLPAPER_MODES.indexOf(wallpaperMode) + 1) % WALLPAPER_MODES.length])}
          title={`Wallpaper: ${WALLPAPER_MODE_LABEL[wallpaperMode]} — click to cycle`}
          className="bg-transparent border-0 cursor-pointer leading-none py-0.5 px-1.5 rounded flex items-center gap-[5px]"
          style={{ color: C.amber }}
        >
          {(() => { const Icon = WALLPAPER_MODE_ICON[wallpaperMode]; return <Icon size={13} strokeWidth={1.5} />; })()}
          <span className="text-[10px]" style={{ fontFamily: MONO }}>{WALLPAPER_MODE_LABEL[wallpaperMode]}</span>
        </button>
        <button
          onClick={() => onSetTheme(THEME_KEYS[(THEME_KEYS.indexOf(theme) + 1) % THEME_KEYS.length])}
          title={`Theme: ${THEMES[theme].name} — click to cycle`}
          className="bg-transparent border-0 cursor-pointer leading-none py-0.5 px-1.5 rounded flex items-center gap-[5px]"
          style={{ color: C.amber }}
        >
          <Palette size={13} strokeWidth={1.5} />
          <span className="text-[10px]" style={{ fontFamily: MONO }}>{THEMES[theme].name}</span>
        </button>
        <span className="text-[11px]" style={{ color: C.textFaint }}>guest</span>
        <Clock />
      </div>
    </div>
  );
}
