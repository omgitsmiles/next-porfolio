'use client'

import { useState } from "react";
import { CContext, DARK, LIGHT, MONO, useC } from "./theme";
import { UICtx, useWindowSize, useWM } from "./hooks";
import { Win } from "./Win";
import { About } from "./About";
import { Snake } from "./Snake";
import { Terminal } from "./Terminal";
import { Projects } from "./Projects";
import { Contact } from "./Contact";
import { MenuBar } from "./MenuBar";
import type { WinState } from "./types";

function DIcon({ icon, label, onDblClick }: { icon: string; label: string; onDblClick: () => void }) {
  const C = useC();
  const [h, setH] = useState(false);
  return (
    <div
      onDoubleClick={onDblClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
        padding: "8px 12px", borderRadius: 6, cursor: "default",
        background: h ? "rgba(255,179,71,0.1)" : "transparent",
        userSelect: "none", width: 80, textAlign: "center", transition: "background 0.15s ease",
      }}
    >
      <span style={{ fontSize: 26 }}>{icon}</span>
      <span style={{ fontFamily: MONO, fontSize: 10, color: C.text, lineHeight: 1.3 }}>{label}</span>
    </div>
  );
}

const INIT_WINS: WinState[] = [
  { id: "terminal", title: "terminal — bash", icon: "⬛", x: 60,  y: 55,  width: 600, height: 420, z: 105, closed: false, minimized: false },
  { id: "projects", title: "projects/",       icon: "📁", x: 680, y: 55,  width: 460, height: 500, z: 104, closed: true,  minimized: false },
  { id: "about",    title: "about.md",        icon: "📝", x: 680, y: 55,  width: 460, height: 500, z: 103, closed: false, minimized: false },
  { id: "contact",  title: "contact.sh",      icon: "💬", x: 680, y: 570, width: 360, height: 420, z: 102, closed: true,  minimized: false },
  { id: "snake",    title: "snake",           icon: "🐍", x: 200, y: 120, width: 540, height: 380, z: 101, closed: true,  minimized: false },
];

const DOCK = [
  { id: "terminal", icon: "⬛", label: "terminal"  },
  { id: "projects", icon: "📁", label: "projects/" },
  { id: "about",    icon: "📝", label: "about.md"  },
  { id: "contact",  icon: "💬", label: "contact"   },
  { id: "snake",    icon: "🐍", label: "snake"     },
];

export default function PaoloOS() {
  const [isDark, setIsDark] = useState(true);
  const palette = isDark ? DARK : LIGHT;
  const { isMobile } = useWindowSize();

  const { wins, front, toggle, close, open, move, reset } = useWM(INIT_WINS);

  const handleOpen = (target: string) => {
    const map: Record<string, string> = { projects: "projects", about: "about", contact: "contact", snake: "snake" };
    if (map[target]) open(map[target]);
  };

  const taskbar = wins.filter(w => !w.closed);
  const C = palette;

  return (
    <CContext.Provider value={palette}>
      <UICtx.Provider value={{ isMobile }}>
        <div style={{
          width: "100%", height: "100vh", overflow: "hidden",
          backgroundColor: C.desktop,
          backgroundImage: C.desktopBg,
          backgroundSize: C.desktopBgSize,
          position: "relative", fontFamily: MONO,
          transition: "background-color 0.3s ease",
        }}>
          <MenuBar
            wins={wins} open={open} close={close} toggle={toggle} reset={reset}
            isDark={isDark} onToggleTheme={() => setIsDark(d => !d)}
          />

          {!isMobile && (
            <div style={{ position: "absolute", top: 44, left: 16, display: "flex", flexDirection: "column", gap: 4, zIndex: 1 }}>
              {DOCK.map(d => (
                <DIcon key={d.id} icon={d.icon} label={d.label} onDblClick={() => open(d.id)} />
              ))}
            </div>
          )}

          {wins.map(w => {
            const content =
              w.id === "terminal" ? <Terminal onOpen={handleOpen} /> :
              w.id === "projects" ? <Projects /> :
              w.id === "about"    ? <About /> :
              w.id === "contact"  ? <Contact /> :
              w.id === "snake"    ? <Snake /> : null;
            return (
              <Win key={w.id} w={w} onFront={front} onToggle={toggle} onClose={close} onMove={move}>
                {content}
              </Win>
            );
          })}

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
                  const w = wins.find(x => x.id === d.id)!;
                  const isActive = !w.closed && !w.minimized;
                  return (
                    <button
                      key={d.id}
                      onClick={() => {
                        if (w.closed) { open(d.id); return; }
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
                      <span style={{ fontSize: 18 }}>{d.icon}</span>
                      <span style={{ fontFamily: MONO, fontSize: 8, color: isActive ? C.amber : C.textFaint, lineHeight: 1 }}>
                        {d.label.replace("/", "").replace(".md", "").replace(".sh", "")}
                      </span>
                    </button>
                  );
                })
              : <>
                  {taskbar.map(w => (
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
                      {w.icon} {w.title}
                    </button>
                  ))}
                  <div style={{ marginLeft: "auto", fontSize: 10, color: C.textFaint, whiteSpace: "nowrap" }}>
                    dbl-click icons to open · drag titlebars to move · type &apos;help&apos; in terminal
                  </div>
                </>
            }
          </div>
        </div>
      </UICtx.Provider>
    </CContext.Provider>
  );
}
