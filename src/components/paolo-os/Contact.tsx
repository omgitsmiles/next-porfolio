'use client'

import { useState } from "react";
import { sendEmail } from "../../../actions/sendEmail";
import { useC, RESUME_URL, MONO } from "./theme";
import type { SendStatus } from "./types";

export function Contact({ onToast }: { onToast?: (title: string, sub?: string) => void }) {
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

  const fieldClass = "w-full box-border border rounded-[3px] text-[12px] py-1.5 px-2.5 outline-none";
  const fieldStyle: React.CSSProperties = {
    background: C.win, borderColor: C.border, color: C.text, fontFamily: MONO,
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
      onToast?.("Message sent", "I'll get back to you soon.");
    }
  };

  const resetCompose = () => {
    setCompose(false);
    setStatus("idle");
    setErrMsg("");
    setForm({ email: "", subject: "", message: "" });
  };

  return (
    <div className="relative h-full" style={{ fontFamily: MONO }}>
      <div className="py-3.5 px-[18px]">
        <div className="mb-3.5 text-[11px] tracking-[0.1em]" style={{ color: C.amber }}>
          contact.sh — executable
        </div>
        <div className="flex gap-3 mb-2.5 items-center">
          <span className="min-w-16 text-[11px]" style={{ color: C.textFaint }}>email</span>
          <span
            onClick={() => setCompose(true)}
            className="text-[12px] cursor-pointer"
            style={{ color: C.amber, textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
            onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
          >
            paolo.alberca@gmail.com
          </span>
        </div>
        {links.map(l => (
          <div key={l.label} className="flex gap-3 mb-2.5 items-center">
            <span className="min-w-16 text-[11px]" style={{ color: C.textFaint }}>{l.label}</span>
            <a
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className="text-[12px]"
              style={{
                color: l.label === "resume" || l.label === "blog" ? C.green : C.amber,
                textDecoration: "none",
              }}
              onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
              onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
            >
              {l.val}
            </a>
          </div>
        ))}
        <div className="mt-4 pt-3 border-t" style={{ borderTopColor: C.border }}>
          <div className="text-[11px] mb-3 whitespace-pre" style={{ color: C.textFaint }}>
            {"# Open to new opportunities.\n# Based in NYC — hybrid or remote."}
          </div>
          <button
            onClick={() => setCompose(true)}
            className="border rounded-[3px] text-[11px] py-[5px] px-3.5 cursor-pointer bg-[rgba(255,179,71,0.12)]"
            style={{ borderColor: C.amberDim, color: C.amber, fontFamily: MONO }}
          >
            compose message →
          </button>
        </div>
      </div>

      {compose && (
        <div
          className="absolute inset-0 py-4 px-[18px] flex flex-col z-10 animate-[slide-up_0.2s_ease]"
          style={{ background: C.win }}
        >
          <div className="flex justify-between items-center mb-3.5">
            <span className="text-[11px] tracking-[0.1em]" style={{ color: C.amber }}>compose.sh</span>
            <button
              onClick={resetCompose}
              className="bg-transparent border-none cursor-pointer text-[13px]"
              style={{ color: C.textFaint, fontFamily: MONO }}
            >
              ×
            </button>
          </div>

          {status === "ok" ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2.5">
              <div className="text-[13px]" style={{ color: C.green }}>✓ message sent</div>
              <div className="text-[11px]" style={{ color: C.textFaint }}>I&apos;ll get back to you soon.</div>
              <button
                onClick={resetCompose}
                className="mt-2 bg-transparent border rounded-[3px] text-[11px] py-1 px-3.5 cursor-pointer"
                style={{ borderColor: C.border, color: C.textDim, fontFamily: MONO }}
              >
                close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 flex-1">
              <div>
                <div className="text-[10px] mb-1" style={{ color: C.textFaint }}>your email</div>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className={fieldClass}
                  style={fieldStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = C.amberDim)}
                  onBlur={e => (e.currentTarget.style.borderColor = C.border)}
                />
              </div>
              <div>
                <div className="text-[10px] mb-1" style={{ color: C.textFaint }}>subject</div>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  className={fieldClass}
                  style={fieldStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = C.amberDim)}
                  onBlur={e => (e.currentTarget.style.borderColor = C.border)}
                />
              </div>
              <div className="flex-1 flex flex-col">
                <div className="text-[10px] mb-1" style={{ color: C.textFaint }}>message</div>
                <textarea
                  required
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  className={`${fieldClass} flex-1 resize-none min-h-[90px]`}
                  style={fieldStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = C.amberDim)}
                  onBlur={e => (e.currentTarget.style.borderColor = C.border)}
                />
              </div>
              {status === "error" && (
                <div className="text-[11px]" style={{ color: C.red }}>⚠ {errMsg}</div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={resetCompose}
                  className="bg-transparent border rounded-[3px] text-[11px] py-[5px] px-3.5 cursor-pointer"
                  style={{ borderColor: C.border, color: C.textDim, fontFamily: MONO }}
                >
                  cancel
                </button>
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="rounded-[3px] text-[11px] py-[5px] px-3.5"
                  style={{
                    background: status === "sending" ? "rgba(255,179,71,0.06)" : "rgba(255,179,71,0.15)",
                    border: `1px solid ${C.amberDim}`,
                    color: status === "sending" ? C.textFaint : C.amber,
                    fontFamily: MONO, cursor: status === "sending" ? "default" : "pointer",
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
