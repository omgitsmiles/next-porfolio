'use client'

import { useState, useRef, useEffect, useCallback } from "react";
import { useC, RESUME_URL, MONO } from "./theme";
import type { HistoryItem } from "./types";

const COMMANDS: Record<string, () => HistoryItem[]> = {
  help: () => [
    { t: "dim", v: "Available commands:" },
    { t: "cmd", v: "  whoami        → about Paolo" },
    { t: "cmd", v: "  ls            → list files" },
    { t: "cmd", v: "  cat resume    → print résumé" },
    { t: "cmd", v: "  open resume   → open résumé PDF" },
    { t: "cmd", v: "  open about    → about me window" },
    { t: "cmd", v: "  open projects → projects window" },
    { t: "cmd", v: "  open contact  → contact window" },
    { t: "cmd", v: "  open snake    → launch snake 🐍" },
    { t: "cmd", v: "  open space   → space invaders 👾" },
    { t: "cmd", v: "  skills        → print skill list" },
    { t: "cmd", v: "  neofetch      → system info" },
    { t: "cmd", v: "  ai <question> → ask the AI" },
    { t: "cmd", v: "  clear         → clear terminal" },
  ],
  whoami: () => [
    { t: "amber", v: "Paolo Alberca" },
    { t: "text",  v: "Software Engineer · New York, NY" },
    { t: "dim",   v: "JPMorgan Chase / WeVote / NYC Tech Talent Pipeline" },
    { t: "dim",   v: "Flatiron School alumnus. Formerly healthcare sales." },
  ],
  ls: () => [
    { t: "blue",  v: "drwxr-xr-x  projects/" },
    { t: "text",  v: "-rw-r--r--  about.txt" },
    { t: "text",  v: "-rwxr-xr-x  contact.sh" },
    { t: "green", v: "-rw-r--r--  resume.pdf" },
    { t: "cyan",  v: "-rwxr-xr-x  snake" },
    { t: "dim",   v: "-rw-r--r--  .easter_egg" },
  ],
  skills: () => [
    { t: "amber", v: "LANGUAGES" },
    { t: "text",  v: "  Typescript · Java · Python · Ruby · SQL" },
    { t: "amber", v: "FRAMEWORKS" },
    { t: "text",  v: "  React · Next.js · Spring Boot · Django · Rails" },
    { t: "amber", v: "INFRA & TOOLS" },
    { t: "text",  v: "  AWS · Docker · Kafka · Terraform · Jenkins · Spinnaker" },
    { t: "amber", v: "DATABASES" },
    { t: "text",  v: "  PostgreSQL · MongoDB" },
    { t: "amber", v: "TESTING" },
    { t: "text",  v: "  JUnit · Cucumber · Jest · Gremlin · Jmeter" },
  ],
  "cat resume": () => [
    { t: "amber", v: "─── PAOLO ALBERCA ──────────────────────────────────" },
    { t: "dim",   v: "Software Engineer | New York, NY" },
    { t: "dim",   v: "paolo.alberca@gmail.com | paoloalberca.com" },
    { t: "text",  v: "" },
    { t: "amber", v: "EXPERIENCE" },
    { t: "green", v: "Software Engineer — JPMorgan Chase (Apr 2025–present)" },
    { t: "text",  v: "  · Data pipeline API — 12% lift in offer conversions" },
    { t: "text",  v: "  · Gremlin SME — -10% MTTR" },
    { t: "text",  v: "  · Dockerized Kafka dev environment" },
    { t: "text",  v: "  · Full testing pyramid — -16% post-deploy incidents" },
    { t: "text",  v: "" },
    { t: "green", v: "Software Engineer — WeVote (Jul 2024–Feb 2025)" },
    { t: "text",  v: "  · DB refactor — +14% fetch speed" },
    { t: "text",  v: "  · Material UI redesign, Storybook design system" },
    { t: "text",  v: "" },
    { t: "green", v: "Account Executive — OrthoPro (Sep 2019–Apr 2025)" },
    { t: "text",  v: "  · $4MM revenue, 18 accounts, team of 12" },
    { t: "text",  v: "" },
    { t: "amber", v: "EDUCATION" },
    { t: "text",  v: "  Flatiron School — Full Stack Web Dev (2022)" },
    { t: "text",  v: "  SUNY Stony Brook — B.S. Health Science" },
    { t: "dim",   v: "" },
    { t: "dim",   v: "  → run 'open resume' to download the PDF" },
  ],
  neofetch: () => [
    { t: "amber", v: "  ┌──────┐  paoloalberca@paoloOS" },
    { t: "amber", v: " ┌────────┐ ───────────────────────────" },
    { t: "amber", v: "┌──────────┐ OS: PaoloOS 3.4.0" },
    { t: "amber", v: "└──────────┘ Host: New York, NY" },
    { t: "amber", v: " └────────┘  Shell: bash 5.2" },
    { t: "amber", v: "  └──────┘   Stack: Typescript · Java · Python" },
    { t: "dim",   v: "             Role: Software Engineer" },
    { t: "dim",   v: "             Employer: JPMorgan Chase" },
    { t: "dim",   v: "             Uptime: Since Apr 2025" },
  ],
  ".easter_egg": () => [
    { t: "green", v: "You found it. 🥚" },
    { t: "dim",   v: "Former healthcare sales rep turned engineer." },
    { t: "dim",   v: "Volunteer technical interviewer at NYC Tech" },
    { t: "dim",   v: "Talent Pipeline. Helping others make the" },
    { t: "dim",   v: "same jump I did." },
    { t: "dim",   v: "" },
    { t: "cyan",  v: "  → try: open snake" },
  ],
};

const ALL_CMDS = [
  ...Object.keys(COMMANDS),
  "open resume", "open about", "open projects", "open contact", "open snake", "open space",
  "clear", "vim about.txt", "ai",
];

function getAiResponse(q: string): HistoryItem[] {
  const lq = q.toLowerCase();

  if (!q) return [
    { t: "cyan", v: "PaoloOS AI v1.2" },
    { t: "dim",  v: "Ask me something. Try: ai who is paolo" },
  ];

  if (/who|yourself|are you/.test(lq)) return [
    { t: "cyan", v: "I'm PaoloOS — Paolo's portfolio AI." },
    { t: "text", v: "Built to help you explore this terminal OS." },
    { t: "dim",  v: "Try: ai tell me about paolo" },
  ];

  if (/about|tell|paolo|background/.test(lq)) return [
    { t: "amber", v: "Paolo Alberca" },
    { t: "text",  v: "Software Engineer based in New York, NY." },
    { t: "dim",   v: "Former healthcare sales rep turned full-stack engineer." },
    { t: "dim",   v: "Volunteer tech interviewer at NYC Tech Talent Pipeline." },
    { t: "dim",   v: "Currently at JPMorgan Chase. Previously at WeVote." },
    { t: "dim",   v: "Run 'whoami' or 'cat resume' for more." },
  ];

  if (/skill|tech|stack|know|language|framework/.test(lq)) return [
    ...COMMANDS.skills(),
  ];

  if (/experience|work|job|career|history|employ/.test(lq)) return [
    { t: "amber", v: "EXPERIENCE" },
    { t: "green", v: "Software Engineer — JPMorgan Chase (Apr 2025–present)" },
    { t: "text",  v: "  Data pipelines, Gremlin chaos engineering, Kafka" },
    { t: "green", v: "Software Engineer — WeVote (Jul 2024–Feb 2025)" },
    { t: "text",  v: "  DB optimization, Material UI, Storybook" },
    { t: "dim",   v: "  Run 'cat resume' for the full picture." },
  ];

  if (/contact|hire|reach|email|available/.test(lq)) return [
    { t: "cyan",  v: "Contact Paolo" },
    { t: "amber", v: "  email    → paolo.alberca@gmail.com" },
    { t: "amber", v: "  linkedin → paolo-alberca" },
    { t: "dim",   v: "  Or: open contact" },
  ];

  if (/project|build|made|portfolio|code/.test(lq)) return [
    { t: "cyan", v: "Projects" },
    { t: "text", v: "  Browse all work in the projects window." },
    { t: "dim",  v: "  → open projects" },
  ];

  if (/snake|game|play|fun/.test(lq)) return [
    { t: "cyan",  v: "PaoloOS Snake" },
    { t: "text",  v: "  Arrow keys to move · Space to start." },
    { t: "green", v: "  → open snake" },
  ];

  if (/theme|color|dark|light|wallpaper/.test(lq)) return [
    { t: "cyan", v: "Themes" },
    { t: "text", v: "  Sonoma · Monterey · Big Sur · Mojave" },
    { t: "dim",  v: "  Palette icon in the menu bar — or right-click desktop." },
  ];

  if (/hello|hi|hey|sup|yo/.test(lq)) return [
    { t: "cyan", v: "Hey there!" },
    { t: "text", v: "  Welcome to PaoloOS." },
    { t: "dim",  v: "  Try: ai tell me about paolo" },
  ];

  if (/education|school|degree|study/.test(lq)) return [
    { t: "amber", v: "EDUCATION" },
    { t: "text",  v: "  Flatiron School — Full Stack Web Dev (2022)" },
    { t: "text",  v: "  SUNY Stony Brook — B.S. Health Science" },
    { t: "dim",   v: "  Made the jump from healthcare sales to engineering." },
  ];

  return [
    { t: "red",  v: `  Unknown: "${q}"` },
    { t: "dim",  v: "  Try: skills · experience · contact · projects · education" },
  ];
}

export function Terminal({ onOpen, ready }: { onOpen: (target: string) => void; ready?: boolean }) {
  const C = useC();
  const [history, setHistory] = useState<HistoryItem[]>([
    { t: "amber", v: "PaoloOS Terminal v3.4" },
    { t: "dim",   v: "Type 'help' to get started." },
    { t: "text",  v: "" },
  ]);
  const [input, setInput]     = useState("");
  const [cmdHist, setCmdHist] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [history]);

  useEffect(() => {
    if (!ready) return;
    const text = "skills";
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => {
      let i = 0;
      const type = () => {
        setInput(text.slice(0, i + 1));
        i++;
        if (i < text.length) {
          timers.push(setTimeout(type, 90));
        } else {
          timers.push(setTimeout(() => {
            setCmdHist(h => [text, ...h]);
            setHistIdx(-1);
            setHistory(h => [
              ...h,
              { t: "prompt", v: `guest@paoloOS:~$ ${text}` },
              ...COMMANDS.skills(),
              { t: "text", v: "" },
            ]);
            setInput("");
          }, 450));
        }
      };
      type();
    }, 700));
    return () => timers.forEach(clearTimeout);
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const run = useCallback((raw: string) => {
    const cmd    = raw.trim().toLowerCase();
    const prompt: HistoryItem = { t: "prompt", v: `guest@paoloOS:~$ ${raw}` };

    if (cmd === "clear") {
      setHistory([{ t: "dim", v: "Terminal cleared." }, { t: "text", v: "" }]);
      return;
    }
    if (cmd === "open resume") {
      window.open(RESUME_URL, "_blank");
      setHistory(h => [...h, prompt, { t: "green", v: "Opening resume.pdf in browser…" }, { t: "dim", v: "(Google Drive — download available there)" }, { t: "text", v: "" }]);
      return;
    }
    if (cmd === "vim about.txt") {
      onOpen("about");
      setHistory(h => [...h, prompt, { t: "green", v: "Opening about…" }, { t: "text", v: "" }]);
      return;
    }
    if (cmd.startsWith("open ")) {
      const target = cmd.replace("open ", "").trim();
      onOpen(target);
      setHistory(h => [...h, prompt, { t: "green", v: `Opening ${target}…` }, { t: "text", v: "" }]);
      return;
    }
    if (cmd === "ai" || cmd.startsWith("ai ")) {
      const q = cmd === "ai" ? "" : cmd.slice(3).trim();
      setHistory(h => [...h, prompt, ...getAiResponse(q), { t: "text", v: "" }]);
      return;
    }
    const fn  = COMMANDS[cmd];
    const out = fn ? fn() : [{ t: "red" as const, v: `Command not found: ${raw}. Try 'help'.` }];
    setHistory(h => [...h, prompt, ...out, { t: "text", v: "" }]);
  }, [onOpen]);

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (!input.trim()) return;
      setCmdHist(h => [input, ...h]);
      setHistIdx(-1);
      run(input);
      setInput("");
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (!input.trim()) return;
      const matches = ALL_CMDS.filter(c => c.startsWith(input.toLowerCase()));
      if (matches.length === 1) {
        setInput(matches[0]);
      } else if (matches.length > 1) {
        setHistory(h => [...h, { t: "dim", v: "  " + matches.join("   ") }]);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const n = Math.min(histIdx + 1, cmdHist.length - 1);
      setHistIdx(n); setInput(cmdHist[n] || "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const n = Math.max(histIdx - 1, -1);
      setHistIdx(n); setInput(n === -1 ? "" : cmdHist[n]);
    }
  };

  const col = (t: HistoryItem["t"]) =>
    ({ amber: C.amber, green: C.green, red: C.red, blue: C.blue, cyan: C.cyan,
       dim: C.textFaint, prompt: C.amberDim, text: C.text, cmd: C.textDim } as Record<string, string>)[t] ?? C.text;

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      style={{ padding: "12px 16px", fontFamily: MONO, fontSize: 13, lineHeight: 1.6, cursor: "text", height: "100%", boxSizing: "border-box" }}
    >
      {history.map((l, i) => (
        <div key={i} style={{ color: col(l.t), whiteSpace: "pre-wrap", minHeight: "1.6em", animation: "line-in 0.1s ease" }}>{l.v}</div>
      ))}
      <div style={{ display: "flex", alignItems: "center", marginTop: 2 }}>
        <span style={{ color: C.amberDim, marginRight: 8 }}>guest@paoloOS:~$</span>
        <input
          ref={inputRef}
          autoFocus
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          style={{ background: "transparent", border: "none", outline: "none", color: C.amber, fontFamily: MONO, fontSize: 13, flex: 1, caretColor: C.amber }}
        />
      </div>
      <div ref={bottomRef} />
    </div>
  );
}
