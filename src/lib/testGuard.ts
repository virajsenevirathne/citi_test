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

const LEAVE_CONFIRM_MESSAGE =
  "You have a practice test in progress. Leave anyway? Your answers for this attempt will be lost.";

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

/**
 * Use for in-app navigation (Link clicks in BottomNav/Header) while a test
 * may be in progress. If no test is in progress, `navigate` runs immediately.
 * Otherwise the user is asked to confirm; if they do, the synthetic guard
 * entry (if any) is consumed *first* and `navigate` only runs once that pop
 * has actually completed — otherwise the destination would get pushed while
 * still "on" the guard entry, leaving it stranded in history where a later
 * Back press would land on the stale /practice-test route unexpectedly.
 */
export function guardedNavigate(navigate: () => void) {
  if (!inProgress) {
    navigate();
    return;
  }
  const shouldLeave = window.confirm(LEAVE_CONFIRM_MESSAGE);
  if (!shouldLeave) return;
  inProgress = false;
  if (hasGuardEntry()) {
    const onPopState = () => {
      window.removeEventListener("popstate", onPopState);
      navigate();
    };
    window.addEventListener("popstate", onPopState);
    window.history.back();
  } else {
    navigate();
  }
}
