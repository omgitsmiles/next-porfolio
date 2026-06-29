'use client'

import { useState } from "react";
import { sendEmail } from "../../../actions/sendEmail";
import { useC, RESUME_URL, MONO } from "./theme";
import type { SendStatus } from "./types";

export function Contact() {
  const C = useC();
  const [compose, setCompose] = useState(false);
  const [form, setForm]       = useState({ email: "", subject: "", message: "" });
  const [status, setStatus]   = useState<SendStatus>("idle");
  const [errMsg, setErrMsg]   = useState("");

  const links = [
    { label: "phone",    val: "(+1) 516-508-1259",        href: "tel:+15165081259" },
    { label: "resume",   val: "resume.pdf →",             href: RESUME_URL },
    { label: "blog",     val: "@paolo.alberca →",         href: "https://medium.com/@paolo.alberca" },
    { label: "github",   val: "omgitsmiles",               href: "https://github.com/omgitsmiles" },
    { label: "linkedin", val: "paolo-alberca",             href: "https://linkedin.com/in/paolo-alberca" },
  ];

  const field: React.CSSProperties = {
    width: "100%", boxSizing: "border-box",
    background: C.win, border: `1px solid ${C.border}`,
    borderRadius: 3, color: C.text, fontFamily: MONO, fontSize: 12,
    padding: "6px 10px", outline: "none",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    const fd = new FormData();
    fd.append("senderEmail", form.email);
    fd.append("subject",     form.subject);
    fd.append("message",     form.message);
    const result = await sendEmail(fd);
    if ("error" in result && result.error) {
      setStatus("error");
      setErrMsg(result.error);
    } else {
      setStatus("ok");
    }
  };

  const resetCompose = () => {
    setCompose(false);
    setStatus("idle");
    setErrMsg("");
    setForm({ email: "", subject: "", message: "" });
  };

  return (
    <div style={{ position: "relative", height: "100%", fontFamily: MONO }}>
      <div style={{ padding: "14px 18px" }}>
        <div style={{ color: C.amber, marginBottom: 14, fontSize: 11, letterSpacing: "0.1em" }}>
          contact.sh — executable
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: 10, alignItems: "center" }}>
          <span style={{ color: C.textFaint, minWidth: 64, fontSize: 11 }}>email</span>
          <span
            onClick={() => setCompose(true)}
            style={{ color: C.amber, fontSize: 12, cursor: "pointer", textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
            onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
          >
            paolo.alberca@gmail.com
          </span>
        </div>
        {links.map(l => (
          <div key={l.label} style={{ display: "flex", gap: 12, marginBottom: 10, alignItems: "center" }}>
            <span style={{ color: C.textFaint, minWidth: 64, fontSize: 11 }}>{l.label}</span>
            <a
              href={l.href}
              target="_blank"
              rel="noreferrer"
              style={{
                color: l.label === "resume" || l.label === "blog" ? C.green : C.amber,
                textDecoration: "none", fontSize: 12,
              }}
              onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
              onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
            >
              {l.val}
            </a>
          </div>
        ))}
        <div style={{ marginTop: 16, borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
          <div style={{ fontSize: 11, color: C.textFaint, marginBottom: 12, whiteSpace: "pre" }}>
            {"# Open to new opportunities.\n# Based in NYC — hybrid or remote."}
          </div>
          <button
            onClick={() => setCompose(true)}
            style={{
              background: "rgba(255,179,71,0.12)", border: `1px solid ${C.amberDim}`,
              borderRadius: 3, color: C.amber, fontFamily: MONO, fontSize: 11,
              padding: "5px 14px", cursor: "pointer",
            }}
          >
            compose message →
          </button>
        </div>
      </div>

      {compose && (
        <div style={{
          position: "absolute", inset: 0, background: C.win,
          padding: "16px 18px", display: "flex", flexDirection: "column",
          zIndex: 10,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ color: C.amber, fontSize: 11, letterSpacing: "0.1em" }}>compose.sh</span>
            <button
              onClick={resetCompose}
              style={{ background: "none", border: "none", color: C.textFaint, cursor: "pointer", fontSize: 13, fontFamily: MONO }}
            >
              ×
            </button>
          </div>

          {status === "ok" ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <div style={{ color: C.green, fontSize: 13 }}>✓ message sent</div>
              <div style={{ color: C.textFaint, fontSize: 11 }}>I&apos;ll get back to you soon.</div>
              <button
                onClick={resetCompose}
                style={{ marginTop: 8, background: "none", border: `1px solid ${C.border}`, borderRadius: 3, color: C.textDim, fontFamily: MONO, fontSize: 11, padding: "4px 14px", cursor: "pointer" }}
              >
                close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
              <div>
                <div style={{ fontSize: 10, color: C.textFaint, marginBottom: 4 }}>your email</div>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  style={field}
                  onFocus={e => (e.currentTarget.style.borderColor = C.amberDim)}
                  onBlur={e => (e.currentTarget.style.borderColor = C.border)}
                />
              </div>
              <div>
                <div style={{ fontSize: 10, color: C.textFaint, marginBottom: 4 }}>subject</div>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  style={field}
                  onFocus={e => (e.currentTarget.style.borderColor = C.amberDim)}
                  onBlur={e => (e.currentTarget.style.borderColor = C.border)}
                />
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 10, color: C.textFaint, marginBottom: 4 }}>message</div>
                <textarea
                  required
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  style={{ ...field, flex: 1, resize: "none", minHeight: 90 }}
                  onFocus={e => (e.currentTarget.style.borderColor = C.amberDim)}
                  onBlur={e => (e.currentTarget.style.borderColor = C.border)}
                />
              </div>
              {status === "error" && (
                <div style={{ color: C.red, fontSize: 11 }}>⚠ {errMsg}</div>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button
                  type="button"
                  onClick={resetCompose}
                  style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 3, color: C.textDim, fontFamily: MONO, fontSize: 11, padding: "5px 14px", cursor: "pointer" }}
                >
                  cancel
                </button>
                <button
                  type="submit"
                  disabled={status === "sending"}
                  style={{
                    background: status === "sending" ? "rgba(255,179,71,0.06)" : "rgba(255,179,71,0.15)",
                    border: `1px solid ${C.amberDim}`, borderRadius: 3,
                    color: status === "sending" ? C.textFaint : C.amber,
                    fontFamily: MONO, fontSize: 11, padding: "5px 14px", cursor: status === "sending" ? "default" : "pointer",
                  }}
                >
                  {status === "sending" ? "sending…" : "send →"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
