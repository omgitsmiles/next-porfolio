'use client'

import { useRef, useEffect, useState, useCallback } from "react";
import { useC, MONO } from "./theme";
import { useUI } from "./hooks";

/* ── Leaderboard ─────────────────────────────────────── */

type ScoreEntry = { name: string; score: number; ts: number };
const LS_KEY = "paoloos-space-scores";

const loadScores = (): ScoreEntry[] => {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]") as ScoreEntry[]; }
  catch { return []; }
};

const persistScore = (e: ScoreEntry): ScoreEntry[] => {
  const all = [...loadScores(), e].sort((a, b) => b.score - a.score).slice(0, 10);
  localStorage.setItem(LS_KEY, JSON.stringify(all));
  return all;
};

const qualifies = (score: number): boolean => {
  const s = loadScores();
  return score > 0 && (s.length < 10 || score > s[s.length - 1].score);
};

/* ── Virtual coordinate space ────────────────────────── */

const VW = 440, VH = 310;
const COLS = 11, ROWS_SN = 5;
const AW = 22, AH = 13, AGX = 12, AGY = 13; // alien w/h/gap-x/gap-y
const FORM_W = COLS * AW + (COLS - 1) * AGX; // 374
const PLY = VH - 26;   // player y (top edge)
const SHY = VH - 76;   // shield y (top edge)
const SB  = 4;          // shield block size (virtual px)
const SC  = 12;         // shield columns

const SHIELD_SHAPE = [
  [0,1,1,1,1,1,1,1,1,1,1,0],
  [1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,0,0,0,0,0,0,0,0,1,1],
];
const SH_ROWS = SHIELD_SHAPE.length; // 5
const SW_V = SC * SB; // 48 virtual units wide

// Score per row top→bottom
const ROW_PTS = [30, 20, 20, 10, 10];

// ── Pixel sprites (per alien type, 2 frames each) ────
// Each is an array of rows, each row a bitmask as number[]
type Sprite = number[][];
type SprPair = [Sprite, Sprite];

// Type A – top row (30 pts)
const SPR_A: SprPair = [
  [[0,0,0,1,0,0,0,0,1,0,0,0],[0,0,1,1,1,1,1,1,1,1,0,0],[0,1,1,0,1,1,1,1,0,1,1,0],
   [1,1,1,1,1,1,1,1,1,1,1,1],[1,0,1,1,1,1,1,1,1,1,0,1],[1,0,1,0,0,0,0,0,0,1,0,1],
   [0,0,0,1,1,0,0,1,1,0,0,0]],
  [[0,0,0,1,0,0,0,0,1,0,0,0],[1,0,1,1,1,1,1,1,1,1,0,1],[1,1,1,0,1,1,1,1,0,1,1,1],
   [0,1,1,1,1,1,1,1,1,1,1,0],[0,0,1,1,1,1,1,1,1,1,0,0],[0,0,1,0,0,0,0,0,0,1,0,0],
   [0,0,1,0,0,0,0,0,0,1,0,0]],
];
// Type B – middle rows (20 pts)
const SPR_B: SprPair = [
  [[0,0,1,0,0,0,0,0,1,0,0],[0,0,0,1,0,0,0,1,0,0,0],[0,0,1,1,1,1,1,1,1,0,0],
   [0,1,1,0,1,1,1,0,1,1,0],[1,1,1,1,1,1,1,1,1,1,1],[0,1,0,1,1,1,1,1,0,1,0],
   [1,0,0,0,0,0,0,0,0,0,1]],
  [[0,0,1,0,0,0,0,0,1,0,0],[0,1,0,1,0,0,0,1,0,1,0],[1,0,1,1,1,1,1,1,1,0,1],
   [1,1,1,0,1,1,1,0,1,1,1],[0,1,1,1,1,1,1,1,1,1,0],[0,0,0,1,1,1,1,1,0,0,0],
   [0,0,1,0,0,0,0,0,1,0,0]],
];
// Type C – bottom rows (10 pts)
const SPR_C: SprPair = [
  [[0,0,0,1,1,1,1,0,0,0],[0,0,1,1,1,1,1,1,0,0],[0,1,1,1,1,1,1,1,1,0],
   [1,1,0,1,1,1,1,0,1,1],[1,1,1,1,1,1,1,1,1,1],[0,0,1,0,0,0,0,1,0,0],
   [0,1,0,0,0,0,0,0,1,0]],
  [[0,0,0,1,1,1,1,0,0,0],[0,0,1,1,1,1,1,1,0,0],[0,1,1,1,1,1,1,1,1,0],
   [1,1,0,1,1,1,1,0,1,1],[1,1,1,1,1,1,1,1,1,1],[0,1,0,1,0,0,1,0,1,0],
   [1,0,1,0,0,0,0,1,0,1]],
];
const SPR: [SprPair, SprPair, SprPair, SprPair, SprPair] = [SPR_A, SPR_B, SPR_B, SPR_C, SPR_C];

function drawSprite(ctx: CanvasRenderingContext2D, spr: Sprite, x: number, y: number, pw: number, ph: number) {
  const rows = spr.length, cols = spr[0].length;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (spr[r][c]) ctx.fillRect(Math.round(x + c*pw), Math.round(y + r*ph), Math.round(pw), Math.round(ph));
    }
  }
}

/* ── Game state (tracked in ref) ────────────────────── */

type Shield = { x: number; y: number; blocks: boolean[][] };

interface GS {
  aliens: boolean[][];       // [row][col] alive
  formX: number; formY: number;
  formDir: number;           // 1 = right, -1 = left
  formVx: number;            // virtual px per step
  stepTimer: number;         // ms until next step
  stepInterval: number;      // ms between steps
  playerX: number;           // player center x
  playerVx: number;          // player velocity x
  bullets: {x:number;y:number}[];
  bombs:   {x:number;y:number;zig:number}[];
  shields: Shield[];
  score: number; lives: number;
  lastShot: number;
  bombTimer: number; bombInterval: number;
  status: 'idle'|'playing'|'dying'|'gameover';
  dyingTimer: number;
  level: number;
  animFrame: number; animTimer: number;
  ufo: {x:number;dir:number} | null; ufoTimer: number;
  aliveCount: number;
}

function makeShields(): Shield[] {
  const spacing = (VW - 4 * SW_V) / 5;
  return Array.from({ length: 4 }, (_, i) => ({
    x: spacing + i * (SW_V + spacing),
    y: SHY,
    blocks: SHIELD_SHAPE.map(row => row.map(v => v === 1)),
  }));
}

function makeGame(score = 0, lives = 3, level = 1): GS {
  const formX = (VW - FORM_W) / 2;
  return {
    aliens: Array.from({ length: ROWS_SN }, () => Array(COLS).fill(true)),
    formX, formY: 44,
    formDir: 1,
    formVx: 4 + level * 0.5,
    stepTimer: 0, stepInterval: 700 - level * 40,
    playerX: VW / 2, playerVx: 0,
    bullets: [], bombs: [],
    shields: makeShields(),
    score, lives,
    lastShot: 0, bombTimer: 0, bombInterval: Math.max(500, 1400 - level * 100),
    status: 'idle',
    dyingTimer: 0, level,
    animFrame: 0, animTimer: 0,
    ufo: null, ufoTimer: 8000 + Math.random() * 6000,
    aliveCount: COLS * ROWS_SN,
  };
}

/* ── Canvas drawing ──────────────────────────────────── */

function draw(ctx: CanvasRenderingContext2D, g: GS, s: number, ox: number, oy: number, palette: {
  text: string; amber: string; amberDim: string; green: string; red: string;
  cyan: string; blue: string; textFaint: string; border: string; win: string; desktop: string;
}) {
  const cw = ctx.canvas.width, ch = ctx.canvas.height;
  ctx.fillStyle = palette.desktop;
  ctx.fillRect(0, 0, cw, ch);

  const vx = (v: number) => Math.round(ox + v * s);
  const vy = (v: number) => Math.round(oy + v * s);
  const vs = (v: number) => Math.max(1, Math.round(v * s));

  // HUD
  ctx.fillStyle = palette.amber;
  ctx.font = `${vs(10)}px monospace`;
  ctx.textAlign = "left";
  ctx.fillText(`SCORE  ${g.score}`, vx(8), vy(14));
  ctx.textAlign = "right";
  ctx.fillText(`LEVEL ${g.level}`, vx(VW - 8), vy(14));
  ctx.textAlign = "center";
  ctx.fillStyle = palette.red;
  ctx.fillText("♥".repeat(g.lives), vx(VW / 2), vy(14));

  // Ground line
  ctx.fillStyle = palette.textFaint;
  ctx.fillRect(vx(0), vy(VH - 14), vx(VW), vs(1));

  // Shields
  for (const sh of g.shields) {
    for (let r = 0; r < SH_ROWS; r++) {
      for (let c = 0; c < SC; c++) {
        if (!sh.blocks[r]?.[c]) continue;
        const hp = (sh.blocks[r].filter(Boolean).length / SC);
        ctx.fillStyle = hp > 0.6 ? palette.green : hp > 0.3 ? palette.cyan : palette.blue;
        ctx.fillRect(vx(sh.x + c * SB), vy(sh.y + r * SB), vs(SB - 0.5), vs(SB - 0.5));
      }
    }
  }

  // Aliens
  for (let row = 0; row < ROWS_SN; row++) {
    for (let col = 0; col < COLS; col++) {
      if (!g.aliens[row][col]) continue;
      const ax = g.formX + col * (AW + AGX);
      const ay = g.formY + row * (AH + AGY);
      const spr = SPR[row as 0|1|2|3|4];
      const frame = spr[g.animFrame as 0|1];
      const spCols = frame[0].length;
      const spRows = frame.length;
      const pw = (AW * s) / spCols;
      const ph = (AH * s) / spRows;
      ctx.fillStyle = row === 0 ? palette.green : row <= 2 ? palette.cyan : palette.blue;
      drawSprite(ctx, frame, vx(ax), vy(ay), pw, ph);
    }
  }

  // UFO
  if (g.ufo) {
    ctx.fillStyle = palette.red;
    const ux = vx(g.ufo.x), uy = vy(20);
    const uw = vs(28), uh = vs(10);
    ctx.beginPath();
    ctx.ellipse(ux + uw/2, uy + uh*0.6, uw/2, uh*0.6, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = palette.amber;
    ctx.beginPath();
    ctx.ellipse(ux + uw/2, uy + uh*0.3, uw*0.3, uh*0.35, 0, 0, Math.PI*2);
    ctx.fill();
  }

  // Player bullets
  ctx.fillStyle = palette.amber;
  for (const b of g.bullets) ctx.fillRect(vx(b.x) - vs(1), vy(b.y), vs(2), vs(10));

  // Bombs (zigzag visual)
  ctx.fillStyle = palette.red;
  for (const b of g.bombs) {
    const bx = vx(b.x + (b.zig % 2 === 0 ? -1 : 1));
    ctx.fillRect(bx - vs(1), vy(b.y), vs(3), vs(8));
  }

  // Player
  if (g.status !== 'dying' || (g.dyingTimer % 200 < 100)) {
    ctx.fillStyle = palette.amber;
    const px = vx(g.playerX - 16), py = vy(PLY), pw2 = vs(32), ph2 = vs(14);
    ctx.fillRect(px + pw2*0.3, py, pw2*0.4, ph2*0.35);
    ctx.fillRect(px + pw2*0.1, py + ph2*0.35, pw2*0.8, ph2*0.45);
    ctx.fillRect(px, py + ph2*0.8, pw2, ph2*0.2);
    ctx.fillStyle = palette.win;
    ctx.fillRect(px + pw2*0.38, py + ph2*0.05, pw2*0.24, ph2*0.28);
  }

  // Overlays
  if (g.status === 'idle') {
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(vx(VW*0.18), vy(VH*0.3), vx(VW*0.64), vy(VH*0.32));
    ctx.fillStyle = palette.amber;
    ctx.font = `bold ${vs(14)}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("SPACE INVADERS", vx(VW/2), vy(VH*0.38));
    ctx.font = `${vs(9)}px monospace`;
    ctx.fillStyle = palette.textFaint;
    ctx.fillText("SPACE / TAP to start", vx(VW/2), vy(VH*0.5));
  }
  if (g.status === 'gameover') {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(vx(VW*0.18), vy(VH*0.35), vx(VW*0.64), vy(VH*0.28));
    ctx.fillStyle = palette.red;
    ctx.font = `bold ${vs(14)}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", vx(VW/2), vy(VH*0.43));
    ctx.fillStyle = palette.amber;
    ctx.font = `${vs(9)}px monospace`;
    ctx.fillText(`SCORE: ${g.score}`, vx(VW/2), vy(VH*0.52));
  }
}

/* ── Collision helpers ───────────────────────────────── */

function rectHit(ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function hitShields(shields: Shield[], x: number, y: number, w: number, h: number): boolean {
  for (const sh of shields) {
    for (let r = 0; r < SH_ROWS; r++) {
      for (let c = 0; c < SC; c++) {
        if (!sh.blocks[r]?.[c]) continue;
        if (rectHit(x, y, w, h, sh.x + c*SB, sh.y + r*SB, SB, SB)) {
          sh.blocks[r][c] = false;
          return true;
        }
      }
    }
  }
  return false;
}

/* ── Game update ─────────────────────────────────────── */

function update(g: GS, dt: number, onGameOver: (score: number) => void, onWin: () => void) {
  if (g.status === 'idle') return;

  // Animation frame toggle
  g.animTimer += dt;
  if (g.animTimer > 500) { g.animFrame = g.animFrame === 0 ? 1 : 0; g.animTimer = 0; }

  if (g.status === 'dying') {
    g.dyingTimer -= dt;
    if (g.dyingTimer <= 0) {
      g.status = g.lives > 0 ? 'playing' : 'gameover';
      if (g.status === 'gameover') onGameOver(g.score);
    }
    return;
  }

  // Player move (keys handled in component, velocity set)
  g.playerX = Math.max(16, Math.min(VW - 16, g.playerX + g.playerVx * (dt / 16)));

  // Alien step
  g.stepTimer -= dt;
  if (g.stepTimer <= 0) {
    // Check bounds
    let minX = VW, maxX = 0;
    for (let r = 0; r < ROWS_SN; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!g.aliens[r][c]) continue;
        const ax = g.formX + c * (AW + AGX);
        if (ax < minX) minX = ax;
        if (ax + AW > maxX) maxX = ax + AW;
      }
    }
    const nextX = g.formX + g.formVx * g.formDir;
    if ((g.formDir > 0 && maxX + g.formVx >= VW - 4) ||
        (g.formDir < 0 && minX - g.formVx <= 4)) {
      g.formY += AH * 0.75;
      g.formDir *= -1;
    } else {
      g.formX = nextX;
    }
    // Speed up as aliens die
    g.stepInterval = Math.max(80, (g.aliveCount / (COLS * ROWS_SN)) * (700 - g.level * 40));
    g.stepTimer = g.stepInterval;
  }

  // UFO
  g.ufoTimer -= dt;
  if (g.ufoTimer <= 0 && !g.ufo) {
    g.ufo = { x: -30, dir: 1 };
    g.ufoTimer = 10000 + Math.random() * 6000;
  }
  if (g.ufo) {
    g.ufo.x += g.ufo.dir * 1.5 * (dt / 16);
    if (g.ufo.x > VW + 10) g.ufo = null;
  }

  // Alien shooting
  g.bombTimer -= dt;
  if (g.bombTimer <= 0) {
    const alive: [number,number][] = [];
    for (let r = 0; r < ROWS_SN; r++)
      for (let c = 0; c < COLS; c++)
        if (g.aliens[r][c]) alive.push([r, c]);
    if (alive.length > 0) {
      const [ar, ac] = alive[Math.floor(Math.random() * alive.length)];
      g.bombs.push({ x: g.formX + ac*(AW+AGX) + AW/2, y: g.formY + ar*(AH+AGY) + AH, zig: 0 });
    }
    g.bombTimer = g.bombInterval;
  }

  // Move bullets
  const BSPD = 6;
  g.bullets = g.bullets.filter(b => {
    b.y -= BSPD * (dt / 16);
    if (b.y < 18) return false;
    // hit shield
    if (hitShields(g.shields, b.x - 1, b.y, 2, 10)) return false;
    // hit UFO
    if (g.ufo && rectHit(b.x-1, b.y, 2, 10, g.ufo.x, 18, 28, 10)) {
      g.score += 150;
      g.ufo = null;
      return false;
    }
    // hit alien
    for (let row = 0; row < ROWS_SN; row++) {
      for (let col = 0; col < COLS; col++) {
        if (!g.aliens[row][col]) continue;
        const ax = g.formX + col*(AW+AGX);
        const ay = g.formY + row*(AH+AGY);
        if (rectHit(b.x-1, b.y, 2, 10, ax, ay, AW, AH)) {
          g.aliens[row][col] = false;
          g.aliveCount--;
          g.score += ROW_PTS[row];
          if (g.aliveCount === 0) onWin();
          return false;
        }
      }
    }
    return true;
  });

  // Move bombs
  const BOMSPD = 3;
  g.bombs = g.bombs.filter(b => {
    b.y += BOMSPD * (dt / 16);
    b.zig++;
    if (b.y > VH - 12) return false;
    if (hitShields(g.shields, b.x - 2, b.y, 4, 8)) return false;
    // hit player
    if (rectHit(b.x-2, b.y, 4, 8, g.playerX-16, PLY, 32, 14)) {
      g.lives--;
      g.status = 'dying';
      g.dyingTimer = 1200;
      g.bombs = [];
      if (g.lives <= 0) onGameOver(g.score);
      return false;
    }
    return true;
  });

  // Aliens reach bottom
  for (let row = 0; row < ROWS_SN; row++) {
    for (let col = 0; col < COLS; col++) {
      if (g.aliens[row][col] && g.formY + row*(AH+AGY) + AH >= SHY) {
        onGameOver(g.score);
        return;
      }
    }
  }
}

/* ── Component ───────────────────────────────────────── */

const DPAD_H_SI = 134;

export function SpaceInvaders() {
  const C = useC();
  const { isMobile } = useUI();
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef     = useRef<number>(0);
  const prevTime    = useRef<number>(0);
  const keys        = useRef<Set<string>>(new Set());
  const mobileLeft  = useRef(false);
  const mobileRight = useRef(false);
  const mobileFire  = useRef(false);

  const [overlay, setOverlay] = useState<'none'|'gameover'|'nameEntry'|'leaderboard'>('none');
  const [finalScore, setFinalScore] = useState(0);
  const [nameInput, setNameInput] = useState("");
  const [scores, setScores]     = useState<ScoreEntry[]>([]);
  const nameRef = useRef<HTMLInputElement>(null);

  const game = useRef<GS>(makeGame());

  const palette = {
    text: C.text, amber: C.amber, amberDim: C.amberDim,
    green: C.green, red: C.red, cyan: C.cyan, blue: C.blue,
    textFaint: C.textFaint, border: C.border,
    win: C.win, desktop: C.desktop,
  };
  const paletteRef = useRef(palette);
  paletteRef.current = palette;

  const scale = useRef(1);
  const offsetX = useRef(0);
  const offsetY = useRef(0);

  const computeScale = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cw = canvas.clientWidth, ch = canvas.clientHeight;
    const s = Math.min(cw / VW, ch / VH);
    scale.current   = s;
    offsetX.current = (cw - VW * s) / 2;
    offsetY.current = Math.max(0, (ch - VH * s) / 2);
    canvas.width  = cw;
    canvas.height = ch;
  }, []);

  // Resize observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(computeScale);
    ro.observe(el);
    computeScale();
    return () => ro.disconnect();
  }, [computeScale]);

  const handleGameOver = useCallback((score: number) => {
    game.current.status = 'gameover';
    setFinalScore(score);
    setTimeout(() => {
      if (qualifies(score)) {
        setOverlay('nameEntry');
        setTimeout(() => nameRef.current?.focus(), 50);
      } else {
        setScores(loadScores());
        setOverlay('gameover');
      }
    }, 1400);
  }, []);

  const handleWin = useCallback(() => {
    const g = game.current;
    const nextLevel = g.level + 1;
    const preserved = makeGame(g.score, g.lives, nextLevel);
    game.current = preserved;
    game.current.status = 'playing';
  }, []);

  // Game loop
  useEffect(() => {
    const loop = (ts: number) => {
      const dt = Math.min(ts - (prevTime.current || ts), 50);
      prevTime.current = ts;
      const g = game.current;

      // Keyboard velocity
      if (g.status === 'playing') {
        const left  = keys.current.has("ArrowLeft")  || mobileLeft.current;
        const right = keys.current.has("ArrowRight") || mobileRight.current;
        g.playerVx = left ? -3 : right ? 3 : 0;

        const fire = keys.current.has(" ") || mobileFire.current;
        if (fire && ts - g.lastShot > 400 && g.bullets.length < 2) {
          g.bullets.push({ x: g.playerX, y: PLY });
          g.lastShot = ts;
          mobileFire.current = false;
        }
      }

      update(g, dt, handleGameOver, handleWin);

      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) draw(ctx, g, scale.current, offsetX.current, offsetY.current, paletteRef.current);

      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [handleGameOver, handleWin]);

  const startGame = useCallback(() => {
    game.current = makeGame();
    game.current.status = 'playing';
    setOverlay('none');
  }, []);

  const onKey = useCallback((e: React.KeyboardEvent) => {
    const k = e.key;
    if ([" ", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(k)) e.preventDefault();
    if (k === " " && (game.current.status === 'idle' || game.current.status === 'gameover')) {
      startGame(); return;
    }
    keys.current.add(k);
  }, [startGame]);

  const onKeyUp = useCallback((e: React.KeyboardEvent) => { keys.current.delete(e.key); }, []);

  const submitName = useCallback(() => {
    const name = (nameInput.trim() || "ACE").slice(0, 8).toUpperCase();
    const all = persistScore({ name, score: finalScore, ts: Date.now() });
    setScores(all);
    setNameInput("");
    setOverlay('leaderboard');
  }, [nameInput, finalScore]);

  const btnCommonClass = "h-11 rounded-lg border cursor-pointer flex items-center justify-center select-none touch-none";

  return (
    <div className="w-full h-full flex flex-col relative" style={{ fontFamily: MONO, backgroundColor: C.desktop }}>

      {/* Canvas game area */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          tabIndex={0}
          onKeyDown={onKey}
          onKeyUp={onKeyUp}
          onClick={() => {
            canvasRef.current?.focus();
            if (game.current.status === 'idle' || game.current.status === 'gameover') startGame();
          }}
          className="block w-full h-full cursor-default outline-none"
        />

        {/* Leaderboard toggle button */}
        <button
          onClick={() => { setScores(loadScores()); setOverlay(o => o === 'leaderboard' ? 'none' : 'leaderboard'); }}
          className="absolute top-1 right-1.5 bg-transparent border rounded text-[9px] px-1.5 py-0.5 cursor-pointer"
          style={{ borderColor: C.border, color: C.textFaint, fontFamily: MONO }}
        >
          TOP 10
        </button>

        {/* Overlays */}
        {overlay === 'leaderboard' && (
          <div className="absolute inset-0 bg-black/[0.88] flex flex-col items-center justify-center p-5 [animation:win-open_0.15s_ease]">
            <div className="text-[13px] mb-3.5 tracking-[0.15em]" style={{ color: C.amber, fontFamily: MONO }}>TOP 10 SCORES</div>
            {scores.length === 0
              ? <div className="text-[11px]" style={{ color: C.textFaint, fontFamily: MONO }}>No scores yet. Play!</div>
              : scores.map((e, i) => (
                  <div key={i} className="flex gap-3 w-[220px] mb-1.5">
                    <span className="text-[11px] w-[18px] text-right" style={{ color: C.textFaint, fontFamily: MONO }}>{i + 1}.</span>
                    <span className="text-[11px] flex-1" style={{ color: i === 0 ? C.amber : C.text, fontFamily: MONO }}>{e.name}</span>
                    <span className="text-[11px] w-[50px] text-right" style={{ color: C.green, fontFamily: MONO }}>{e.score}</span>
                    <span className="text-[9px] w-11 text-right" style={{ color: C.textFaint, fontFamily: MONO }}>
                      {new Date(e.ts).toLocaleDateString("en", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                ))
            }
            <button
              onClick={() => setOverlay('none')}
              className="mt-4 bg-transparent border rounded text-[11px] px-4 py-1 cursor-pointer"
              style={{ borderColor: C.amberDim, color: C.amber, fontFamily: MONO }}
            >
              {game.current.status === 'idle' || game.current.status === 'gameover' ? "Play →" : "Resume →"}
            </button>
          </div>
        )}

        {overlay === 'nameEntry' && (
          <div className="absolute inset-0 bg-black/[0.88] flex flex-col items-center justify-center gap-3 [animation:win-open_0.15s_ease]">
            <div className="text-[13px] tracking-[0.15em]" style={{ color: C.red, fontFamily: MONO }}>GAME OVER</div>
            <div className="text-xs" style={{ color: C.amber, fontFamily: MONO }}>SCORE: {finalScore}</div>
            <div className="text-[10px] mb-1" style={{ color: C.green, fontFamily: MONO }}>NEW HIGH SCORE! Enter your name:</div>
            <input
              ref={nameRef}
              value={nameInput}
              maxLength={8}
              onChange={e => setNameInput(e.target.value.toUpperCase())}
              onKeyDown={e => { if (e.key === "Enter") submitName(); }}
              className="border rounded text-sm px-3 py-1.5 outline-none text-center tracking-[0.3em] w-[140px]"
              style={{ background: C.win, borderColor: C.amberDim, color: C.amber, fontFamily: MONO }}
              placeholder="YOUR NAME"
            />
            <button
              onClick={submitName}
              className="bg-[rgba(255,179,71,0.12)] border rounded text-[11px] px-5 py-[5px] cursor-pointer"
              style={{ borderColor: C.amberDim, color: C.amber, fontFamily: MONO }}
            >
              Submit →
            </button>
          </div>
        )}

        {overlay === 'gameover' && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center gap-2.5 [animation:win-open_0.15s_ease]">
            <div className="text-[13px] tracking-[0.15em]" style={{ color: C.red, fontFamily: MONO }}>GAME OVER</div>
            <div className="text-xs" style={{ color: C.amber, fontFamily: MONO }}>SCORE: {finalScore}</div>
            {scores.length > 0 && (
              <div className="mt-2">
                {scores.slice(0, 5).map((e, i) => (
                  <div key={i} className="flex gap-2.5 w-[200px] mb-1">
                    <span className="text-[10px] w-4" style={{ color: C.textFaint, fontFamily: MONO }}>{i+1}.</span>
                    <span className="text-[10px] flex-1" style={{ color: i === 0 ? C.amber : C.text, fontFamily: MONO }}>{e.name}</span>
                    <span className="text-[10px]" style={{ color: C.green, fontFamily: MONO }}>{e.score}</span>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={startGame}
              className="mt-1.5 bg-[rgba(255,179,71,0.12)] border rounded text-[11px] px-5 py-[5px] cursor-pointer"
              style={{ borderColor: C.amberDim, color: C.amber, fontFamily: MONO }}
            >
              Play Again →
            </button>
          </div>
        )}
      </div>

      {/* Mobile D-pad */}
      {isMobile && (
        <div
          className="flex-shrink-0 h-[134px] border-t flex items-center justify-between px-6 py-2"
          style={{ borderColor: C.border, backgroundColor: C.winBar }}
        >
          {/* Left/Right */}
          <div className="flex gap-1.5">
            <button
              onPointerDown={e => { e.preventDefault(); mobileLeft.current = true; }}
              onPointerUp={() => { mobileLeft.current = false; }}
              onPointerLeave={() => { mobileLeft.current = false; }}
              className={`${btnCommonClass} w-11 text-sm`}
              style={{ background: C.winBar, borderColor: C.textDim, color: C.textDim }}
            >◀</button>
            <button
              onPointerDown={e => { e.preventDefault(); mobileRight.current = true; }}
              onPointerUp={() => { mobileRight.current = false; }}
              onPointerLeave={() => { mobileRight.current = false; }}
              className={`${btnCommonClass} w-11 text-sm`}
              style={{ background: C.winBar, borderColor: C.textDim, color: C.textDim }}
            >▶</button>
          </div>

          {/* Start / Fire */}
          <button
            onPointerDown={e => {
              e.preventDefault();
              if (game.current.status === 'idle' || game.current.status === 'gameover') { startGame(); return; }
              mobileFire.current = true;
            }}
            onPointerUp={() => { mobileFire.current = false; }}
            onPointerLeave={() => { mobileFire.current = false; }}
            className={`${btnCommonClass} w-[60px] text-xs tracking-[0.04em] bg-[rgba(255,179,71,0.1)]`}
            style={{ borderColor: C.amber, color: C.amber }}
          >
            {game.current.status === 'idle' ? "START" : "FIRE"}
          </button>
        </div>
      )}
    </div>
  );
}
