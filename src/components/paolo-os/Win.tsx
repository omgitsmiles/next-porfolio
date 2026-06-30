'use client'

import { useRef, useEffect } from "react";
import { useC, MONO } from "./theme";
import { useUI } from "./hooks";
import { WINDOW_ICONS } from "./icons";
import type { WinState } from "./types";

type WinProps = {
  w: WinState;
  onFront: (id: string) => void;
  onToggle: (id: string) => void;
  onClose: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  children: React.ReactNode;
};

export function Win({ w, onFront, onToggle, onClose, onMove, children }: WinProps) {
  const C            = useC();
  const { isMobile } = useUI();
  const dragging     = useRef(false);
  const origin       = useRef<{ mx: number; my: number; wx: number; wy: number } | null>(null);

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
        animation: "win-open 0.18s ease",
        ...mobileStyle,
      }}
    >
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
        <span style={{ fontFamily: MONO, fontSize: 11, color: C.textDim, letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: 6 }}>
          {(() => { const Icon = WINDOW_ICONS[w.id]; return Icon ? <Icon size={12} strokeWidth={1.5} /> : null; })()}
          {w.title}
        </span>
      </div>
      <div style={{
        flex: 1, overflow: "auto", position: "relative",
        backgroundImage: `repeating-linear-gradient(0deg,${C.scanline} 0px,${C.scanline} 1px,transparent 1px,transparent 4px)`,
      }}>
        {children}
      </div>
    </div>
  );
}
