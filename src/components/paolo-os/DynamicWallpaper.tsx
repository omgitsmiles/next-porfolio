'use client'

import { useEffect, useState } from "react";

/**
 * Photo-real dynamic wallpaper — two wallpaper frames (day + night) that
 * cross-fade with the real time of day, the same mechanism macOS uses for
 * its .heic dynamic desktops. Per-theme frame pairs live in theme.ts's
 * WALLPAPERS map and export from public/wallpapers/.
 */

export type WallpaperMode = "auto" | "day" | "night";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ramp = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));

function phase(t: number) {
  // t = hours in [0, 24)
  let night: number;
  if (t < 5)         night = 1;
  else if (t < 7)    night = 1 - ramp(t, 5, 7);      // dawn fade-out
  else if (t < 18.5) night = 0;                       // daytime
  else if (t < 20.5) night = ramp(t, 18.5, 20.5);     // dusk fade-in
  else               night = 1;                        // night
  const dawn = Math.max(0, 1 - Math.abs(t - 6) / 1.6);
  const dusk = Math.max(0, 1 - Math.abs(t - 19.5) / 1.8);
  const warm = Math.max(dawn, dusk) * 0.5;             // golden-hour wash
  return { night, warm };
}

const nowHours = () => {
  const d = new Date();
  return d.getHours() + d.getMinutes() / 60;
};

export function DynamicWallpaper({
  daySrc,
  nightSrc,
  mode = "auto",
}: { daySrc: string; nightSrc: string; mode?: WallpaperMode }) {
  // Start unresolved so the server-rendered HTML (no clock access) matches
  // the client's first paint; the real local time is only read post-mount,
  // avoiding a hydration mismatch when the server's timezone differs from
  // the browser's.
  const [t, setT] = useState<number | null>(null);

  useEffect(() => {
    setT(nowHours());
    const id = setInterval(() => setT(nowHours()), 60_000);
    return () => clearInterval(id);
  }, []);

  const { night, warm } =
    mode === "day"   ? { night: 0, warm: 0 } :
    mode === "night" ? { night: 1, warm: 0 } :
    t === null       ? { night: 0, warm: 0 } :
    phase(t);

  const layer: React.CSSProperties = {
    position: "absolute", inset: 0, width: "100%", height: "100%",
    objectFit: "cover", userSelect: "none", pointerEvents: "none",
  };

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={daySrc} alt="" draggable={false} style={layer} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={nightSrc} alt="" draggable={false}
           style={{ ...layer, opacity: night, transition: "opacity 2s linear" }} />
      {/* dawn / dusk warm wash */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", opacity: warm,
        transition: "opacity 2s linear",
        background:
          "radial-gradient(130% 80% at 50% 96%, rgba(255,155,85,0.6) 0%, rgba(255,120,90,0.18) 42%, transparent 70%)",
      }} />
      {/* vignette for icon/text legibility */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(120% 95% at 50% 30%, transparent 55%, rgba(4,6,16,0.4) 100%)",
      }} />
    </div>
  );
}
