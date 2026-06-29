'use client'

import { useC, MONO } from "./theme";

function Divider({ label }: { label: string }) {
  const C = useC();
  return (
    <div style={{ color: C.amber, fontSize: 11, letterSpacing: "0.07em", margin: "18px 0 10px" }}>
      ── {label} {Array(Math.max(0, 38 - label.length)).fill("─").join("")}
    </div>
  );
}

export function About() {
  const C = useC();

  const meta = [
    ["name",     "Paolo Alberca"],
    ["role",     "Software Engineer"],
    ["location", "New York, NY"],
    ["company",  "JPMorgan Chase"],
    ["github",   "omgitsmiles"],
    ["email",    "paolo.alberca@gmail.com"],
  ];

  const experience = [
    {
      role: "Software Engineer", company: "JPMorgan Chase", period: "Apr 2025–present",
      bullets: [
        "Data pipeline API · 12% lift in offer conversions",
        "Gremlin SME · –10% MTTR",
        "Dockerized Kafka dev environment",
        "Full testing pyramid · –16% post-deploy incidents",
      ],
    },
    {
      role: "Software Engineer", company: "WeVote", period: "Jul 2024–Feb 2025",
      bullets: [
        "DB refactor · +14% fetch speed",
        "Material UI redesign, Storybook design system",
      ],
    },
  ];

  return (
    <div style={{
      padding: "14px 18px", fontFamily: MONO, fontSize: 12,
      lineHeight: 1.75, overflow: "auto", height: "100%",
      boxSizing: "border-box", color: C.textDim,
    }}>
      {meta.map(([k, v]) => (
        <div key={k} style={{ display: "flex", gap: 12, marginBottom: 2 }}>
          <span style={{ color: C.textFaint, minWidth: 72, fontSize: 11 }}>{k}</span>
          <span style={{ color: C.text }}>{v}</span>
        </div>
      ))}

      <Divider label="BIO" />
      <p style={{ margin: "0 0 8px" }}>
        I came into engineering sideways — a decade in healthcare sales and account
        management before retraining at Flatiron School in 2022. That path shapes how
        I work: I care as much about the people downstream of a system as the system itself.
      </p>
      <p style={{ margin: 0 }}>
        Currently at JPMorgan Chase building data pipelines and resiliency tooling. I also
        volunteer as a technical interviewer at the NYC Tech Talent Pipeline, helping
        graduating CS students make the same jump I did.
      </p>

      <Divider label="EXPERIENCE" />
      {experience.map(e => (
        <div key={e.company} style={{ marginBottom: 14 }}>
          <div style={{ color: C.green }}>{e.role} — {e.company}</div>
          <div style={{ color: C.textFaint, fontSize: 11, marginBottom: 4 }}>{e.period}</div>
          {e.bullets.map(b => (
            <div key={b} style={{ color: C.textDim }}>  · {b}</div>
          ))}
        </div>
      ))}

      <Divider label="EDUCATION" />
      <div>Flatiron School <span style={{ color: C.textFaint }}>· Full Stack Web Development · 2022</span></div>
      <div>SUNY Stony Brook <span style={{ color: C.textFaint }}>· B.S. Health Science</span></div>

      <Divider label="VOLUNTEERING" />
      <div style={{ color: C.green }}>NYC Tech Talent Pipeline</div>
      <div style={{ color: C.textFaint, fontSize: 11, marginBottom: 4 }}>Volunteer Technical Interviewer · Feb 2023–present</div>
      <div>Conduct technical assessments, provide feedback and mentorship to graduating CS students.</div>
    </div>
  );
}
