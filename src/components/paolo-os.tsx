'use client'

import { useState, useRef, useEffect, useCallback, createContext, useContext } from "react";
import { projectsData } from "../../lib/data";
import { sendEmail } from "../../actions/sendEmail";

// ── Palettes ──────────────────────────────────────────────────────────────────
const DARK = {
  desktop:    "#1a1a1f",
  win:        "#1e1e24",
  winBar:     "#2a2a33",
  border:     "#3a3a48",
  amber:      "#ffb347",
  amberDim:   "#c47a1a",
  text:       "#e8e8d0",
  textDim:    "#8888a0",
  textFaint:  "#55556a",
  green:      "#7ec8a0",
  red:        "#e06c75",
  blue:       "#61afef",
  cyan:       "#56b6c2",
  menubarBg:  "rgba(0,0,0,0.55)",
  taskbarBg:  "rgba(0,0,0,0.65)",
  scanline:   "rgba(0,0,0,0.07)",
  desktopBg: `
    radial-gradient(ellipse 70% 60% at 15% 15%, rgba(255,179,71,0.18) 0%, transparent 100%),
    radial-gradient(ellipse 60% 55% at 85% 90%, rgba(97,175,239,0.13) 0%, transparent 100%),
    radial-gradient(ellipse 40% 40% at 60% 30%, rgba(86,182,194,0.07) 0%, transparent 100%),
    radial-gradient(circle at center, rgba(255,255,255,0.05) 1px, transparent 1px)
  `,
  desktopBgSize: "100% 100%, 100% 100%, 100% 100%, 22px 22px",
};

const LIGHT = {
  desktop:    "#f0ece3",
  win:        "#fefdfb",
  winBar:     "#eae6dc",
  border:     "#cdc9bc",
  amber:      "#a85f08",
  amberDim:   "#7a4506",
  text:       "#1e1e26",
  textDim:    "#4a4a62",
  textFaint:  "#888898",
  green:      "#2a7a50",
  red:        "#b83232",
  blue:       "#2050b8",
  cyan:       "#0878a0",
  menubarBg:  "rgba(238,234,226,0.90)",
  taskbarBg:  "rgba(232,228,218,0.94)",
  scanline:   "rgba(0,0,0,0.025)",
  desktopBg: `
    radial-gradient(ellipse 70% 60% at 15% 15%, rgba(168,95,8,0.10) 0%, transparent 100%),
    radial-gradient(ellipse 60% 55% at 85% 90%, rgba(32,80,184,0.07) 0%, transparent 100%),
    radial-gradient(ellipse 40% 40% at 60% 30%, rgba(8,120,160,0.05) 0%, transparent 100%),
    radial-gradient(circle at center, rgba(0,0,0,0.055) 1px, transparent 1px)
  `,
  desktopBgSize: "100% 100%, 100% 100%, 100% 100%, 22px 22px",
};

type Palette = typeof DARK;
const CContext = createContext<Palette>(DARK);
const useC = () => useContext(CContext);

const RESUME_URL =
  "https://drive.google.com/file/d/1IX1TVx3z64EHtQ0f2agTOqmgJUzXvNq6/view?usp=sharing";

const MONO =
  "'JetBrains Mono','IBM Plex Mono','Fira Code',ui-monospace,monospace";

// ── Types ─────────────────────────────────────────────────────────────────────
type WinState = {
  id: string;
  title: string;
  icon: string;
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
  closed: boolean;
  minimized: boolean;
};

type HistoryItem = {
  t: "amber" | "green" | "red" | "blue" | "cyan" | "dim" | "prompt" | "text" | "cmd";
  v: string;
};

type ProjectData = typeof projectsData[number];

type Dir = { x: number; y: number };

type GameState = {
  snake: Dir[];
  dir: Dir;
  next: Dir;
  food: Dir;
  dead: boolean;
  score: number;
  started: boolean;
};

// ── UI Context (responsive) ───────────────────────────────────────────────────
const UICtx = createContext({ isMobile: false });
const useUI = () => useContext(UICtx);

function useWindowSize() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return { isMobile };
}

// ── Window Manager hook ───────────────────────────────────────────────────────
let Z = 100;
function useWM(initial: WinState[]) {
  const [wins, setWins] = useState(initial);
  const initialRef = useRef(initial);
  const front  = useCallback((id: string) => setWins(ws => ws.map(w => w.id === id ? { ...w, z: ++Z } : w)), []);
  const toggle = useCallback((id: string) => setWins(ws => ws.map(w => w.id === id ? { ...w, minimized: !w.minimized, z: w.minimized ? ++Z : w.z } : w)), []);
  const close  = useCallback((id: string) => setWins(ws => ws.map(w => w.id === id ? { ...w, closed: true, minimized: false } : w)), []);
  const open   = useCallback((id: string) => setWins(ws => ws.map(w => w.id === id ? { ...w, closed: false, minimized: false, z: ++Z } : w)), []);
  const move   = useCallback((id: string, x: number, y: number) => setWins(ws => ws.map(w => w.id === id ? { ...w, x, y } : w)), []);
  const reset  = useCallback(() => { Z = 100; setWins(initialRef.current); }, []);
  return { wins, front, toggle, close, open, move, reset };
}

// ── Draggable Window Shell ────────────────────────────────────────────────────
type WinProps = {
  w: WinState;
  onFront: (id: string) => void;
  onToggle: (id: string) => void;
  onClose: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  children: React.ReactNode;
};

function Win({ w, onFront, onToggle, onClose, onMove, children }: WinProps) {
  const C              = useC();
  const { isMobile }   = useUI();
  const dragging       = useRef(false);
  const origin         = useRef<{ mx: number; my: number; wx: number; wy: number } | null>(null);

  const onMD = (e: React.MouseEvent) => {
    if (isMobile) return;
    if ((e.target as HTMLElement).closest(".wb")) return;
    onFront(w.id);
    origin.current = { mx: e.clientX, my: e.clientY, wx: w.x, wy: w.y };
    dragging.current = true;
  };

  useEffect(() => {
    const mm = (e: MouseEvent) => {
      if (!dragging.current || !origin.current) return;
      onMove(w.id,
        origin.current.wx + e.clientX - origin.current.mx,
        origin.current.wy + e.clientY - origin.current.my);
    };
    const mu = () => { dragging.current = false; };
    window.addEventListener("mousemove", mm);
    window.addEventListener("mouseup", mu);
    return () => {
      window.removeEventListener("mousemove", mm);
      window.removeEventListener("mouseup", mu);
    };
  }, [w.id, onMove]);

  if (w.closed || w.minimized) return null;

  const mobileStyle: React.CSSProperties = isMobile ? {
    position: "fixed", left: 0, top: 28, right: 0, bottom: 44,
    width: "100%", height: "auto", zIndex: w.z,
    borderRadius: 0, border: "none",
  } : {};

  return (
    <div
      onClick={() => onFront(w.id)}
      style={{
        position: "absolute", left: w.x, top: w.y, width: w.width, height: w.height, zIndex: w.z,
        display: "flex", flexDirection: "column",
        border: `1px solid ${C.border}`, borderRadius: 6, overflow: "hidden",
        boxShadow: "0 24px 64px rgba(0,0,0,0.75)", background: C.win, userSelect: "none",
        ...mobileStyle,
      }}
    >
      {/* Titlebar */}
      <div
        onMouseDown={onMD}
        style={{
          background: C.winBar, borderBottom: `1px solid ${C.border}`,
          height: 36, display: "flex", alignItems: "center", padding: "0 12px",
          gap: 8, cursor: isMobile ? "default" : "grab", flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", gap: 6, marginRight: 4 }}>
          <button
            className="wb"
            onClick={() => onClose(w.id)}
            style={{ width: 13, height: 13, borderRadius: "50%", background: C.red, border: "none", cursor: "pointer", padding: 0 }}
          />
          <button
            className="wb"
            onClick={() => onToggle(w.id)}
            style={{ width: 13, height: 13, borderRadius: "50%", background: C.amber, border: "none", cursor: "pointer", padding: 0 }}
          />
          <div style={{ width: 13, height: 13, borderRadius: "50%", background: C.border }} />
        </div>
        <span style={{ fontFamily: MONO, fontSize: 11, color: C.textDim, letterSpacing: "0.04em" }}>
          {w.icon} {w.title}
        </span>
      </div>
      {/* Body */}
      <div style={{
        flex: 1, overflow: "auto", position: "relative",
        backgroundImage: `repeating-linear-gradient(0deg,${C.scanline} 0px,${C.scanline} 1px,transparent 1px,transparent 4px)`,
      }}>
        {children}
      </div>
    </div>
  );
}

// ── About ─────────────────────────────────────────────────────────────────────
function Divider({ label }: { label: string }) {
  const C = useC();
  return (
    <div style={{ color: C.amber, fontSize: 11, letterSpacing: "0.07em", margin: "18px 0 10px" }}>
      ── {label} {Array(Math.max(0, 38 - label.length)).fill("─").join("")}
    </div>
  );
}

function About() {
  const C = useC();

  const meta = [
    ["name",     "Paolo Alberca"],
    ["role",     "Software Engineer"],
    ["location", "New York, NY"],
    ["company",  "JPMorgan Chase"],
    ["github",   "omgitsmiles"],
    ["email",    "paolo.alberca@gmail.com"],
  ];

  const experience = [
    {
      role: "Software Engineer", company: "JPMorgan Chase", period: "Apr 2025–present",
      bullets: [
        "Data pipeline API · 12% lift in offer conversions",
        "Gremlin SME · –10% MTTR",
        "Dockerized Kafka dev environment",
        "Full testing pyramid · –16% post-deploy incidents",
      ],
    },
    {
      role: "Software Engineer", company: "WeVote", period: "Jul 2024–Feb 2025",
      bullets: [
        "DB refactor · +14% fetch speed",
        "Material UI redesign, Storybook design system",
      ],
    },
  ];

  return (
    <div style={{
      padding: "14px 18px", fontFamily: MONO, fontSize: 12,
      lineHeight: 1.75, overflow: "auto", height: "100%",
      boxSizing: "border-box", color: C.textDim,
    }}>
      {/* Meta block */}
      {meta.map(([k, v]) => (
        <div key={k} style={{ display: "flex", gap: 12, marginBottom: 2 }}>
          <span style={{ color: C.textFaint, minWidth: 72, fontSize: 11 }}>{k}</span>
          <span style={{ color: C.text }}>{v}</span>
        </div>
      ))}

      <Divider label="BIO" />
      <p style={{ margin: "0 0 8px" }}>
        I came into engineering sideways — a decade in healthcare sales and account
        management before retraining at Flatiron School in 2022. That path shapes how
        I work: I care as much about the people downstream of a system as the system itself.
      </p>
      <p style={{ margin: 0 }}>
        Currently at JPMorgan Chase building data pipelines and resiliency tooling. I also
        volunteer as a technical interviewer at the NYC Tech Talent Pipeline, helping
        graduating CS students make the same jump I did.
      </p>

      <Divider label="EXPERIENCE" />
      {experience.map(e => (
        <div key={e.company} style={{ marginBottom: 14 }}>
          <div style={{ color: C.green }}>{e.role} — {e.company}</div>
          <div style={{ color: C.textFaint, fontSize: 11, marginBottom: 4 }}>{e.period}</div>
          {e.bullets.map(b => (
            <div key={b} style={{ color: C.textDim }}>  · {b}</div>
          ))}
        </div>
      ))}

      <Divider label="EDUCATION" />
      <div>Flatiron School <span style={{ color: C.textFaint }}>· Full Stack Web Development · 2022</span></div>
      <div>SUNY Stony Brook <span style={{ color: C.textFaint }}>· B.S. Health Science</span></div>

      <Divider label="VOLUNTEERING" />
      <div style={{ color: C.green }}>NYC Tech Talent Pipeline</div>
      <div style={{ color: C.textFaint, fontSize: 11, marginBottom: 4 }}>Volunteer Technical Interviewer · Feb 2023–present</div>
      <div>Conduct technical assessments, provide feedback and mentorship to graduating CS students.</div>
    </div>
  );
}

// ── Snake ─────────────────────────────────────────────────────────────────────
const COLS_SN = 26, ROWS_SN = 18, SCORE_H = 30;

function rand(max: number) { return Math.floor(Math.random() * max); }
function newFood(snake: Dir[]): Dir {
  let f: Dir;
  do { f = { x: rand(COLS_SN), y: rand(ROWS_SN) }; }
  while (snake.some(s => s.x === f.x && s.y === f.y));
  return f;
}

const DPAD_H = 116;

function Snake() {
  const C              = useC();
  const { isMobile }   = useUI();
  const gameRef        = useRef<HTMLDivElement>(null);
  const [cell, setCell] = useState(18);
  const touchStart     = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const el = gameRef.current;
    if (!el) return;
    const calc = () => {
      const w  = el.clientWidth;
      const h  = el.clientHeight - SCORE_H;
      const cw = Math.floor((w - (COLS_SN - 1)) / COLS_SN);
      const ch = Math.floor((h - (ROWS_SN - 1)) / ROWS_SN);
      setCell(Math.max(8, Math.min(cw, ch)));
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const init = (): GameState => {
    const s: Dir[] = [{ x: 13, y: 9 }, { x: 12, y: 9 }, { x: 11, y: 9 }];
    return { snake: s, dir: { x: 1, y: 0 }, next: { x: 1, y: 0 }, food: newFood(s), dead: false, score: 0, started: false };
  };
  const [g, setG] = useState<GameState>(init);

  const tick = useCallback(() => {
    setG(prev => {
      if (prev.dead || !prev.started) return prev;
      const d    = prev.next;
      const head = { x: prev.snake[0].x + d.x, y: prev.snake[0].y + d.y };
      if (head.x < 0 || head.x >= COLS_SN || head.y < 0 || head.y >= ROWS_SN) return { ...prev, dead: true };
      if (prev.snake.some(s => s.x === head.x && s.y === head.y)) return { ...prev, dead: true };
      const ate   = head.x === prev.food.x && head.y === prev.food.y;
      const snake = [head, ...prev.snake.slice(0, ate ? undefined : -1)];
      return { ...prev, snake, dir: d, food: ate ? newFood(snake) : prev.food, score: prev.score + (ate ? 10 : 0) };
    });
  }, []);

  useEffect(() => {
    const id = setInterval(tick, 130);
    return () => clearInterval(id);
  }, [tick]);

  const steer = useCallback((key: string) => {
    setG(prev => {
      if (!prev.started || prev.dead) return prev;
      const d = prev.dir;
      const map: Record<string, Dir> = {
        ArrowUp:    d.y !== 1  ? { x: 0, y: -1 } : d,
        ArrowDown:  d.y !== -1 ? { x: 0, y: 1 }  : d,
        ArrowLeft:  d.x !== 1  ? { x: -1, y: 0 } : d,
        ArrowRight: d.x !== -1 ? { x: 1, y: 0 }  : d,
      };
      return key in map ? { ...prev, next: map[key] } : prev;
    });
  }, []);

  const startOrRestart = useCallback(() => {
    setG(prev => prev.dead ? init() : { ...prev, started: true });
  }, []);

  const handleKey = useCallback((e: React.KeyboardEvent) => {
    const k = e.key;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(k)) e.preventDefault();
    if (k === " ") { startOrRestart(); return; }
    steer(k);
  }, [steer, startOrRestart]);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const t   = e.changedTouches[0];
    const dx  = t.clientX - touchStart.current.x;
    const dy  = t.clientY - touchStart.current.y;
    const adx = Math.abs(dx);
    const ady = Math.abs(dy);
    touchStart.current = null;
    if (adx < 20 && ady < 20) { startOrRestart(); return; }
    if (adx > ady) steer(dx > 0 ? "ArrowRight" : "ArrowLeft");
    else           steer(dy > 0 ? "ArrowDown"  : "ArrowUp");
  };

  const snakeSet = new Set(g.snake.map(s => `${s.x},${s.y}`));
  const gridW    = COLS_SN * cell + (COLS_SN - 1);
  const gridH    = ROWS_SN * cell + (ROWS_SN - 1);

  const dpadBtn = (label: string, key: string): React.ReactNode => (
    <button
      onPointerDown={e => { e.preventDefault(); steer(key); }}
      style={{
        width: 48, height: 48, borderRadius: 10,
        background: C.winBar, border: `1px solid ${C.border}`,
        color: C.textDim, fontSize: 18, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        userSelect: "none", WebkitUserSelect: "none",
        touchAction: "none",
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{
      width: "100%", height: "100%",
      display: "flex", flexDirection: "column",
      fontFamily: MONO, userSelect: "none",
      backgroundColor: C.win, overflow: "hidden",
    }}>
      {/* Game area */}
      <div
        ref={gameRef}
        tabIndex={0}
        onKeyDown={handleKey}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "flex-start",
          outline: "none", overflow: "hidden", position: "relative",
          touchAction: "none",
        }}
      >
        <div style={{
          height: SCORE_H, width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
          gap: 32, fontSize: 11, color: C.textFaint, letterSpacing: "0.08em", flexShrink: 0,
        }}>
          <span>SCORE <span style={{ color: C.amber }}>{g.score}</span></span>
          <span style={{ color: C.textFaint }}>·</span>
          <span style={{ fontSize: 10, color: C.textFaint }}>
            {isMobile ? "swipe to move · tap to start" : "arrows to move · space to start"}
          </span>
        </div>

        <div style={{
          width: gridW, height: gridH,
          display: "grid",
          gridTemplateColumns: `repeat(${COLS_SN},${cell}px)`,
          gridTemplateRows: `repeat(${ROWS_SN},${cell}px)`,
          border: `1px solid ${C.border}`,
          gap: 1, background: C.border, flexShrink: 0,
        }}>
          {Array.from({ length: ROWS_SN }, (_, y) =>
            Array.from({ length: COLS_SN }, (_, x) => {
              const key    = `${x},${y}`;
              const isHead = g.snake[0]?.x === x && g.snake[0]?.y === y;
              const isBody = !isHead && snakeSet.has(key);
              const isFood = g.food.x === x && g.food.y === y;
              const r      = Math.round(cell * 0.18);
              return (
                <div key={key} style={{
                  width: cell, height: cell,
                  backgroundColor: isHead ? C.amber : isBody ? C.amberDim : C.desktop,
                  borderRadius: isHead ? r : 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {isFood && (
                    <div style={{
                      width: Math.round(cell * 0.45), height: Math.round(cell * 0.45),
                      borderRadius: "50%", background: C.red,
                      boxShadow: `0 0 ${Math.round(cell * 0.35)}px ${C.red}`,
                    }} />
                  )}
                </div>
              );
            })
          )}
        </div>

        {(!g.started || g.dead) && (
          <div style={{
            position: "absolute", top: SCORE_H, left: 0, right: 0, bottom: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{
              background: C.winBar, border: `1px solid ${C.border}`,
              borderRadius: 6, padding: "18px 32px", textAlign: "center",
            }}>
              {g.dead && <div style={{ color: C.red, fontSize: 14, marginBottom: 8, letterSpacing: "0.1em" }}>GAME OVER</div>}
              {g.dead && <div style={{ color: C.textDim, fontSize: 12, marginBottom: 12 }}>Score: {g.score}</div>}
              <div style={{ color: C.amber, fontSize: 12 }}>
                {g.dead
                  ? (isMobile ? "TAP to restart" : "SPACE to restart")
                  : (isMobile ? "TAP to start · swipe to move" : "SPACE to start · arrow keys to move")}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* D-pad — mobile only */}
      {isMobile && (
        <div style={{
          flexShrink: 0, height: DPAD_H,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 4, borderTop: `1px solid ${C.border}`, backgroundColor: C.winBar,
          paddingBottom: 8,
        }}>
          <div>{dpadBtn("▲", "ArrowUp")}</div>
          <div style={{ display: "flex", gap: 4 }}>
            {dpadBtn("◀", "ArrowLeft")}
            <button
              onPointerDown={e => { e.preventDefault(); startOrRestart(); }}
              style={{
                width: 48, height: 48, borderRadius: 10,
                background: C.win, border: `1px solid ${C.amberDim}`,
                color: C.amber, fontSize: 13, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                userSelect: "none", WebkitUserSelect: "none", touchAction: "none",
              }}
            >
              {g.started && !g.dead ? "⏸" : "▶"}
            </button>
            {dpadBtn("▶", "ArrowRight")}
          </div>
          <div>{dpadBtn("▼", "ArrowDown")}</div>
        </div>
      )}
    </div>
  );
}

// ── Terminal ──────────────────────────────────────────────────────────────────
const COMMANDS: Record<string, () => HistoryItem[]> = {
  help: () => [
    { t: "dim", v: "Available commands:" },
    { t: "cmd", v: "  whoami        → about Paolo" },
    { t: "cmd", v: "  ls            → list files" },
    { t: "cmd", v: "  cat resume    → print résumé" },
    { t: "cmd", v: "  open resume   → open résumé PDF" },
    { t: "cmd", v: "  open about    → about me window" },
    { t: "cmd", v: "  open projects → projects window" },
    { t: "cmd", v: "  open contact  → contact window" },
    { t: "cmd", v: "  open snake    → launch snake 🐍" },
    { t: "cmd", v: "  skills        → print skill list" },
    { t: "cmd", v: "  neofetch      → system info" },
    { t: "cmd", v: "  clear         → clear terminal" },
  ],
  whoami: () => [
    { t: "amber", v: "Paolo Alberca" },
    { t: "text",  v: "Software Engineer · New York, NY" },
    { t: "dim",   v: "JPMorgan Chase / WeVote / NYC Tech Talent Pipeline" },
    { t: "dim",   v: "Flatiron School alumnus. Formerly healthcare sales." },
  ],
  ls: () => [
    { t: "blue",  v: "drwxr-xr-x  projects/" },
    { t: "text",  v: "-rw-r--r--  about.txt" },
    { t: "text",  v: "-rwxr-xr-x  contact.sh" },
    { t: "green", v: "-rw-r--r--  resume.pdf" },
    { t: "cyan",  v: "-rwxr-xr-x  snake" },
    { t: "dim",   v: "-rw-r--r--  .easter_egg" },
  ],
  skills: () => [
    { t: "amber", v: "LANGUAGES" },
    { t: "text",  v: "  JavaScript · TypeScript · Java · Python · Ruby · SQL" },
    { t: "amber", v: "FRAMEWORKS" },
    { t: "text",  v: "  React · Next.js · Spring Boot · Django · Rails" },
    { t: "amber", v: "INFRA & TOOLS" },
    { t: "text",  v: "  AWS · Docker · Kafka · Terraform · Jenkins · Spinnaker" },
    { t: "amber", v: "DATABASES" },
    { t: "text",  v: "  PostgreSQL · MongoDB" },
    { t: "amber", v: "TESTING" },
    { t: "text",  v: "  JUnit · Cucumber · Jest · Gremlin" },
  ],
  "cat resume": () => [
    { t: "amber", v: "─── PAOLO ALBERCA ──────────────────────────────────" },
    { t: "dim",   v: "Software Engineer | New York, NY" },
    { t: "dim",   v: "paolo.alberca@gmail.com | paoloalberca.com" },
    { t: "text",  v: "" },
    { t: "amber", v: "EXPERIENCE" },
    { t: "green", v: "Software Engineer — JPMorgan Chase (Apr 2025–present)" },
    { t: "text",  v: "  · Data pipeline API — 12% lift in offer conversions" },
    { t: "text",  v: "  · Gremlin SME — -10% MTTR" },
    { t: "text",  v: "  · Dockerized Kafka dev environment" },
    { t: "text",  v: "  · Full testing pyramid — -16% post-deploy incidents" },
    { t: "text",  v: "" },
    { t: "green", v: "Software Engineer — WeVote (Jul 2024–Feb 2025)" },
    { t: "text",  v: "  · DB refactor — +14% fetch speed" },
    { t: "text",  v: "  · Material UI redesign, Storybook design system" },
    { t: "text",  v: "" },
    { t: "green", v: "Account Executive — OrthoPro (Sep 2019–Apr 2025)" },
    { t: "text",  v: "  · $4MM revenue, 18 accounts, team of 12" },
    { t: "text",  v: "" },
    { t: "amber", v: "EDUCATION" },
    { t: "text",  v: "  Flatiron School — Full Stack Web Dev (2022)" },
    { t: "text",  v: "  SUNY Stony Brook — B.S. Health Science" },
    { t: "dim",   v: "" },
    { t: "dim",   v: "  → run 'open resume' to download the PDF" },
  ],
  neofetch: () => [
    { t: "amber", v: "  ┌──────┐  paoloalberca@paoloOS" },
    { t: "amber", v: " ┌────────┐ ───────────────────────────" },
    { t: "amber", v: "┌──────────┐ OS: PaoloOS 1.2" },
    { t: "amber", v: "└──────────┘ Host: New York, NY" },
    { t: "amber", v: " └────────┘  Shell: bash 5.2" },
    { t: "amber", v: "  └──────┘   Stack: Javascript · Java · Python" },
    { t: "dim",   v: "             Role: Software Engineer" },
    { t: "dim",   v: "             Employer: JPMorgan Chase" },
    { t: "dim",   v: "             Uptime: Since Apr 2025" },
  ],
  ".easter_egg": () => [
    { t: "green", v: "You found it. 🥚" },
    { t: "dim",   v: "Former healthcare sales rep turned engineer." },
    { t: "dim",   v: "Volunteer technical interviewer at NYC Tech" },
    { t: "dim",   v: "Talent Pipeline. Helping others make the" },
    { t: "dim",   v: "same jump I did." },
    { t: "dim",   v: "" },
    { t: "cyan",  v: "  → try: open snake" },
  ],
};

function Terminal({ onOpen }: { onOpen: (target: string) => void }) {
  const C = useC();
  const [history, setHistory] = useState<HistoryItem[]>([
    { t: "amber", v: "PaoloOS Terminal v1.0" },
    { t: "dim",   v: "Type 'help' to get started." },
    { t: "text",  v: "" },
  ]);
  const [input, setInput]     = useState("");
  const [cmdHist, setCmdHist] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [history]);

  const run = (raw: string) => {
    const cmd    = raw.trim().toLowerCase();
    const prompt: HistoryItem = { t: "prompt", v: `guest@paoloOS:~$ ${raw}` };

    if (cmd === "clear") {
      setHistory([{ t: "dim", v: "Terminal cleared." }, { t: "text", v: "" }]);
      return;
    }
    if (cmd === "open resume") {
      window.open(RESUME_URL, "_blank");
      setHistory(h => [...h, prompt, { t: "green", v: "Opening resume.pdf in browser…" }, { t: "dim", v: "(Google Drive — download available there)" }, { t: "text", v: "" }]);
      return;
    }
    if (cmd === "vim about.txt") {
      onOpen("about");
      setHistory(h => [...h, prompt, { t: "green", v: "Opening about…" }, { t: "text", v: "" }]);
      return;
    }
    if (cmd.startsWith("open ")) {
      const target = cmd.replace("open ", "").trim();
      onOpen(target);
      setHistory(h => [...h, prompt, { t: "green", v: `Opening ${target}…` }, { t: "text", v: "" }]);
      return;
    }
    const fn  = COMMANDS[cmd];
    const out = fn ? fn() : [{ t: "red" as const, v: `Command not found: ${raw}. Try 'help'.` }];
    setHistory(h => [...h, prompt, ...out, { t: "text", v: "" }]);
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (!input.trim()) return;
      setCmdHist(h => [input, ...h]);
      setHistIdx(-1);
      run(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const n = Math.min(histIdx + 1, cmdHist.length - 1);
      setHistIdx(n); setInput(cmdHist[n] || "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const n = Math.max(histIdx - 1, -1);
      setHistIdx(n); setInput(n === -1 ? "" : cmdHist[n]);
    }
  };

  const col = (t: HistoryItem["t"]) =>
    ({ amber: C.amber, green: C.green, red: C.red, blue: C.blue, cyan: C.cyan,
       dim: C.textFaint, prompt: C.amberDim, text: C.text, cmd: C.textDim } as Record<string, string>)[t] ?? C.text;

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      style={{ padding: "12px 16px", fontFamily: MONO, fontSize: 13, lineHeight: 1.6, cursor: "text", height: "100%", boxSizing: "border-box" }}
    >
      {history.map((l, i) => (
        <div key={i} style={{ color: col(l.t), whiteSpace: "pre-wrap", minHeight: "1.6em" }}>{l.v}</div>
      ))}
      <div style={{ display: "flex", alignItems: "center", marginTop: 2 }}>
        <span style={{ color: C.amberDim, marginRight: 8 }}>guest@paoloOS:~$</span>
        <input
          ref={inputRef}
          autoFocus
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          style={{ background: "transparent", border: "none", outline: "none", color: C.amber, fontFamily: MONO, fontSize: 13, flex: 1, caretColor: C.amber }}
        />
      </div>
      <div ref={bottomRef} />
    </div>
  );
}

// ── Projects ──────────────────────────────────────────────────────────────────
function Projects() {
  const C = useC();
  const [active, setActive] = useState<ProjectData | null>(null);

  return (
    <div style={{
      fontFamily: MONO, height: "100%", boxSizing: "border-box",
      display: "flex", flexDirection: "column",
    }}>
      {/* Scrollable grid */}
      <div style={{ flex: 1, overflow: "auto", padding: "12px 14px 0" }}>
        <div style={{ fontSize: 11, color: C.textFaint, marginBottom: 10 }}>
          ~/projects — {projectsData.length} items
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {projectsData.map((p, i) => {
            const isActive = active?.title === p.title;
            return (
              <div
                key={i}
                onClick={() => setActive(isActive ? null : p as ProjectData)}
                style={{
                  position: "relative", overflow: "hidden",
                  border: `1px solid ${isActive ? C.amber : C.border}`,
                  borderRadius: 4, padding: "10px 12px", cursor: "pointer",
                  transition: "border-color 0.15s ease",
                  minHeight: 68,
                }}
              >
                <img
                  src={p.imageUrl.src}
                  alt=""
                  aria-hidden
                  style={{
                    position: "absolute", inset: 0,
                    width: "100%", height: "100%",
                    objectFit: "cover",
                    opacity: isActive ? 0.22 : 0.10,
                    filter: "blur(2px) saturate(0.6)",
                    transition: "opacity 0.2s ease",
                    pointerEvents: "none",
                  }}
                />
                <div style={{
                  position: "absolute", inset: 0,
                  backgroundColor: C.win,
                  opacity: isActive ? 0.55 : 0.72,
                  transition: "opacity 0.2s ease",
                  pointerEvents: "none",
                }} />
                <div style={{ position: "relative" }}>
                  <div style={{ fontSize: 12, color: C.amber, fontWeight: 600, lineHeight: 1.3 }}>
                    {p.title}
                  </div>
                  <div style={{ fontSize: 10, color: C.textFaint, marginTop: 3 }}>
                    {p.tags.slice(0, 2).join(" · ")}
                    {p.tags.length > 2 && ` +${p.tags.length - 2}`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail panel */}
      {active && (
        <div style={{
          borderTop: `1px solid ${C.border}`, padding: "12px 14px",
          flexShrink: 0, background: C.win,
        }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
            <img
              src={active.imageUrl.src}
              alt={active.title}
              style={{
                width: 72, height: 46, objectFit: "cover",
                borderRadius: 3, border: `1px solid ${C.border}`, flexShrink: 0,
              }}
            />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, color: C.amber, marginBottom: 4 }}>{active.title}</div>
              <div style={{ fontSize: 11, color: C.textDim, lineHeight: 1.6 }}>{active.description}</div>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
            {active.tags.map(s => (
              <span key={s} style={{
                fontSize: 10, color: C.green,
                border: `1px solid ${C.green}33`, borderRadius: 2, padding: "2px 6px",
              }}>{s}</span>
            ))}
          </div>
          {active.repo && (
            <a
              href={active.repo} target="_blank" rel="noreferrer"
              style={{ fontSize: 11, color: C.blue, textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
              onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
            >
              → {active.repo}
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ── Contact ───────────────────────────────────────────────────────────────────
type SendStatus = "idle" | "sending" | "ok" | "error";

function Contact() {
  const C = useC();
  const [compose, setCompose] = useState(false);
  const [form, setForm]       = useState({ email: "", subject: "", message: "" });
  const [status, setStatus]   = useState<SendStatus>("idle");
  const [errMsg, setErrMsg]   = useState("");

  const links = [
    { label: "email",    val: "paolo.alberca@gmail.com", href: "mailto:paolo.alberca@gmail.com" },
    { label: "phone",    val: "(+1) 516-508-1259",        href: "tel:+15165081259" },
    { label: "resume",   val: "resume.pdf →",             href: RESUME_URL },
    { label: "blog",     val: "@paolo.alberca →",         href: "https://medium.com/@paolo.alberca" },
    { label: "github",   val: "omgitsmiles",               href: "https://github.com/omgitsmiles" },
    { label: "linkedin", val: "paolo-alberca",             href: "https://linkedin.com/in/paolo-alberca" },
  ];

  const field: React.CSSProperties = {
    width: "100%", boxSizing: "border-box",
    background: C.win, border: `1px solid ${C.border}`,
    borderRadius: 3, color: C.text, fontFamily: MONO, fontSize: 12,
    padding: "6px 10px", outline: "none",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    const fd = new FormData();
    fd.append("senderEmail", form.email);
    fd.append("subject",     form.subject);
    fd.append("message",     form.message);
    const result = await sendEmail(fd);
    if ("error" in result && result.error) {
      setStatus("error");
      setErrMsg(result.error);
    } else {
      setStatus("ok");
    }
  };

  const resetCompose = () => {
    setCompose(false);
    setStatus("idle");
    setErrMsg("");
    setForm({ email: "", subject: "", message: "" });
  };

  return (
    <div style={{ position: "relative", height: "100%", fontFamily: MONO }}>
      {/* ── Main contact info ── */}
      <div style={{ padding: "14px 18px" }}>
        <div style={{ color: C.amber, marginBottom: 14, fontSize: 11, letterSpacing: "0.1em" }}>
          contact.sh — executable
        </div>
        {links.map(l => (
          <div key={l.label} style={{ display: "flex", gap: 12, marginBottom: 10, alignItems: "center" }}>
            <span style={{ color: C.textFaint, minWidth: 64, fontSize: 11 }}>{l.label}</span>
            <a
              href={l.href}
              target={l.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              style={{
                color: l.label === "resume" || l.label === "blog" ? C.green : C.amber,
                textDecoration: "none", fontSize: 12,
              }}
              onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
              onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
            >
              {l.val}
            </a>
          </div>
        ))}
        <div style={{ marginTop: 16, borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
          <div style={{ fontSize: 11, color: C.textFaint, marginBottom: 12, whiteSpace: "pre" }}>
            {"# Open to new opportunities.\n# Based in NYC — hybrid or remote."}
          </div>
          <button
            onClick={() => setCompose(true)}
            style={{
              background: "rgba(255,179,71,0.12)", border: `1px solid ${C.amberDim}`,
              borderRadius: 3, color: C.amber, fontFamily: MONO, fontSize: 11,
              padding: "5px 14px", cursor: "pointer",
            }}
          >
            compose message →
          </button>
        </div>
      </div>

      {/* ── Compose modal overlay ── */}
      {compose && (
        <div style={{
          position: "absolute", inset: 0, background: C.win,
          padding: "16px 18px", display: "flex", flexDirection: "column",
          zIndex: 10,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ color: C.amber, fontSize: 11, letterSpacing: "0.1em" }}>compose.sh</span>
            <button
              onClick={resetCompose}
              style={{ background: "none", border: "none", color: C.textFaint, cursor: "pointer", fontSize: 13, fontFamily: MONO }}
            >
              ×
            </button>
          </div>

          {status === "ok" ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <div style={{ color: C.green, fontSize: 13 }}>✓ message sent</div>
              <div style={{ color: C.textFaint, fontSize: 11 }}>I'll get back to you soon.</div>
              <button
                onClick={resetCompose}
                style={{ marginTop: 8, background: "none", border: `1px solid ${C.border}`, borderRadius: 3, color: C.textDim, fontFamily: MONO, fontSize: 11, padding: "4px 14px", cursor: "pointer" }}
              >
                close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
              <div>
                <div style={{ fontSize: 10, color: C.textFaint, marginBottom: 4 }}>your email</div>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  style={field}
                  onFocus={e => (e.currentTarget.style.borderColor = C.amberDim)}
                  onBlur={e => (e.currentTarget.style.borderColor = C.border)}
                />
              </div>
              <div>
                <div style={{ fontSize: 10, color: C.textFaint, marginBottom: 4 }}>subject</div>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  style={field}
                  onFocus={e => (e.currentTarget.style.borderColor = C.amberDim)}
                  onBlur={e => (e.currentTarget.style.borderColor = C.border)}
                />
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 10, color: C.textFaint, marginBottom: 4 }}>message</div>
                <textarea
                  required
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  style={{ ...field, flex: 1, resize: "none", minHeight: 90 }}
                  onFocus={e => (e.currentTarget.style.borderColor = C.amberDim)}
                  onBlur={e => (e.currentTarget.style.borderColor = C.border)}
                />
              </div>
              {status === "error" && (
                <div style={{ color: C.red, fontSize: 11 }}>⚠ {errMsg}</div>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button
                  type="button"
                  onClick={resetCompose}
                  style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 3, color: C.textDim, fontFamily: MONO, fontSize: 11, padding: "5px 14px", cursor: "pointer" }}
                >
                  cancel
                </button>
                <button
                  type="submit"
                  disabled={status === "sending"}
                  style={{
                    background: status === "sending" ? "rgba(255,179,71,0.06)" : "rgba(255,179,71,0.15)",
                    border: `1px solid ${C.amberDim}`, borderRadius: 3,
                    color: status === "sending" ? C.textFaint : C.amber,
                    fontFamily: MONO, fontSize: 11, padding: "5px 14px", cursor: status === "sending" ? "default" : "pointer",
                  }}
                >
                  {status === "sending" ? "sending…" : "send →"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

// ── MenuBar ───────────────────────────────────────────────────────────────────
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

type MenuBarProps = {
  wins: WinState[];
  open: (id: string) => void;
  close: (id: string) => void;
  toggle: (id: string) => void;
  reset: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
};

function MenuBar({ wins, open, close, toggle, reset, isDark, onToggleTheme }: MenuBarProps) {
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

      {/* ── File / View / Help — desktop only ── */}
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

// ── Clock ─────────────────────────────────────────────────────────────────────
function Clock() {
  const C = useC();
  const [t, setT] = useState<Date | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

// ── Desktop Icon ──────────────────────────────────────────────────────────────
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

// ── Main App ──────────────────────────────────────────────────────────────────
const INIT_WINS: WinState[] = [
  { id: "terminal", title: "terminal — bash", icon: "⬛", x: 60,  y: 55,  width: 600, height: 420, z: 105, closed: false, minimized: false },
  { id: "projects", title: "projects/",       icon: "📁", x: 680, y: 55,  width: 460, height: 500, z: 104, closed: true,  minimized: false },
  { id: "about",    title: "about.md",        icon: "📝", x: 680, y: 55,  width: 460, height: 500, z: 103, closed: false, minimized: false },
  { id: "contact",  title: "contact.sh",  icon: "💬", x: 680, y: 570, width: 360, height: 420, z: 102, closed: true,  minimized: false },
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

          {/* Desktop icons — hidden on mobile */}
          {!isMobile && (
            <div style={{ position: "absolute", top: 44, left: 16, display: "flex", flexDirection: "column", gap: 4, zIndex: 1 }}>
              {DOCK.map(d => (
                <DIcon key={d.id} icon={d.icon} label={d.label} onDblClick={() => open(d.id)} />
              ))}
            </div>
          )}

          {/* Windows */}
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
              ? /* Mobile: icon-only tab buttons for all windows */
                DOCK.map(d => {
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
              : /* Desktop: labeled window buttons + hint */
                <>
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
