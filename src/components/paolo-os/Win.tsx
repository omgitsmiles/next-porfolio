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
  onMax: (id: string) => void;
  children: React.ReactNode;
};

export function Win({ w, onFront, onToggle, onClose, onMove, onMax, children }: WinProps) {
  const C            = useC();
  const { isMobile } = useUI();
  const dragging     = useRef(false);
  const origin       = useRef<{ mx: number; my: number; wx: number; wy: number } | null>(null);

  const onMD = (e: React.MouseEvent) => {
    if (isMobile || w.maximized) return;
    if ((e.target as HTMLElement).closest(".wb")) return;
    onFront(w.id);
    origin.current   = { mx: e.clientX, my: e.clientY, wx: w.x, wy: w.y };
    dragging.current = true;
  };

  useEffect(() => {
    const mm = (e: MouseEvent) => {
      if (!dragging.current || !origin.current) return;
      onMove(w.id,
        origin.current.wx + e.clientX - origin.current.mx,
        origin.current.wy + e.clientY - origin.current.my,
      );
    };
    const mu = () => { dragging.current = false; };
    window.addEventListener("mousemove", mm);
    window.addEventListener("mouseup",   mu);
    return () => {
      window.removeEventListener("mousemove", mm);
      window.removeEventListener("mouseup",   mu);
    };
  }, [w.id, onMove]);

  if (w.closed || w.minimized) return null;

  const isMaximized = w.maximized && !isMobile;

  const mobileStyle: React.CSSProperties = isMobile ? {
    position: "fixed", left: 0, top: 28, right: 0, bottom: 44,
    width: "100%", height: "auto", zIndex: w.z,
    borderRadius: 0, borderWidth: 0,
  } : {};

  const maxStyle: React.CSSProperties = isMaximized ? {
    left: 0, top: 28,
    width: "100%", height: "calc(100% - 72px)",
    borderRadius: 0,
  } : {};

  return (
    <div
      onClick={() => onFront(w.id)}
      className="absolute flex flex-col border rounded-md overflow-hidden select-none shadow-[0_24px_64px_rgba(0,0,0,0.75)] [animation:win-open_0.18s_ease]"
      style={{
        left: w.x, top: w.y,
        width: w.width, height: w.height, zIndex: w.z,
        borderColor: C.border,
        background: C.win,
        transition: isMaximized ? "left 0.2s ease, top 0.2s ease, width 0.2s ease, height 0.2s ease, border-radius 0.2s ease" : "none",
        ...mobileStyle,
        ...maxStyle,
      }}
    >
      <div
        onMouseDown={onMD}
        onDoubleClick={() => !isMobile && onMax(w.id)}
        className="flex items-center h-9 px-3 gap-2 border-b flex-shrink-0"
        style={{
          background: C.winBar, borderColor: C.border,
          cursor: isMobile || isMaximized ? "default" : "grab",
        }}
      >
        <div className="flex gap-1.5 mr-1">
          <button
            className="wb w-[13px] h-[13px] rounded-full border-none cursor-pointer p-0"
            onClick={() => onClose(w.id)}
            style={{ background: C.red }}
            title="Close"
          />
          <button
            className="wb w-[13px] h-[13px] rounded-full border-none cursor-pointer p-0"
            onClick={() => onToggle(w.id)}
            style={{ background: C.amber }}
            title="Minimize"
          />
          <button
            className="wb w-[13px] h-[13px] rounded-full border-none p-0"
            onClick={() => !isMobile && onMax(w.id)}
            style={{ background: C.green, cursor: isMobile ? "default" : "pointer" }}
            title={isMaximized ? "Restore" : "Maximize"}
          />
        </div>
        <span className="text-[11px] tracking-[0.04em] flex items-center gap-1.5" style={{ fontFamily: MONO, color: C.textDim }}>
          {(() => { const Icon = WINDOW_ICONS[w.id]; return Icon ? <Icon size={12} strokeWidth={1.5} /> : null; })()}
          {w.title}
        </span>
      </div>
      <div
        className="flex-1 overflow-auto relative"
        style={{ backgroundImage: `repeating-linear-gradient(0deg,${C.scanline} 0px,${C.scanline} 1px,transparent 1px,transparent 4px)` }}
      >
        {children}
      </div>
    </div>
  );
}
