'use client'

import { useState, useRef, useEffect, useCallback } from "react";
import { CContext, THEMES, MONO, useC, type ThemeName } from "./theme";
import { UICtx, useWindowSize, useWM } from "./hooks";
import { WINDOW_ICONS } from "./icons";
import { Win } from "./Win";
import { About } from "./About";
import { Snake } from "./Snake";
import { Terminal } from "./Terminal";
import { Projects } from "./Projects";
import { Contact } from "./Contact";
import { SpaceInvaders } from "./SpaceInvaders";
import { MenuBar } from "./MenuBar";
import { Boot } from "./Boot";
import { Spotlight } from "./Spotlight";
import { ContextMenu } from "./ContextMenu";
import { Screensaver } from "./Screensaver";
import { Toaster } from "./Toast";
import type { WinState, ToastItem } from "./types";
import type { LucideIcon } from "lucide-react";

type DIconProps = {
  Icon: LucideIcon;
  label: string;
  x: number;
  y: number;
  onDblClick: () => void;
  onMove: (x: number, y: number) => void;
};

function DIcon({ Icon, label, x, y, onDblClick, onMove }: DIconProps) {
  const C        = useC();
  const [h, setH] = useState(false);
  const dragging  = useRef(false);
  const origin    = useRef<{ mx: number; my: number; ix: number; iy: number } | null>(null);

  const onMD = (e: React.MouseEvent) => {
    e.stopPropagation();
    origin.current  = { mx: e.clientX, my: e.clientY, ix: x, iy: y };
    dragging.current = false;
  };

  useEffect(() => {
    const mm = (e: MouseEvent) => {
      if (!origin.current) return;
      const dx = e.clientX - origin.current.mx;
      const dy = e.clientY - origin.current.my;
      if (!dragging.current && Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
      dragging.current = true;
      onMove(origin.current.ix + dx, origin.current.iy + dy);
    };
    const mu = () => { origin.current = null; dragging.current = false; };
    window.addEventListener("mousemove", mm);
    window.addEventListener("mouseup", mu);
    return () => {
      window.removeEventListener("mousemove", mm);
      window.removeEventListener("mouseup", mu);
    };
  }, [onMove]);

  return (
    <div
      onMouseDown={onMD}
      onDoubleClick={onDblClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        position: "absolute", left: x, top: y,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
        padding: "8px 12px", borderRadius: 6,
        cursor: dragging.current ? "grabbing" : "default",
        background: h ? "rgba(255,179,71,0.1)" : "transparent",
        userSelect: "none", width: 80, textAlign: "center",
        transition: "background 0.15s ease, transform 0.15s ease",
        transform: h && !dragging.current ? "scale(1.1)" : "scale(1)",
        zIndex: 1,
      }}
    >
      <Icon size={28} strokeWidth={1.5} color={h ? C.amber : C.text} />
      <span style={{ fontFamily: MONO, fontSize: 10, color: C.text, lineHeight: 1.3 }}>{label}</span>
    </div>
  );
}

const ICON_INIT_POS: Record<string, { x: number; y: number }> = {
  terminal: { x: 16, y: 44  },
  projects: { x: 16, y: 128 },
  about:    { x: 16, y: 212 },
  contact:  { x: 16, y: 296 },
  snake:    { x: 16, y: 380 },
  space:    { x: 16, y: 464 },
};

const INIT_WINS: WinState[] = [
  { id: "terminal", title: "terminal — bash",   x: 60,  y: 55,  width: 600, height: 420, z: 105, closed: false, minimized: false, maximized: false },
  { id: "projects", title: "projects/",         x: 680, y: 55,  width: 460, height: 500, z: 104, closed: true,  minimized: false, maximized: false },
  { id: "about",    title: "about.md",          x: 680, y: 55,  width: 460, height: 500, z: 103, closed: false, minimized: false, maximized: false },
  { id: "contact",  title: "contact.sh",        x: 680, y: 570, width: 360, height: 420, z: 102, closed: true,  minimized: false, maximized: false },
  { id: "snake",    title: "snake",             x: 200, y: 120, width: 540, height: 380, z: 101, closed: true,  minimized: false, maximized: false },
  { id: "space",    title: "space invaders",    x: 120, y: 60,  width: 580, height: 460, z: 100, closed: true,  minimized: false, maximized: false },
];

const DOCK = [
  { id: "terminal", label: "terminal"  },
  { id: "projects", label: "projects/" },
  { id: "about",    label: "about.md"  },
  { id: "contact",  label: "contact"   },
  { id: "snake",    label: "snake"     },
  { id: "space",    label: "invaders"  },
];

function loadLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch { return fallback; }
}

export default function PaoloOS() {
  const [booted, setBooted]     = useState(false);
  const [theme, setThemeState]  = useState<ThemeName>(() => loadLS("paoloos-theme", "sonoma" as ThemeName));
  const [iconPos, setIconPos]   = useState<Record<string, { x: number; y: number }>>(() => loadLS("paoloos-icons", ICON_INIT_POS));
  const [spotlight, setSpotlight] = useState(false);
  const [ctxMenu, setCtxMenu]   = useState<{ x: number; y: number } | null>(null);
  const [screensaver, setScreensaver] = useState(false);
  const [toasts, setToasts]     = useState<ToastItem[]>([]);

  const lastActivityRef  = useRef(Date.now());
  const screensaverRef   = useRef(false);

  const palette              = THEMES[theme];
  const { isMobile }         = useWindowSize();
  const { wins, front, toggle, close, open, move, toggleMax, reset } = useWM(INIT_WINS);

  const setTheme = useCallback((t: ThemeName) => {
    setThemeState(t);
    localStorage.setItem("paoloos-theme", t);
  }, []);

  const addToast = useCallback((title: string, sub?: string) => {
    const id = `${Date.now()}`;
    setToasts(ts => [...ts, { id, title, sub }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(ts => ts.filter(t => t.id !== id));
  }, []);

  const moveIcon = useCallback((id: string, x: number, y: number) => {
    setIconPos(p => {
      const next = { ...p, [id]: { x, y } };
      localStorage.setItem("paoloos-icons", JSON.stringify(next));
      return next;
    });
  }, []);

  const handleOpen = useCallback((target: string) => {
    const validIds = ["terminal", "projects", "about", "contact", "snake"];
    if (validIds.includes(target)) open(target);
  }, [open]);

  const handleReset = useCallback(() => {
    reset();
    setIconPos(ICON_INIT_POS);
    localStorage.removeItem("paoloos-icons");
  }, [reset]);

  const dismissScreensaver = useCallback(() => {
    screensaverRef.current   = false;
    lastActivityRef.current  = Date.now();
    setScreensaver(false);
  }, []);

  // ⌘K / Ctrl+K spotlight
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (booted) setSpotlight(s => !s);
      }
      if (e.key === "Escape") setSpotlight(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [booted]);

  // Screensaver inactivity timer (60 s)
  useEffect(() => {
    if (!booted) return;
    const reset = () => { lastActivityRef.current = Date.now(); };
    const check = setInterval(() => {
      if (screensaverRef.current) return;
      if (Date.now() - lastActivityRef.current > 60_000) {
        screensaverRef.current = true;
        setScreensaver(true);
      }
    }, 5_000);
    const events = ["mousemove", "mousedown", "keydown", "touchstart"];
    events.forEach(ev => window.addEventListener(ev, reset));
    return () => {
      clearInterval(check);
      events.forEach(ev => window.removeEventListener(ev, reset));
    };
  }, [booted]);

  const taskbar = wins.filter(w => !w.closed);
  const C = palette;

  return (
    <>
      {!booted && <Boot onDone={() => setBooted(true)} />}

      <CContext.Provider value={palette}>
        <UICtx.Provider value={{ isMobile }}>
          <div
            onContextMenu={e => {
              if (isMobile) return;
              e.preventDefault();
              setCtxMenu({ x: e.clientX, y: e.clientY });
            }}
            style={{
              width: "100%", height: "100vh", overflow: "hidden",
              backgroundColor: C.desktop,
              backgroundImage: C.desktopBg,
              backgroundSize: C.desktopBgSize,
              position: "relative", fontFamily: MONO,
              transition: "background-color 0.3s ease",
            }}
          >
            <MenuBar
              wins={wins} open={open} close={close} toggle={toggle} reset={handleReset}
              theme={theme} onSetTheme={setTheme}
            />

            {!isMobile && DOCK.map(d => {
              const Icon = WINDOW_ICONS[d.id];
              const pos  = iconPos[d.id] ?? ICON_INIT_POS[d.id];
              return (
                <DIcon
                  key={d.id}
                  Icon={Icon}
                  label={d.label}
                  x={pos.x}
                  y={pos.y}
                  onDblClick={() => open(d.id)}
                  onMove={(x, y) => moveIcon(d.id, x, y)}
                />
              );
            })}

            {wins.map(w => {
              const content =
                w.id === "terminal" ? <Terminal onOpen={handleOpen} ready={booted} /> :
                w.id === "projects" ? <Projects /> :
                w.id === "about"    ? <About /> :
                w.id === "contact"  ? <Contact onToast={addToast} /> :
                w.id === "snake"    ? <Snake /> :
                w.id === "space"    ? <SpaceInvaders /> : null;
              return (
                <Win key={w.id} w={w} onFront={front} onToggle={toggle} onClose={close} onMove={move} onMax={toggleMax}>
                  {content}
                </Win>
              );
            })}

            {/* Taskbar */}
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              height: isMobile ? 52 : 44, zIndex: 999,
              background: C.taskbarBg, backdropFilter: "blur(12px)",
              borderTop: `1px solid ${C.border}`,
              display: "flex", alignItems: "center",
              padding: isMobile ? "0 8px" : "0 16px",
              gap: isMobile ? 4 : 8,
              overflowX: isMobile ? "auto" : "visible",
            }}>
              {isMobile
                ? DOCK.map(d => {
                    const w      = wins.find(x => x.id === d.id)!;
                    const Icon   = WINDOW_ICONS[d.id];
                    const isActive = !w.closed && !w.minimized;
                    return (
                      <button
                        key={d.id}
                        onClick={() => {
                          if (w.closed)    { open(d.id);   return; }
                          if (w.minimized) { toggle(d.id); return; }
                          front(d.id);
                        }}
                        style={{
                          flex: "1 1 0", minWidth: 44, height: 40,
                          background: isActive ? "rgba(128,100,50,0.20)" : "transparent",
                          border: `1px solid ${isActive ? C.amberDim : "transparent"}`,
                          borderRadius: 8, cursor: "pointer",
                          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                          gap: 2, transition: "all 0.15s ease",
                        }}
                      >
                        <Icon size={18} strokeWidth={1.5} color={isActive ? C.amber : C.textFaint} />
                        <span style={{ fontFamily: MONO, fontSize: 8, color: isActive ? C.amber : C.textFaint, lineHeight: 1 }}>
                          {d.label.replace("/", "").replace(".md", "").replace(".sh", "")}
                        </span>
                      </button>
                    );
                  })
                : <>
                    {taskbar.map(w => {
                      const Icon = WINDOW_ICONS[w.id];
                      return (
                        <button
                          key={w.id}
                          onClick={() => w.minimized ? toggle(w.id) : front(w.id)}
                          style={{
                            background: w.minimized ? "rgba(128,100,50,0.06)" : "rgba(128,100,50,0.16)",
                            border: `1px solid ${w.minimized ? C.border : C.amberDim}`,
                            borderRadius: 4, padding: "4px 12px",
                            color: w.minimized ? C.textDim : C.amber,
                            fontFamily: MONO, fontSize: 11, cursor: "pointer",
                            display: "flex", alignItems: "center", gap: 6,
                            transition: "all 0.15s ease",
                          }}
                        >
                          {Icon && <Icon size={12} strokeWidth={1.5} />}
                          {w.title}
                        </button>
                      );
                    })}
                    <div style={{ marginLeft: "auto", fontSize: 10, color: C.textFaint, whiteSpace: "nowrap" }}>
                      dbl-click icons · drag titlebars · ⌘K spotlight · right-click desktop
                    </div>
                  </>
              }
            </div>

            {/* Overlays */}
            {spotlight && (
              <Spotlight
                onOpen={id => { handleOpen(id); addToast(`Opening ${id}…`); }}
                onSetTheme={setTheme}
                onClose={() => setSpotlight(false)}
              />
            )}

            {ctxMenu && (
              <ContextMenu
                x={ctxMenu.x} y={ctxMenu.y}
                theme={theme}
                onOpen={id => { handleOpen(id); }}
                onSetTheme={setTheme}
                onReset={handleReset}
                onClose={() => setCtxMenu(null)}
              />
            )}
          </div>

          {screensaver && <Screensaver onDismiss={dismissScreensaver} />}
          <Toaster toasts={toasts} onDismiss={dismissToast} />
        </UICtx.Provider>
      </CContext.Provider>
    </>
  );
}
