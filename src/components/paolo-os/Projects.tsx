'use client'

import { useState } from "react";
import { projectsData } from "../../../lib/data";
import { useC, MONO } from "./theme";
import type { ProjectData } from "./types";

export function Projects() {
  const C = useC();
  const [active, setActive] = useState<ProjectData | null>(null);

  return (
    <div style={{
      fontFamily: MONO, height: "100%", boxSizing: "border-box",
      display: "flex", flexDirection: "column",
    }}>
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
