'use client'

import { createContext, useContext } from "react";

const BG6 = "100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%, 22px 22px";

export const THEMES = {
  sonoma: {
    name:       "Sonoma",
    desktop:    "#060412",
    win:        "#0c0820",
    winBar:     "#160f30",
    border:     "#2c2060",
    amber:      "#ff9030",
    amberDim:   "#c06010",
    text:       "#eee8ff",
    textDim:    "#887acc",
    textFaint:  "#443870",
    green:      "#30ffaa",
    red:        "#ff3d6a",
    blue:       "#60a8ff",
    cyan:       "#20ddf5",
    menubarBg:  "rgba(6,4,18,0.74)",
    taskbarBg:  "rgba(4,2,12,0.84)",
    scanline:   "rgba(150,120,255,0.04)",
    desktopBg: `
      radial-gradient(ellipse 110% 80% at 70% 65%, rgba(90,20,180,0.80) 0%, rgba(50,10,120,0.40) 50%, transparent 70%),
      radial-gradient(ellipse 70%  50% at 15% 30%, rgba(20,80,230,0.65)   0%, transparent 60%),
      radial-gradient(ellipse 55%  65% at 88% 12%, rgba(210,30,150,0.55)  0%, transparent 55%),
      radial-gradient(ellipse 45%  40% at 25% 88%, rgba(0,170,220,0.35)   0%, transparent 50%),
      radial-gradient(ellipse 25%  25% at 60% 40%, rgba(255,120,220,0.22) 0%, transparent 50%),
      radial-gradient(circle at center, rgba(255,255,255,0.03) 1px, transparent 1px)
    `,
    desktopBgSize: BG6,
  },
  monterey: {
    name:       "Monterey",
    desktop:    "#d0eff6",
    win:        "#f4fcfe",
    winBar:     "#c4e6f0",
    border:     "#88c4d8",
    amber:      "#8a4800",
    amberDim:   "#603200",
    text:       "#0a1e28",
    textDim:    "#2a5870",
    textFaint:  "#5888a0",
    green:      "#00683c",
    red:        "#c00030",
    blue:       "#1040d0",
    cyan:       "#007888",
    menubarBg:  "rgba(196,236,248,0.93)",
    taskbarBg:  "rgba(186,228,242,0.97)",
    scanline:   "rgba(0,100,120,0.022)",
    desktopBg: `
      radial-gradient(ellipse 75% 70% at 18% 55%, rgba(0,180,200,0.55)   0%, transparent 65%),
      radial-gradient(ellipse 65% 60% at 85% 22%, rgba(20,90,220,0.42)   0%, transparent 60%),
      radial-gradient(ellipse 55% 65% at 55% 88%, rgba(0,210,170,0.38)   0%, transparent 55%),
      radial-gradient(ellipse 45% 40% at  8% 15%, rgba(80,60,200,0.26)   0%, transparent 50%),
      radial-gradient(ellipse 30% 25% at 70% 50%, rgba(0,230,240,0.22)   0%, transparent 45%),
      radial-gradient(circle at center, rgba(0,0,0,0.04) 1px, transparent 1px)
    `,
    desktopBgSize: BG6,
  },
  bigSur: {
    name:       "Big Sur",
    desktop:    "#02091c",
    win:        "#060e28",
    winBar:     "#0c1838",
    border:     "#162c60",
    amber:      "#ffb030",
    amberDim:   "#c07010",
    text:       "#c8e0ff",
    textDim:    "#6090cc",
    textFaint:  "#304a80",
    green:      "#00ffa0",
    red:        "#ff4055",
    blue:       "#50aaff",
    cyan:       "#00d8f0",
    menubarBg:  "rgba(2,8,24,0.74)",
    taskbarBg:  "rgba(1,5,16,0.84)",
    scanline:   "rgba(120,180,255,0.04)",
    desktopBg: `
      radial-gradient(ellipse 110% 65% at 55% 88%, rgba(8,55,180,0.78)   0%, transparent 60%),
      radial-gradient(ellipse 75%  55% at 18% 22%, rgba(90,30,200,0.62)   0%, transparent 55%),
      radial-gradient(ellipse 65%  55% at 88% 18%, rgba(0,180,200,0.52)   0%, transparent 55%),
      radial-gradient(ellipse 40%  25% at 45%  3%, rgba(255,170,40,0.32)  0%, transparent 50%),
      radial-gradient(ellipse 35%  45% at  8% 80%, rgba(0,220,160,0.26)   0%, transparent 50%),
      radial-gradient(circle at center, rgba(255,255,255,0.03) 1px, transparent 1px)
    `,
    desktopBgSize: BG6,
  },
  mojave: {
    name:       "Mojave",
    desktop:    "#0c0415",
    win:        "#120820",
    winBar:     "#1c1030",
    border:     "#381e50",
    amber:      "#ff8800",
    amberDim:   "#c05500",
    text:       "#f2e8ff",
    textDim:    "#9878c8",
    textFaint:  "#502c70",
    green:      "#20ffa0",
    red:        "#ff4555",
    blue:       "#5888ff",
    cyan:       "#20dde8",
    menubarBg:  "rgba(10,3,18,0.74)",
    taskbarBg:  "rgba(8,2,14,0.84)",
    scanline:   "rgba(180,120,255,0.04)",
    desktopBg: `
      radial-gradient(ellipse 120% 45% at 50% 108%, rgba(220,75,15,0.68)  0%, transparent 50%),
      radial-gradient(ellipse 80%  70% at 28%  18%, rgba(100,15,160,0.72) 0%, transparent 60%),
      radial-gradient(ellipse 60%  55% at 78%  48%, rgba(200,45,90,0.52)  0%, transparent 55%),
      radial-gradient(ellipse 50%  45% at  8%  60%, rgba(35,35,180,0.46)  0%, transparent 50%),
      radial-gradient(ellipse 40%  20% at 50%  96%, rgba(255,130,30,0.42) 0%, transparent 45%),
      radial-gradient(circle at center, rgba(255,255,255,0.03) 1px, transparent 1px)
    `,
    desktopBgSize: BG6,
  },
} as const;

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
