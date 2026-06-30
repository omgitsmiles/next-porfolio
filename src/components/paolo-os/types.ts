import { projectsData } from "../../../lib/data";

export type WinState = {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
  closed: boolean;
  minimized: boolean;
  maximized: boolean;
};

export type ToastItem = { id: string; title: string; sub?: string };

export type HistoryItem = {
  t: "amber" | "green" | "red" | "blue" | "cyan" | "dim" | "prompt" | "text" | "cmd";
  v: string;
};

export type ProjectData = typeof projectsData[number];

export type Dir = { x: number; y: number };

export type GameState = {
  snake: Dir[];
  dir: Dir;
  next: Dir;
  food: Dir;
  dead: boolean;
  score: number;
  started: boolean;
};

export type SendStatus = "idle" | "sending" | "ok" | "error";
