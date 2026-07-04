'use client'

import { useState, useRef, useEffect, useCallback } from "react";
import { useC, MONO } from "./theme";
import { useUI } from "./hooks";
import type { Dir, GameState } from "./types";

const COLS_SN = 26, ROWS_SN = 18, SCORE_H = 30, DPAD_H = 130;

function rand(max: number) { return Math.floor(Math.random() * max); }

function newFood(snake: Dir[]): Dir {
  let f: Dir;
  do { f = { x: rand(COLS_SN), y: rand(ROWS_SN) }; }
  while (snake.some(s => s.x === f.x && s.y === f.y));
  return f;
}

export function Snake() {
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
        width: 36, height: 36, borderRadius: 8,
        background: C.winBar, border: `1px solid ${C.border}`,
        color: C.textDim, fontSize: 14, cursor: "pointer",
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

      {isMobile && (
        <div style={{
          flexShrink: 0, height: DPAD_H,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 4, borderTop: `1px solid ${C.border}`, backgroundColor: C.winBar,
          paddingTop: 6, paddingBottom: 8,
        }}>
          <div>{dpadBtn("▲", "ArrowUp")}</div>
          <div style={{ display: "flex", gap: 4 }}>
            {dpadBtn("◀", "ArrowLeft")}
            <button
              onPointerDown={e => { e.preventDefault(); startOrRestart(); }}
              style={{
                width: 36, height: 36, borderRadius: 8,
                background: C.win, border: `1px solid ${C.amberDim}`,
                color: C.amber, fontSize: 11, cursor: "pointer",
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
