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
    <div className="fixed top-9 right-3 z-[6000] flex flex-col gap-2 pointer-events-none">
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
      className="border rounded-lg py-2.5 px-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.55)] min-w-[230px] max-w-[300px] pointer-events-auto cursor-pointer animate-[toast-in_0.22s_ease]"
      style={{ background: C.winBar, borderColor: C.border }}
    >
      <div className="text-xs font-semibold" style={{ color: C.amber, fontFamily: MONO }}>
        {toast.title}
      </div>
      {toast.sub && (
        <div className="text-[10px] mt-[3px]" style={{ color: C.textFaint, fontFamily: MONO }}>
          {toast.sub}
        </div>
      )}
    </div>
  );
}
