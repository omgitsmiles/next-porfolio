'use client'

import { useState, useEffect } from "react";
import { MONO } from "./theme";

const LINES = [
  "BIOS v2.1.4 ············ OK",
  "Loading kernel ·········· OK",
  "Init file system ········ OK",
  "Network services ········ OK",
  "Loading user: paolo ····· OK",
  "Mounting /dev/portfolio · OK",
  "PaoloOS 1.2.1 ready ······· ✓",
];

export function Boot({ onDone }: { onDone: () => void }) {
  const [lines, setLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    let i = 0;
    let tid: ReturnType<typeof setTimeout>;

    const add = () => {
      if (i < LINES.length) {
        setLines(l => [...l, LINES[i]]);
        setProgress(Math.round(((i + 1) / LINES.length) * 100));
        i++;
        tid = setTimeout(add, 160 + Math.random() * 110);
      } else {
        tid = setTimeout(() => {
          setFading(true);
          setTimeout(onDone, 480);
        }, 480);
      }
    };

    tid = setTimeout(add, 200);
    return () => clearTimeout(tid);
  }, [onDone]);

  return (
    <div style={{
      position: "fixed", inset: 0, backgroundColor: "#000", zIndex: 9999,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: MONO,
      opacity: fading ? 0 : 1,
      transition: fading ? "opacity 0.48s ease" : "none",
    }}>
      <div style={{ color: "#ff9030", fontSize: 20, fontWeight: 700, marginBottom: 28, letterSpacing: "0.12em" }}>
        ⌘ PaoloOS 1.2.1
      </div>

      <div style={{ width: 300, marginBottom: 20 }}>
        <div style={{ height: 2, background: "#1a1a1a", borderRadius: 2 }}>
          <div style={{
            height: "100%", background: "#ff9030", borderRadius: 2,
            width: `${progress}%`, transition: "width 0.15s ease",
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
          <span style={{ fontSize: 9, color: "#444", fontFamily: MONO }}>{progress}%</span>
        </div>
      </div>

      <div style={{ width: 300, fontSize: 10, lineHeight: 2.1 }}>
        {lines.map((l, i) => (
          <div
            key={i}
            style={{
              color: i === lines.length - 1 ? "#666" : "#333",
              animation: "fade-in 0.15s ease",
            }}
          >
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}
