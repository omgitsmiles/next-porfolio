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
    { t: "text",  v: "  TypeScript · JavaScript · Java · Python · Ruby · SQL" },
    { t: "amber", v: "FRAMEWORKS" },
    { t: "text",  v: "  React · Next.js · Spring Boot · Django · Rails" },
    { t: "amber", v: "INFRA & TOOLS" },
    { t: "text",  v: "  AWS · Docker · Kafka · Terraform · Jenkins · Spinnaker · MCP · GraphQL" },
    { t: "amber", v: "DATABASES" },
    { t: "text",  v: "  PostgreSQL · MongoDB · ChromaDB" },
    { t: "amber", v: "TESTING" },
    { t: "text",  v: "  JUnit · Cucumber · Jest · Gremlin · Jmeter" },
    { t: "amber", v: "ML" },
    { t: "text",  v: "  scikit-learn" },
  ],
  "cat resume": () => [
    { t: "amber", v: "─── PAOLO ALBERCA ──────────────────────────────────" },
    { t: "dim",   v: "Software Engineer | New York, NY" },
    { t: "dim",   v: "paolo.alberca@gmail.com | paoloalberca.com" },
    { t: "text",  v: "" },
    { t: "amber", v: "EXPERIENCE" },
    { t: "green", v: "Software Engineer — JPMorgan Chase (Apr 2025–present)" },
    { t: "text",  v: "  · Data pipeline API — 12% lift in offer conversions" },
    { t: "text",  v: "  · Enrollment & eligibility engine for partner systems" },
    { t: "text",  v: "  · Gremlin SME — -10% MTTR" },
    { t: "text",  v: "  · Dockerized Kafka dev environment" },
    { t: "text",  v: "  · MCP server — OpenAPI validation in IDE copilot chat" },
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
    { t: "amber", v: "┌──────────┐ OS: PaoloOS 3.5.0" },
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

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function tokenize(q: string): string[] {
  return q.toLowerCase().match(/[a-z0-9]+/g) ?? [];
}

// Tolerates typos/plurals: exact match, prefix match, or a small edit distance.
function fuzzyHit(tok: string, kw: string): boolean {
  if (tok === kw) return true;
  if (tok.length >= 4 && (kw.startsWith(tok) || tok.startsWith(kw))) return true;
  const maxLen = Math.max(tok.length, kw.length);
  if (maxLen < 4) return false;
  const allowed = maxLen <= 5 ? 1 : 2;
  return levenshtein(tok, kw) <= allowed;
}

type Topic = {
  id: string;
  keywords: string[];
  respond: () => HistoryItem[];
  more?: () => HistoryItem[];
};

const TOPICS: Topic[] = [
  {
    id: "identity",
    keywords: ["who", "yourself", "assistant"],
    respond: () => [
      { t: "cyan", v: "I'm PaoloOS — Paolo's portfolio AI." },
      { t: "text", v: "Built to help you explore this terminal OS." },
      { t: "dim",  v: "Try: ai tell me about paolo" },
    ],
    more: () => [
      { t: "dim", v: "That's really it — I'm a keyword matcher, not a real model." },
      { t: "dim", v: "Ask 'ai mcp' to see Paolo's actual AI work." },
    ],
  },
  {
    id: "sentient",
    keywords: ["sentient", "conscious", "alive", "human", "robot", "selfaware"],
    respond: () => [
      { t: "cyan", v: "Not quite." },
      { t: "text", v: "I'm a keyword-matched response table, not a real model —" },
      { t: "dim",  v: "no neural net here, just regex and good intentions." },
      { t: "dim",  v: "(Paolo's actual AI work: ai mcp)" },
    ],
    more: () => [
      { t: "dim", v: "Still just pattern matching, promise. Try: ai mcp" },
    ],
  },
  {
    id: "about",
    keywords: ["about", "tell", "background", "story", "bio", "paolo"],
    respond: () => [
      { t: "amber", v: "Paolo Alberca" },
      { t: "text",  v: "Software Engineer based in New York, NY." },
      { t: "dim",   v: "Former healthcare sales rep turned full-stack engineer." },
      { t: "dim",   v: "Volunteer tech interviewer at NYC Tech Talent Pipeline." },
      { t: "dim",   v: "Currently at JPMorgan Chase. Previously at WeVote." },
      { t: "dim",   v: "Run 'whoami' or 'cat resume' for more." },
    ],
    more: () => [
      { t: "amber", v: "More" },
      { t: "text",  v: "Flatiron School grad (2022), SUNY Stony Brook B.S. Health Science." },
      { t: "dim",   v: "Cares about the people downstream of a system, not just the code." },
    ],
  },
  {
    id: "skills",
    keywords: ["skill", "skills", "tech", "technology", "stack", "know", "language", "languages", "framework", "frameworks", "programming"],
    respond: () => [...COMMANDS.skills()],
    more: () => [
      { t: "dim", v: "That's the full stack — see 'open projects' for it in action." },
    ],
  },
  {
    id: "experience",
    keywords: ["experience", "work", "job", "jobs", "career", "history", "employ", "employer", "employment"],
    respond: () => [
      { t: "amber", v: "EXPERIENCE" },
      { t: "green", v: "Software Engineer — JPMorgan Chase (Apr 2025–present)" },
      { t: "text",  v: "  Data pipelines, eligibility systems, Gremlin, Kafka, MCP tooling" },
      { t: "green", v: "Software Engineer — WeVote (Jul 2024–Feb 2025)" },
      { t: "text",  v: "  DB optimization, Material UI, Storybook" },
      { t: "dim",   v: "  Run 'cat resume' for the full picture." },
    ],
    more: () => [
      { t: "amber", v: "More" },
      { t: "text",  v: "Also: Account Executive at OrthoPro (2019–2025) — $4MM revenue," },
      { t: "text",  v: "18 accounts, mentored a team of 12." },
      { t: "dim",   v: "  → cat resume for the full bullet list" },
    ],
  },
  {
    id: "contact",
    keywords: ["contact", "hire", "reach", "email", "available", "availability"],
    respond: () => [
      { t: "cyan",  v: "Contact Paolo" },
      { t: "amber", v: "  email    → paolo.alberca@gmail.com" },
      { t: "amber", v: "  linkedin → paolo-alberca" },
      { t: "dim",   v: "  Or: open contact" },
    ],
    more: () => [
      { t: "amber", v: "More" },
      { t: "text",  v: "Also on GitHub (omgitsmiles) and Medium (@paolo.alberca)." },
      { t: "dim",   v: "  → open contact for the full list + message form" },
    ],
  },
  {
    id: "projects",
    keywords: ["project", "projects", "build", "built", "made", "portfolio", "code", "app", "apps"],
    respond: () => [
      { t: "cyan", v: "Projects" },
      { t: "text", v: "  Browse all work in the projects window." },
      { t: "dim",  v: "  → open projects" },
    ],
    more: () => [
      { t: "amber", v: "More" },
      { t: "text",  v: "7 projects: CookSys Project Manager, Money Magnet, LearnLink," },
      { t: "text",  v: "Budget Buddy, BookEnds, Ullr, Creed Thoughts." },
      { t: "dim",   v: "  → open projects for tags + repo links" },
    ],
  },
  {
    id: "snake",
    keywords: ["snake", "game", "games", "play", "fun"],
    respond: () => [
      { t: "cyan",  v: "PaoloOS Snake" },
      { t: "text",  v: "  Arrow keys to move · Space to start." },
      { t: "green", v: "  → open snake" },
    ],
    more: () => [
      { t: "dim", v: "Same deal — arrows to move, space to start. Good luck." },
    ],
  },
  {
    id: "theme",
    keywords: ["theme", "themes", "color", "colour", "dark", "light", "wallpaper"],
    respond: () => [
      { t: "cyan", v: "Themes" },
      { t: "text", v: "  Sonoma · Monterey · Big Sur · Mojave" },
      { t: "dim",  v: "  Palette icon in the menu bar — or right-click desktop." },
    ],
    more: () => [
      { t: "dim", v: "That's the full list — Sonoma · Monterey · Big Sur · Mojave." },
    ],
  },
  {
    id: "hello",
    keywords: ["hello", "hi", "hey", "sup", "yo", "greetings"],
    respond: () => [
      { t: "cyan", v: "Hey there!" },
      { t: "text", v: "  Welcome to PaoloOS." },
      { t: "dim",  v: "  Try: ai tell me about paolo" },
    ],
    more: () => [
      { t: "dim", v: "Still just saying hi. Try: ai tell me about paolo" },
    ],
  },
  {
    id: "education",
    keywords: ["education", "school", "degree", "study", "studied", "college", "university"],
    respond: () => [
      { t: "amber", v: "EDUCATION" },
      { t: "text",  v: "  Flatiron School — Full Stack Web Dev (2022)" },
      { t: "text",  v: "  SUNY Stony Brook — B.S. Health Science" },
      { t: "dim",   v: "  Made the jump from healthcare sales to engineering." },
    ],
    more: () => [
      { t: "amber", v: "More" },
      { t: "text",  v: "Flatiron: Full Stack Web Dev, Jul–Dec 2022." },
      { t: "text",  v: "Stony Brook: B.S. Health Science — the healthcare-sales era." },
    ],
  },
  {
    id: "volunteer",
    keywords: ["volunteer", "volunteering", "mentor", "mentorship", "interviewer", "pipeline", "community"],
    respond: () => [
      { t: "cyan", v: "Volunteering" },
      { t: "text", v: "  NYC Tech Talent Pipeline — Volunteer Technical Interviewer" },
      { t: "dim",  v: "  Feb 2023–present. Runs technical assessments and mentors" },
      { t: "dim",  v: "  graduating CS students making the same career jump he did." },
    ],
    more: () => [
      { t: "amber", v: "More" },
      { t: "text",  v: "Helps build interview frameworks, evaluation rubrics, and" },
      { t: "text",  v: "candidate assessment standards for the program." },
      { t: "dim",   v: "  → open about (see VOLUNTEERING section)" },
    ],
  },
  {
    id: "blog",
    keywords: ["blog", "medium", "write", "writing", "article", "articles", "post", "posts"],
    respond: () => [
      { t: "cyan", v: "Writing" },
      { t: "text", v: "  Paolo posts on Medium as @paolo.alberca." },
      { t: "dim",  v: "  → open contact (blog link)" },
    ],
    more: () => [
      { t: "dim", v: "That's the link — @paolo.alberca on Medium." },
    ],
  },
  {
    id: "pitch",
    keywords: ["why", "pitch", "strength", "strengths", "standout", "opportunity", "hire"],
    respond: () => [
      { t: "cyan", v: "Why Paolo?" },
      { t: "text", v: "  Came up through healthcare sales before engineering —" },
      { t: "text", v: "  brings a people-first lens most engineers don't have." },
      { t: "dim",  v: "  Shipped measurable wins: +12% conversions, -10% MTTR," },
      { t: "dim",  v: "  -16% post-deploy incidents, +14% fetch speed." },
    ],
    more: () => [
      { t: "amber", v: "More" },
      { t: "text",  v: "Comfortable across the stack: APIs, resiliency testing," },
      { t: "text",  v: "dev tooling, and now AI/MCP tooling for IDE workflows." },
      { t: "dim",   v: "  → cat resume · open contact" },
    ],
  },
  {
    id: "mcp",
    keywords: ["mcp", "claude", "copilot", "anthropic", "openapi", "schema", "llm"],
    respond: () => [
      { t: "cyan", v: "AI tooling" },
      { t: "text", v: "  Built an MCP server at JPMorgan running an OpenAPI schema" },
      { t: "text", v: "  validator against the approved business dictionary —" },
      { t: "dim",  v: "  brings validation into IDE copilot chat instead of a" },
      { t: "dim",  v: "  separate tool." },
    ],
    more: () => [
      { t: "amber", v: "More" },
      { t: "text",  v: "Eliminated a lot of back-and-forth checking whether edits" },
      { t: "text",  v: "improved OpenAPI validation scores." },
      { t: "dim",   v: "  → cat resume" },
    ],
  },
];

function scoreTopic(tokens: string[], topic: Topic): number {
  let score = 0;
  for (const tok of tokens) {
    for (const kw of topic.keywords) {
      if (tok === kw) { score += 2; break; }
      if (fuzzyHit(tok, kw)) { score += 1; break; }
    }
  }
  return score;
}

function matchTopic(tokens: string[]): Topic | null {
  let best: Topic | null = null;
  let bestScore = 0;
  for (const topic of TOPICS) {
    const s = scoreTopic(tokens, topic);
    if (s > bestScore) { bestScore = s; best = topic; }
  }
  return best;
}

// Whole-message follow-up cues, checked against the trimmed (already-lowercased) query.
const FOLLOWUP_RE = [
  /^(tell me )?more$/,
  /^(what|anything) else\??$/,
  /^go on$/,
  /^continue$/,
  /^elaborate( on that)?$/,
  /^expand( on that)?$/,
  /^and\??$/,
  /^keep going$/,
];

function getAiResponse(q: string, lastTopicId: string | null): { items: HistoryItem[]; topicId: string | null } {
  if (!q) return {
    items: [
      { t: "cyan", v: "PaoloOS AI v1.3" },
      { t: "dim",  v: "Ask me something. Try: ai who is paolo" },
    ],
    topicId: lastTopicId,
  };

  const trimmed = q.trim();
  if (lastTopicId && FOLLOWUP_RE.some(re => re.test(trimmed))) {
    const topic = TOPICS.find(t => t.id === lastTopicId);
    if (topic) return { items: (topic.more ?? topic.respond)(), topicId: lastTopicId };
  }

  const match = matchTopic(tokenize(q));
  if (match) return { items: match.respond(), topicId: match.id };

  return {
    items: [
      { t: "red", v: `  Unknown: "${q}"` },
      { t: "dim", v: "  Try: skills · experience · contact · projects · education · volunteering · mcp" },
    ],
    topicId: lastTopicId,
  };
}

export function Terminal({ onOpen, ready }: { onOpen: (target: string) => void; ready?: boolean }) {
  const C = useC();
  const [history, setHistory] = useState<HistoryItem[]>([
    { t: "amber", v: "PaoloOS Terminal v3.5.1" },
    { t: "dim",   v: "Type 'help' to get started." },
    { t: "text",  v: "" },
  ]);
  const [input, setInput]     = useState("");
  const [cmdHist, setCmdHist] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [lastAiTopic, setLastAiTopic] = useState<string | null>(null);
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
      const { items, topicId } = getAiResponse(q, lastAiTopic);
      setLastAiTopic(topicId);
      setHistory(h => [...h, prompt, ...items, { t: "text", v: "" }]);
      return;
    }
    const fn  = COMMANDS[cmd];
    const out = fn ? fn() : [{ t: "red" as const, v: `Command not found: ${raw}. Try 'help'.` }];
    setHistory(h => [...h, prompt, ...out, { t: "text", v: "" }]);
  }, [onOpen, lastAiTopic]);

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
      className="px-4 py-3 text-[13px] leading-[1.6] cursor-text h-full box-border"
      style={{ fontFamily: MONO }}
    >
      {history.map((l, i) => (
        <div key={i} className="whitespace-pre-wrap min-h-[1.6em] animate-[line-in_0.1s_ease]" style={{ color: col(l.t) }}>{l.v}</div>
      ))}
      <div className="flex items-center mt-0.5">
        <span className="mr-2" style={{ color: C.amberDim }}>guest@paoloOS:~$</span>
        <input
          ref={inputRef}
          autoFocus
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          className="bg-transparent border-none outline-none text-[13px] flex-1"
          style={{ color: C.amber, fontFamily: MONO, caretColor: C.amber }}
        />
      </div>
      <div ref={bottomRef} />
    </div>
  );
}
