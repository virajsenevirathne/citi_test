"use client";

// A minimal, synchronous flag (not reactive state) so navigation links can check
// "is a practice test in progress?" at click time and confirm before leaving.
let inProgress = false;

export function setTestInProgress(value: boolean) {
  inProgress = value;
}

export function isTestInProgress() {
  return inProgress;
}

export function confirmLeaveIfTestInProgress(): boolean {
  if (!inProgress) return true;
  const shouldLeave = window.confirm(
    "You have a practice test in progress. Leave anyway? Your answers for this attempt will be lost."
  );
  if (shouldLeave) inProgress = false;
  return shouldLeave;
}

// Browser-Back guard: pushes one synthetic history entry (same URL, marked
// state) so the first Back press pops it and fires popstate instead of
// immediately leaving. At most one of these ever exists at a time — repeated
// test attempts reuse it rather than stacking — so a single history.back()
// always fully and predictably leaves.
interface GuardState {
  acpTestGuard: true;
}

function hasGuardEntry(): boolean {
  const state = window.history.state as GuardState | null;
  return Boolean(state && state.acpTestGuard);
}

export function ensureHistoryGuardEntry() {
  if (!hasGuardEntry()) {
    window.history.pushState({ acpTestGuard: true } satisfies GuardState, "");
  }
}

// Silently consumes the guard entry (if we're currently sitting on one) via a
// same-URL history.back(), so a *real* subsequent Back press from the user
// goes straight to wherever they were before the test, with no leftover
// no-op press. Safe to call unconditionally after a test ends.
export function consumeHistoryGuardEntryIfPresent() {
  if (hasGuardEntry()) {
    window.history.back();
  }
}
