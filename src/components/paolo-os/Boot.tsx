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
  "PaoloOS 3.5.1 ready ······· ✓",
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
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black"
      style={{
        fontFamily: MONO,
        opacity: fading ? 0 : 1,
        transition: fading ? "opacity 0.48s ease" : "none",
      }}
    >
      <div className="text-[#ff9030] text-xl font-bold mb-7 tracking-[0.12em]">
        ⌘ PaoloOS 3.5.1
      </div>

      <div className="w-[300px] mb-5">
        <div className="h-0.5 bg-[#1a1a1a] rounded-sm">
          <div
            className="h-full bg-[#ff9030] rounded-sm transition-[width] duration-150 ease"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-end mt-1">
          <span className="text-[9px] text-[#444]" style={{ fontFamily: MONO }}>{progress}%</span>
        </div>
      </div>

      <div className="w-[300px] text-[10px] leading-[2.1]">
        {lines.map((l, i) => (
          <div
            key={i}
            className="animate-[fade-in_0.15s_ease]"
            style={{ color: i === lines.length - 1 ? "#666" : "#333" }}
          >
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}
