'use client'

import { createContext, useContext } from "react";

// Shared window/toolbar chrome — every theme now sits over a photo wallpaper
// instead of its own gradient, so the UI itself is standardized on Monterey's
// light, high-contrast glass look rather than each theme inventing its own.
const CHROME = {
  win:        "#f4fcfe",
  winBar:     "#c4e6f0",
  border:     "#88c4d8",
  amber:      "#8a4800",
  amberDim:   "#603200",
  text:       "#0a1e28",
  textDim:    "#2a5870",
  textFaint:  "#3a6478",
  green:      "#00683c",
  red:        "#c00030",
  blue:       "#1040d0",
  cyan:       "#007888",
  // High enough opacity that the panel color stays stable (and readable)
  // regardless of how bright or dark the photo wallpaper behind it is.
  menubarBg:  "rgba(214,240,250,0.82)",
  taskbarBg:  "rgba(205,235,248,0.86)",
  scanline:   "rgba(0,100,120,0.022)",
  desktopBg:  "none",       // the day/night photo layer draws the background instead
  desktopBgSize: "auto",
} as const;

export const THEMES = {
  sonoma: {
    name:    "Sonoma",
    desktop: "#060412",   // fallback color while photo loads
    ...CHROME,
  },
  monterey: {
    name:    "Monterey",
    desktop: "#d0eff6",   // fallback color while photo loads
    ...CHROME,
  },
  bigSur: {
    name:    "Big Sur",
    desktop: "#02091c",   // fallback color while photo loads
    ...CHROME,
  },
  mojave: {
    name:    "Mojave",
    desktop: "#0c0415",   // fallback color while photo loads
    ...CHROME,
  },
} as const;

export const WALLPAPERS: Record<ThemeName, { day: string; night: string }> = {
  sonoma:   { day: "/wallpapers/sonomaDay.jpg",   night: "/wallpapers/sonomaNight.jpg" },
  monterey: { day: "/wallpapers/montereyDay.jpg", night: "/wallpapers/montereyNight.jpg" },
  bigSur:   { day: "/wallpapers/surDay.jpg",      night: "/wallpapers/surNight.jpg" },
  mojave:   { day: "/wallpapers/mojaveDay.jpg",    night: "/wallpapers/mojaveNight.jpg" },
};

export type ThemeName = keyof typeof THEMES;
export type Palette = {
  name: string; desktop: string; win: string; winBar: string; border: string;
  amber: string; amberDim: string; text: string; textDim: string; textFaint: string;
  green: string; red: string; blue: string; cyan: string;
  menubarBg: string; taskbarBg: string; scanline: string;
  desktopBg: string; desktopBgSize: string;
};

export const THEME_KEYS = Object.keys(THEMES) as ThemeName[];

export const CContext = createContext<Palette>(THEMES.sonoma);
export const useC = () => useContext(CContext);

export const RESUME_URL =
  "https://drive.google.com/file/d/1IX1TVx3z64EHtQ0f2agTOqmgJUzXvNq6/view?usp=sharing";

export const MONO =
  "'JetBrains Mono','IBM Plex Mono','Fira Code',ui-monospace,monospace";
