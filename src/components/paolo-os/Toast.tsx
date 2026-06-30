'use client'

import { useEffect } from "react";
import { useC, MONO } from "./theme";
import type { ToastItem } from "./types";

type Props = {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
};

export function Toaster({ toasts, onDismiss }: Props) {
  return (
    <div style={{
      position: "fixed", top: 36, right: 12, zIndex: 6000,
      display: "flex", flexDirection: "column", gap: 8,
      pointerEvents: "none",
    }}>
      {toasts.map(t => (
        <ToastCard key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  const C = useC();

  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss]);

  return (
    <div
      onClick={() => onDismiss(toast.id)}
      style={{
        background: C.winBar, border: `1px solid ${C.border}`,
        borderRadius: 8, padding: "10px 14px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.55)",
        minWidth: 230, maxWidth: 300,
        pointerEvents: "all", cursor: "pointer",
        animation: "toast-in 0.22s ease",
      }}
    >
      <div style={{ color: C.amber, fontFamily: MONO, fontSize: 12, fontWeight: 600 }}>
        {toast.title}
      </div>
      {toast.sub && (
        <div style={{ color: C.textFaint, fontFamily: MONO, fontSize: 10, marginTop: 3 }}>
          {toast.sub}
        </div>
      )}
    </div>
  );
}
