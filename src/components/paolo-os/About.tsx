'use client'

import { useC, RESUME_URL, MONO } from "./theme";

function Divider({ label }: { label: string }) {
  const C = useC();
  return (
    <div className="text-[11px] tracking-[0.07em] mt-[18px] mb-2.5" style={{ color: C.amber }}>
      ── {label} {Array(Math.max(0, 38 - label.length)).fill("─").join("")}
    </div>
  );
}

export function About() {
  const C = useC();

  const meta: [string, string, string?][] = [
    ["name",     "Paolo Alberca"],
    ["role",     "Software Engineer"],
    ["location", "New York, NY"],
    ["company",  "JPMorgan Chase"],
    ["github",   "omgitsmiles"],
    ["email",    "paolo.alberca@gmail.com"],
    ["resume",   "resume.pdf →", RESUME_URL],
  ];

  const skills = [
    ["languages",  "TypeScript, JavaScript, Java, Python, Ruby, SQL"],
    ["frameworks", "React, Next.js, Spring Boot, Django, Rails"],
    ["infra&tools",      "AWS, Docker, Kafka, Terraform, Jenkins, Spinnaker, MCP, GraphQL"],
    ["data",       "PostgreSQL, MongoDB, scikit-learn"],
    ["testing",    "JUnit, Cucumber, Jest, Gremlin"],
  ];

  const experience = [
    {
      role: "Software Engineer", company: "JPMorgan Chase", period: "Apr 2025–present",
      bullets: [
        "Data pipeline API · 12% lift in offer conversions",
        "Enrollment & eligibility engine for partner systems",
        "Gremlin SME · –10% MTTR",
        "Dockerized Kafka dev environment",
        "MCP server · OpenAPI validation in IDE copilot chat",
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
    {
      role: "Account Executive", company: "OrthoPro", period: "Sep 2019–Apr 2025",
      bullets: [
        "CRM for prescription tracking · 47% sales growth",
        "18 accounts, 43 physicians · $4MM revenue",
        "Mentored team of 12 · +26% YoY revenue",
      ],
    },
  ];

  return (
    <div
      className="px-[18px] py-3.5 text-xs leading-[1.75] overflow-auto h-full box-border"
      style={{ fontFamily: MONO, color: C.textDim }}
    >
      {meta.map(([k, v, href]) => (
        <div key={k} className="flex gap-3 mb-0.5">
          <span className="min-w-[72px] text-[11px]" style={{ color: C.textFaint }}>{k}</span>
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline"
              style={{ color: C.green }}
            >
              {v}
            </a>
          ) : (
            <span style={{ color: C.text }}>{v}</span>
          )}
        </div>
      ))}

      <Divider label="BIO" />
      <p className="mt-0 mb-2">
        I came into engineering sideways — a decade in healthcare sales and account
        management before retraining at Flatiron School in 2022. That path shapes how
        I work: I care as much about the people downstream of a system as the system itself.
      </p>
      <p className="m-0">
        Currently at JPMorgan Chase building data pipelines, eligibility systems, and
        resiliency testing and tooling, including an MCP server that brings schema validation
        into the IDE. I also volunteer as a technical interviewer at the NYC Tech
        Talent Pipeline, helping graduating CS students make the same jump I did.
      </p>

      <Divider label="SKILLS" />
      {skills.map(([k, v]) => (
        <div key={k} className="flex gap-3 mb-0.5">
          <span className="min-w-[72px] text-[11px]" style={{ color: C.textFaint }}>{k}</span>
          <span style={{ color: C.text }}>{v}</span>
        </div>
      ))}

      <Divider label="EXPERIENCE" />
      {experience.map(e => (
        <div key={e.company} className="mb-3.5">
          <div style={{ color: C.green }}>{e.role} — {e.company}</div>
          <div className="text-[11px] mb-1" style={{ color: C.textFaint }}>{e.period}</div>
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
      <div className="text-[11px] mb-1" style={{ color: C.textFaint }}>Volunteer Technical Interviewer · Feb 2023–present</div>
      <div>Conduct technical assessments, provide feedback and mentorship to graduating CS students.</div>
    </div>
  );
}
