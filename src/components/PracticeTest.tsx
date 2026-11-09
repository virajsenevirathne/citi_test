"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { allQuestions, PARTS } from "@/content";
import { CheckIcon, FlagIcon, TargetIcon, TimerIcon } from "@/components/icons";
import { buildPracticeTest, scoreTest, withShuffledOptions, type ShuffledQuestion } from "@/lib/quiz";
import {
  addTestHistory,
  getTestHistoryServerSnapshot,
  getTestHistorySnapshot,
  subscribe,
  type TestHistoryEntry,
} from "@/lib/storage";
import {
  confirmLeave,
  consumeHistoryGuardEntryIfPresent,
  ensureHistoryGuardEntry,
  forgetGuardEntry,
  notifyGuardPopped,
  isTestInProgress,
  setTestInProgress,
} from "@/lib/testGuard";

type Stage = "intro" | "in-progress" | "review" | "results";
type Mode = "practice" | "exam";

const EXAM_SECONDS = 45 * 60;

function formatTime(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const btnPrimary =
  "min-h-12 whitespace-nowrap rounded-xl bg-primary px-5 sm:px-6 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-110 active:scale-95";
const btnSecondary =
  "min-h-12 whitespace-nowrap rounded-xl border border-card-border bg-card px-3.5 sm:px-5 text-sm font-medium transition hover:border-primary active:scale-95 disabled:opacity-40 disabled:hover:border-card-border";

export default function PracticeTest() {
  const [stage, setStage] = useState<Stage>("intro");
  const [mode, setMode] = useState<Mode>("practice");
  const [questions, setQuestions] = useState<ShuffledQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [remaining, setRemaining] = useState(EXAM_SECONDS);
  const [timedOut, setTimedOut] = useState(false);
  const [wrongOnly, setWrongOnly] = useState(true);
  const history = useSyncExternalStore(subscribe, getTestHistorySnapshot, getTestHistoryServerSnapshot);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const isFirstRender = useRef(true);
  const deadline = useRef(0);
  const finishRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [stage, current]);

  useEffect(() => {
    return () => setTestInProgress(false);
  }, []);

  // New question → start at its top; keep the active number visible in the strip.
  useEffect(() => {
    if (stage !== "in-progress") return;
    window.scrollTo({ top: 0 });
    document
      .querySelector('nav[aria-label="Questions"] [aria-current="step"]')
      ?.scrollIntoView({ inline: "nearest", block: "nearest" });
  }, [stage, current]);

  const feedbackRef = useRef<HTMLDivElement>(null);
  const hasFeedback = stage === "in-progress" && mode === "practice" && Boolean(questions[current] && answers[questions[current].id]);
  useEffect(() => {
    if (hasFeedback) feedbackRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [hasFeedback, current]);

  // Covers reload and tab/window close. In-app navigation (Link clicks) is
  // guarded separately in BottomNav/Header, since beforeunload doesn't fire
  // for client-side route changes.
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isTestInProgress()) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Browser Back guard (see lib/testGuard.ts).
  useEffect(() => {
    function handlePopState() {
      if (!isTestInProgress()) return;
      // The Back press already popped our guard entry; put it back right away so a
      // second Back can't skip the dialog, then ask.
      notifyGuardPopped();
      ensureHistoryGuardEntry();
      void confirmLeave().then((shouldLeave) => {
        if (!shouldLeave) return;
        setTestInProgress(false);
        forgetGuardEntry();
        // Two entries to unwind: the guard we just re-pushed and the original one.
        window.history.go(-2);
      });
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Exam countdown, driven by a wall-clock deadline so background-tab throttling
  // can't make it drift. Auto-submits at zero.
  const timerActive = mode === "exam" && (stage === "in-progress" || stage === "review");
  useEffect(() => {
    if (!timerActive) return;
    const id = window.setInterval(() => {
      const left = Math.max(0, Math.round((deadline.current - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        window.clearInterval(id);
        setTimedOut(true);
        finishRef.current();
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerActive]);

  function startTest(m: Mode = mode) {
    const qs = buildPracticeTest().map(withShuffledOptions);
    setMode(m);
    setQuestions(qs);
    setAnswers({});
    setFlagged(new Set());
    setCurrent(0);
    setTimedOut(false);
    setRemaining(EXAM_SECONDS);
    deadline.current = Date.now() + EXAM_SECONDS * 1000;
    setStage("in-progress");
    setTestInProgress(true);
    ensureHistoryGuardEntry();
  }

  function selectAnswer(questionId: string, option: string) {
    // Practice mode locks an answer once given so the feedback stays honest.
    if (mode === "practice" && answers[questionId]) return;
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  }

  function toggleFlag(questionId: string) {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  }

  function finishTest() {
    const result = scoreTest(questions, answers);
    addTestHistory({
      date: new Date().toISOString(),
      percentage: result.percentage,
      passed: result.passed,
      totalCorrect: result.totalCorrect,
      totalQuestions: result.totalQuestions,
      valuesCorrect: result.valuesCorrect,
      valuesTotal: result.valuesTotal,
    });
    setTestInProgress(false);
    consumeHistoryGuardEntryIfPresent();
    setStage("results");
  }
  useEffect(() => {
    finishRef.current = finishTest;
  });

  // Keyboard: 1-4 pick an option, ←/→ move between questions.
  useEffect(() => {
    if (stage !== "in-progress") return;
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "SELECT" || t.tagName === "TEXTAREA")) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const q = questions[current];
      if (!q) return;
      const n = Number(e.key);
      if (n >= 1 && n <= q.shuffledOptions.length) {
        selectAnswer(q.id, q.shuffledOptions[n - 1]);
      } else if (e.key === "ArrowRight") {
        setCurrent((c) => Math.min(c + 1, questions.length - 1));
      } else if (e.key === "ArrowLeft") {
        setCurrent((c) => Math.max(c - 1, 0));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const result = useMemo(() => (stage === "results" ? scoreTest(questions, answers) : null), [stage, questions, answers]);

  if (stage === "intro") {
    return (
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
        <div className="space-y-2">
          <h1 ref={headingRef} tabIndex={-1} className="text-3xl font-bold tracking-tight outline-none">Practice test</h1>
          <p className="text-muted">
            20 random questions, including exactly 5 on Australian values &mdash; the same structure as the real test.
            Drawn from a pool of {allQuestions.length}.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <button
            onClick={() => startTest("practice")}
            className="group rounded-2xl border border-card-border bg-card p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md active:scale-[0.98]"
          >
            <TargetIcon size={32} className="text-primary" />
            <h2 className="mt-3 text-xl font-semibold">Practice</h2>
            <p className="mt-1 text-sm text-muted">
              See the right answer straight away, with a short explanation. No timer. Best for learning.
            </p>
            <span className="mt-4 inline-block text-sm font-medium text-primary">Start practice →</span>
          </button>
          <button
            onClick={() => startTest("exam")}
            className="group rounded-2xl border border-card-border bg-card p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md active:scale-[0.98]"
          >
            <TimerIcon size={32} className="text-primary" />
            <h2 className="mt-3 text-xl font-semibold">Timed mock exam</h2>
            <p className="mt-1 text-sm text-muted">
              45 minutes, like the real test. Results only at the end. The timer starts as soon as you begin.
            </p>
            <span className="mt-4 inline-block text-sm font-medium text-primary">Start mock exam →</span>
          </button>
        </div>

        <section className="rounded-2xl border border-card-border bg-card p-6 text-sm">
          <h2 className="text-base font-semibold">To pass</h2>
          <ul className="mt-3 space-y-2">
            <li className="flex gap-2"><CheckIcon size={18} className="shrink-0 text-primary" />Answer all 5 Australian values questions correctly</li>
            <li className="flex gap-2"><CheckIcon size={18} className="shrink-0 text-primary" />Score at least 15/20 (75%) overall</li>
          </ul>
          <p className="mt-4 text-muted">
            Shortcuts: <kbd className="rounded border border-card-border px-1">1</kbd>&ndash;<kbd className="rounded border border-card-border px-1">4</kbd> choose an answer,{" "}
            <kbd className="rounded border border-card-border px-1">←</kbd> <kbd className="rounded border border-card-border px-1">→</kbd> change question.
          </p>
        </section>

        <TestHistoryList history={history} />
      </div>
    );
  }

  if (stage === "in-progress") {
    const q = questions[current];
    const answered = answers[q.id];
    const isFlagged = flagged.has(q.id);
    const answeredCount = questions.filter((x) => answers[x.id]).length;
    const showFeedback = mode === "practice" && Boolean(answered);
    const lowTime = mode === "exam" && remaining <= 300;

    return (
      <div className="mx-auto max-w-6xl px-4 py-4 md:py-6">
        <div className="md:grid md:grid-cols-[14rem_1fr] md:gap-8">
          {/* Question navigator */}
          <nav aria-label="Questions" className="mb-3 md:sticky md:top-24 short:top-2 md:mb-0 md:self-start">
            <ol className="-mx-4 flex gap-1 overflow-x-auto px-4 py-1.5 md:mx-0 md:grid md:grid-cols-5 md:gap-2 md:overflow-visible md:rounded-2xl md:border md:border-card-border md:bg-card md:p-3">
              {questions.map((x, i) => {
                const a = answers[x.id];
                const isCur = i === current;
                const correct = a === x.correctOptionText;
                const status = !a ? "Not answered" : mode === "practice" ? (correct ? "Correct" : "Incorrect") : "Answered";
                const tone = !a
                  ? "border-dashed border-muted text-muted"
                  : mode === "practice" && !correct
                    ? "border-red-700 bg-red-700 text-white"
                    : "border-primary bg-primary text-primary-foreground";
                return (
                  <li key={x.id} className="relative shrink-0">
                    <button
                      onClick={() => setCurrent(i)}
                      aria-current={isCur ? "step" : undefined}
                      aria-label={`Question ${i + 1}, ${status}${flagged.has(x.id) ? ", marked for review" : ""}`}
                      className={`flex h-11 w-11 items-center justify-center rounded-full border-2 text-sm font-semibold transition active:scale-90 md:h-10 md:w-10 ${tone} ${
                        isCur ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                      }`}
                    >
                      {i + 1}
                    </button>
                    {flagged.has(x.id) && <FlagIcon size={14} className="pointer-events-none absolute -right-1 -top-1 fill-amber-500 text-amber-600" />}
                  </li>
                );
              })}
            </ol>
            <p className="mt-1 px-1 text-xs leading-relaxed text-muted">
              Dashed = not answered · Filled = {mode === "practice" ? "green right, red wrong" : "answered"} · <FlagIcon size={12} className="inline fill-amber-500 text-amber-600" /> = review later
            </p>
          </nav>

          {/* Question */}
          <section className="space-y-5">
            <div className="flex items-center justify-between gap-2 text-sm">
              <h2 ref={headingRef} tabIndex={-1} className="font-medium text-muted outline-none">
                Question {current + 1} of {questions.length}
              </h2>
              <div className="flex items-center gap-2">
                <span className="hidden rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary min-[420px]:inline">{PARTS[q.part].short}</span>
                {mode === "exam" && (
                  <span
                    role="timer"
                    aria-label={`Time remaining ${formatTime(remaining)}`}
                    className={`rounded-full border px-3 py-1 font-mono text-sm font-semibold tabular-nums ${
                      lowTime ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300" : "border-card-border bg-card"
                    }`}
                  >
                    <span className="inline-flex items-center gap-1.5"><TimerIcon size={15} />{formatTime(remaining)} left</span>
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <div className="h-1.5 w-full rounded-full bg-card-border">
                <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
              </div>
              <div className="flex items-center justify-between gap-3 text-xs text-muted">
                <p>{answeredCount} of {questions.length} answered{mode === "practice" ? " · practice, no timer" : ""}</p>
                {current < questions.length - 1 && (
                  <button onClick={() => setStage("review")} className="-my-2 min-h-11 px-1 font-medium text-primary underline-offset-2 hover:underline">
                    Finish test
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-5 rounded-2xl border border-card-border bg-card p-5 shadow-sm sm:p-7">
              {q.image && (
                <div className="relative mx-auto h-36 w-60">
                  <Image src={q.image.src} alt={q.image.alt} fill className="object-contain" priority />
                </div>
              )}
              <p className="text-lg font-semibold leading-snug sm:text-xl">{q.question}</p>
              <fieldset className="space-y-2.5 border-0 p-0 m-0">
                <legend className="sr-only">{q.question}</legend>
                {q.shuffledOptions.map((opt, i) => {
                  const isSelected = answered === opt;
                  const isRight = opt === q.correctOptionText;
                  const optionId = `${q.id}-opt-${i}`;
                  let style = "border-card-border hover:border-primary hover:bg-primary/5";
                  if (showFeedback && isRight) style = "border-primary bg-primary/10 font-medium";
                  else if (showFeedback && isSelected) style = "border-red-700 bg-red-50 dark:bg-red-950/40";
                  else if (showFeedback) style = "border-card-border opacity-60";
                  else if (isSelected) style = "border-primary bg-primary/10 font-medium";
                  return (
                    <label
                      key={opt}
                      htmlFor={optionId}
                      className={`flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-[15px] transition has-focus-visible:outline-2 has-focus-visible:outline-primary has-focus-visible:outline-offset-2 active:scale-[0.99] ${style}`}
                    >
                      <span
                        aria-hidden
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold ${
                          showFeedback && isSelected && !isRight
                            ? "border-red-700 bg-red-700 text-white"
                            : isSelected || (showFeedback && isRight)
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted text-muted"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <input
                        id={optionId}
                        type="radio"
                        name={`question-${q.id}`}
                        value={opt}
                        checked={isSelected}
                        disabled={showFeedback}
                        onChange={() => selectAnswer(q.id, opt)}
                        className="sr-only"
                      />
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </fieldset>

              {showFeedback && (
                <div
                  ref={feedbackRef}
                  role="status"
                  className={`scroll-mb-40 rounded-xl border-l-4 p-4 text-sm ${
                    answered === q.correctOptionText
                      ? "border-primary bg-primary/10"
                      : "border-red-700 bg-red-50 dark:bg-red-950/40"
                  }`}
                >
                  <p className="font-semibold">
                    {answered === q.correctOptionText ? "Correct" : `Not quite — the answer is: ${q.correctOptionText}`}
                  </p>
                  <p className="mt-1 text-muted">{q.explanation}</p>
                  <p className="mt-2 text-xs text-muted">Your answer is locked in practice mode. Use Next to continue.</p>
                </div>
              )}
            </div>

            <div className="sticky bottom-[4.1rem] z-30 -mx-4 flex items-center gap-3 border-t border-card-border bg-background/95 px-4 py-2 backdrop-blur md:bottom-0 md:tall:static md:tall:mx-0 md:tall:border-0 md:tall:bg-transparent md:tall:p-0 md:tall:backdrop-blur-none">
              <label className="flex min-h-11 cursor-pointer items-center gap-2 pr-1 text-sm">
                <input type="checkbox" checked={isFlagged} onChange={() => toggleFlag(q.id)} className="h-5 w-5 accent-[var(--primary)]" />
                <span className="inline-flex items-center gap-1.5">Review<span className="hidden min-[400px]:inline"> later</span><FlagIcon size={16} className="text-amber-600" /></span>
              </label>
              <div className="ml-auto flex gap-2 md:gap-3">
                <button disabled={current === 0} onClick={() => setCurrent((c) => c - 1)} className={btnSecondary}>← Back</button>
                {current < questions.length - 1 ? (
                  <button onClick={() => setCurrent((c) => c + 1)} className={btnPrimary}>
                    {answered ? "Next →" : "Skip →"}
                  </button>
                ) : null}
                {current === questions.length - 1 && (
                  <button onClick={() => setStage("review")} className={btnPrimary}>Finish test</button>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (stage === "review") {
    const answeredCount = questions.filter((q) => answers[q.id]).length;
    const unansweredCount = questions.length - answeredCount;

    return (
      <div className="mx-auto max-w-2xl space-y-5 px-4 py-6">
        <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-bold outline-none">Review your answers</h2>
        <p className="text-sm text-muted">
          {answeredCount} of {questions.length} answered
          {unansweredCount > 0 && <span className="font-medium text-amber-700 dark:text-amber-300"> · {unansweredCount} unanswered</span>}
          {flagged.size > 0 && <span> · {flagged.size} marked for review</span>}
          {mode === "exam" && <span> · {formatTime(remaining)} left</span>}
        </p>

        <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
          {questions.map((q, i) => {
            const isAnswered = Boolean(answers[q.id]);
            const isFlagged = flagged.has(q.id);
            return (
              <button
                key={q.id}
                onClick={() => {
                  setCurrent(i);
                  setStage("in-progress");
                }}
                aria-label={`Question ${i + 1}${isAnswered ? ", answered" : ", not answered"}${isFlagged ? ", marked for review" : ""}`}
                className={`relative min-h-12 rounded-xl border-2 text-sm font-semibold transition hover:border-primary active:scale-95 ${
                  isAnswered ? "border-primary bg-primary/10" : "border-dashed border-muted bg-card text-muted"
                }`}
              >
                {i + 1}
                {isFlagged && <FlagIcon size={14} className="absolute -right-1 -top-1 fill-amber-500 text-amber-600" />}
              </button>
            );
          })}
        </div>

        {unansweredCount > 0 && (
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Unanswered questions count as wrong, so you can still go back and answer them.
          </p>
        )}

        <div className="flex gap-3">
          <button onClick={() => setStage("in-progress")} className={btnSecondary}>← Back to test</button>
          <button onClick={finishTest} className={btnPrimary + " flex-1"}>Finish and see results</button>
        </div>
      </div>
    );
  }

  // results
  const wrong = questions.filter((q) => answers[q.id] !== q.correctOptionText).length;
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <h1 ref={headingRef} tabIndex={-1} className="sr-only outline-none">
        Practice test result: {result?.percentage}%, {result?.passed ? "pass" : "not a pass"}
      </h1>
      <div className={`rounded-3xl border-2 p-8 text-center ${result?.passed ? "border-primary bg-primary/10" : "border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/40"}`}>
        {timedOut && <p className="mb-2 text-sm font-medium text-red-700 dark:text-red-300">Time ran out — your test was submitted automatically.</p>}
        <p className="text-sm font-medium uppercase tracking-wide text-muted">Result</p>
        <p className="mt-1 text-6xl font-bold tracking-tight">{result?.percentage}%</p>
        <p className="mt-3 text-xl font-semibold">{result?.passed ? "Pass — well done!" : "Not a pass yet"}</p>
        <p className="mt-1 text-sm text-muted">
          {result?.totalCorrect}/{result?.totalQuestions} correct overall · {result?.valuesCorrect}/{result?.valuesTotal} on Australian values
        </p>
        <p className="mt-1 text-xs text-muted">
          The 5 &ldquo;values&rdquo; questions are about Australian values (e.g. freedom, equality, respect). You need all 5 right to pass.
        </p>
        {!result?.passed && (
          <p className="mt-2 text-sm text-muted">
            {result && result.valuesCorrect < result.valuesTotal
              ? "Remember: all 5 values questions must be correct to pass, even if your overall score is 75%+."
              : "You need at least 75% overall to pass."}
            {" "}Check the questions you missed below, then try again. Flashcards can help.
          </p>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <button onClick={() => startTest(mode)} className={btnPrimary}>Try another {mode === "exam" ? "exam" : "practice"}</button>
        <button onClick={() => { setStage("intro"); }} className={btnSecondary}>Back to start</button>
      </div>
      <p role="note" className="rounded-xl bg-amber-50 px-4 py-3 text-center text-sm text-amber-950 dark:bg-amber-950/40 dark:text-amber-100">
        <strong>Practice result only.</strong> This is not the official citizenship test and does not predict your real result.
      </p>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Review your answers</h2>
          {wrong > 0 && (
            <button
              onClick={() => setWrongOnly((v) => !v)}
              aria-pressed={wrongOnly}
              className="min-h-11 rounded-full border border-card-border bg-card px-4 text-sm font-medium transition hover:border-primary"
            >
              {wrongOnly ? `Showing ${wrong} to revisit · show all` : "Show only ones to revisit"}
            </button>
          )}
        </div>
        {questions.map((q, i) => {
          const given = answers[q.id];
          const isCorrect = given === q.correctOptionText;
          if (wrongOnly && isCorrect) return null;
          const skipped = given === undefined;
          return (
            <div key={q.id} className="space-y-2 rounded-xl border border-card-border bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium">{i + 1}. {q.question}</p>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    isCorrect
                      ? "bg-primary/10 text-primary"
                      : skipped
                        ? "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
                        : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                  }`}
                >
                  {isCorrect ? "Correct" : skipped ? "Skipped" : "Incorrect"}
                </span>
              </div>
              {q.image && (
                <div className="relative h-20 w-36">
                  <Image src={q.image.src} alt={q.image.alt} fill className="object-contain" />
                </div>
              )}
              <p className="text-sm text-muted">Your answer: {given ?? "Not answered"}</p>
              {!isCorrect && <p className="text-sm font-medium text-primary">Correct answer: {q.correctOptionText}</p>}
              <p className="text-xs text-muted">{q.explanation}</p>
            </div>
          );
        })}
      </div>

      <TestHistoryList history={history} />
    </div>
  );
}

function TestHistoryList({ history }: { history: TestHistoryEntry[] }) {
  if (!history.length) return null;
  return (
    <div className="text-left">
      <h3 className="text-sm font-semibold text-muted">Your recent attempts on this device</h3>
      <ul className="mt-2 space-y-1 text-sm">
        {history.slice(0, 5).map((h, i) => (
          <li key={i} className="flex justify-between rounded-lg border border-card-border bg-card px-3 py-2">
            <span>{new Date(h.date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</span>
            <span>{h.percentage}% · {h.valuesCorrect}/{h.valuesTotal} values</span>
            <span className={h.passed ? "text-primary font-medium" : "text-amber-700 dark:text-amber-300 font-medium"}>
              {h.passed ? "Pass" : "Not yet"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
