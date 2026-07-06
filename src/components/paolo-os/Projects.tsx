'use client'

import { useState } from "react";
import { projectsData } from "../../../lib/data";
import { useC, MONO } from "./theme";
import type { ProjectData } from "./types";

export function Projects() {
  const C = useC();
  const [active, setActive]   = useState<ProjectData | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="h-full box-border flex flex-col" style={{ fontFamily: MONO }}>
      <div className="flex-1 overflow-auto pt-3 px-3.5">
        <div className="text-[11px] mb-2.5" style={{ color: C.textFaint }}>
          ~/projects — {projectsData.length} items
        </div>
        <div className="grid grid-cols-2 gap-2">
          {projectsData.map((p, i) => {
            const isActive  = active?.title === p.title;
            const isHovered = hovered === i;
            return (
              <div
                key={i}
                onClick={() => setActive(isActive ? null : p as ProjectData)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className="relative overflow-hidden border rounded py-2.5 px-3 cursor-pointer transition-[border-color,transform,box-shadow] duration-150 ease-in-out min-h-[68px]"
                style={{
                  borderColor: isActive ? C.amber : isHovered ? C.amberDim : C.border,
                  transform: isHovered && !isActive ? "translateY(-2px)" : "translateY(0)",
                  boxShadow: isHovered && !isActive ? "0 6px 20px rgba(0,0,0,0.35)" : "none",
                }}
              >
                <img
                  src={p.imageUrl.src}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 w-full h-full object-cover blur-[2px] saturate-[0.6] transition-opacity duration-200 ease-in-out pointer-events-none"
                  style={{ opacity: isActive ? 0.22 : 0.10 }}
                />
                <div
                  className="absolute inset-0 transition-opacity duration-200 ease-in-out pointer-events-none"
                  style={{ backgroundColor: C.win, opacity: isActive ? 0.55 : 0.72 }}
                />
                <div className="relative">
                  <div className="text-xs font-semibold leading-[1.3]" style={{ color: C.amber }}>
                    {p.title}
                  </div>
                  <div className="text-[10px] mt-[3px]" style={{ color: C.textFaint }}>
                    {p.tags.slice(0, 2).join(" · ")}
                    {p.tags.length > 2 && ` +${p.tags.length - 2}`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {active && (
        <div
          className="border-t px-3.5 py-3 flex-shrink-0"
          style={{ borderColor: C.border, background: C.win }}
        >
          <div className="flex gap-2.5 items-start mb-2">
            <img
              src={active.imageUrl.src}
              alt={active.title}
              className="w-[72px] h-[46px] object-cover rounded-[3px] border flex-shrink-0"
              style={{ borderColor: C.border }}
            />
            <div className="min-w-0">
              <div className="text-[13px] mb-1" style={{ color: C.amber }}>{active.title}</div>
              <div className="text-[11px] leading-[1.6]" style={{ color: C.textDim }}>{active.description}</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-[5px] mb-2">
            {active.tags.map(s => (
              <span
                key={s}
                className="text-[10px] rounded-sm px-1.5 py-0.5 border"
                style={{ color: C.green, borderColor: `${C.green}33` }}
              >{s}</span>
            ))}
          </div>
          {active.repo && (
            <a
              href={active.repo} target="_blank" rel="noreferrer"
              className="text-[11px] no-underline"
              style={{ color: C.blue }}
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
