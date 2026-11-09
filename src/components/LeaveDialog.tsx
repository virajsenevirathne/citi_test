"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { registerLeaveDialog } from "@/lib/testGuard";

// In-page replacement for window.confirm(): always visible, styled, keyboard
// accessible (Esc = stay) and never silently suppressed by the browser.
export default function LeaveDialog() {
  const [open, setOpen] = useState(false);
  const resolver = useRef<((leave: boolean) => void) | null>(null);
  const stayRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    registerLeaveDialog((resolve) => {
      resolver.current?.(false);
      resolver.current = resolve;
      setOpen(true);
    });
    return () => registerLeaveDialog(null);
  }, []);

  const answer = useCallback((leave: boolean) => {
    resolver.current?.(leave);
    resolver.current = null;
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    stayRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") answer(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, answer]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/50 p-4 sm:items-center" onClick={() => answer(false)}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="leave-title"
        aria-describedby="leave-desc"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm space-y-3 rounded-2xl border border-card-border bg-card p-6 shadow-2xl"
      >
        <h2 id="leave-title" className="text-lg font-semibold">Leave this test?</h2>
        <p id="leave-desc" className="text-sm text-muted">
          Your answers for this attempt will be lost.
        </p>
        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <button onClick={() => answer(true)} className="min-h-12 rounded-xl border border-card-border px-5 text-sm font-medium transition hover:border-red-700 hover:text-red-700 active:scale-95">
            Leave test
          </button>
          <button ref={stayRef} onClick={() => answer(false)} className="min-h-12 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:brightness-110 active:scale-95">
            Keep going
          </button>
        </div>
      </div>
    </div>
  );
}
