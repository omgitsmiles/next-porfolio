'use client'

import { useState, useEffect, useCallback, createContext, useContext, useRef } from "react";
import type { WinState } from "./types";

export const UICtx = createContext({ isMobile: false });
export const useUI = () => useContext(UICtx);

export function useWindowSize() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return { isMobile };
}

let Z = 100;

export function useWM(initial: WinState[]) {
  const [wins, setWins] = useState(initial);
  const initialRef = useRef(initial);
  const front    = useCallback((id: string) => setWins(ws => ws.map(w => w.id === id ? { ...w, z: ++Z } : w)), []);
  const toggle   = useCallback((id: string) => setWins(ws => ws.map(w => w.id === id ? { ...w, minimized: !w.minimized, z: w.minimized ? ++Z : w.z } : w)), []);
  const close    = useCallback((id: string) => setWins(ws => ws.map(w => w.id === id ? { ...w, closed: true, minimized: false, maximized: false } : w)), []);
  const open     = useCallback((id: string) => setWins(ws => ws.map(w => w.id === id ? { ...w, closed: false, minimized: false, z: ++Z } : w)), []);
  const move     = useCallback((id: string, x: number, y: number) => setWins(ws => ws.map(w => w.id === id ? { ...w, x, y } : w)), []);
  const toggleMax = useCallback((id: string) => setWins(ws => ws.map(w => w.id === id ? { ...w, maximized: !w.maximized, z: ++Z } : w)), []);
  const reset    = useCallback(() => { Z = 100; setWins(initialRef.current); }, []);
  return { wins, front, toggle, close, open, move, toggleMax, reset };
}
