'use client'

import { createContext, useContext } from "react";

export const DARK = {
  desktop:    "#1a1a1f",
  win:        "#1e1e24",
  winBar:     "#2a2a33",
  border:     "#3a3a48",
  amber:      "#ffb347",
  amberDim:   "#c47a1a",
  text:       "#e8e8d0",
  textDim:    "#8888a0",
  textFaint:  "#55556a",
  green:      "#7ec8a0",
  red:        "#e06c75",
  blue:       "#61afef",
  cyan:       "#56b6c2",
  menubarBg:  "rgba(0,0,0,0.55)",
  taskbarBg:  "rgba(0,0,0,0.65)",
  scanline:   "rgba(0,0,0,0.07)",
  desktopBg: `
    radial-gradient(ellipse 70% 60% at 15% 15%, rgba(255,179,71,0.18) 0%, transparent 100%),
    radial-gradient(ellipse 60% 55% at 85% 90%, rgba(97,175,239,0.13) 0%, transparent 100%),
    radial-gradient(ellipse 40% 40% at 60% 30%, rgba(86,182,194,0.07) 0%, transparent 100%),
    radial-gradient(circle at center, rgba(255,255,255,0.05) 1px, transparent 1px)
  `,
  desktopBgSize: "100% 100%, 100% 100%, 100% 100%, 22px 22px",
};

export const LIGHT = {
  desktop:    "#f0ece3",
  win:        "#fefdfb",
  winBar:     "#eae6dc",
  border:     "#cdc9bc",
  amber:      "#a85f08",
  amberDim:   "#7a4506",
  text:       "#1e1e26",
  textDim:    "#4a4a62",
  textFaint:  "#888898",
  green:      "#2a7a50",
  red:        "#b83232",
  blue:       "#2050b8",
  cyan:       "#0878a0",
  menubarBg:  "rgba(238,234,226,0.90)",
  taskbarBg:  "rgba(232,228,218,0.94)",
  scanline:   "rgba(0,0,0,0.025)",
  desktopBg: `
    radial-gradient(ellipse 70% 60% at 15% 15%, rgba(168,95,8,0.10) 0%, transparent 100%),
    radial-gradient(ellipse 60% 55% at 85% 90%, rgba(32,80,184,0.07) 0%, transparent 100%),
    radial-gradient(ellipse 40% 40% at 60% 30%, rgba(8,120,160,0.05) 0%, transparent 100%),
    radial-gradient(circle at center, rgba(0,0,0,0.055) 1px, transparent 1px)
  `,
  desktopBgSize: "100% 100%, 100% 100%, 100% 100%, 22px 22px",
};

export type Palette = typeof DARK;
export const CContext = createContext<Palette>(DARK);
export const useC = () => useContext(CContext);

export const RESUME_URL =
  "https://drive.google.com/file/d/1IX1TVx3z64EHtQ0f2agTOqmgJUzXvNq6/view?usp=sharing";

export const MONO =
  "'JetBrains Mono','IBM Plex Mono','Fira Code',ui-monospace,monospace";
