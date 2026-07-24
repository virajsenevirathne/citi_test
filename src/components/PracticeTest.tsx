"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { allQuestions, PARTS } from "@/content";
import { buildPracticeTest, scoreTest, withShuffledOptions, type ShuffledQuestion } from "@/lib/quiz";
import {
  addTestHistory,
  getTestHistoryServerSnapshot,
  getTestHistorySnapshot,
  subscribe,
  type TestHistoryEntry,
} from "@/lib/storage";
import {
  consumeHistoryGuardEntryIfPresent,
  ensureHistoryGuardEntry,
  isTestInProgress,
  setTestInProgress,
} from "@/lib/testGuard";

type Stage = "intro" | "in-progress" | "review" | "results";

const LEAVE_CONFIRM_MESSAGE =
  "You have a practice test in progress. Leave anyway? Your answers for this attempt will be lost.";

export default function PracticeTest() {
  const [stage, setStage] = useState<Stage>("intro");
  const [questions, setQuestions] = useState<ShuffledQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const history = useSyncExternalStore(subscribe, getTestHistorySnapshot, getTestHistoryServerSnapshot);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const isFirstRender = useRef(true);
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

  // Covers browser Back via a synthetic history entry: startTest() pushes an
  // extra entry at the current URL (reusing one already present, never
  // stacking — see ensureHistoryGuardEntry), so the first Back press just
  // pops it and fires popstate instead of navigating away immediately. That
  // gives us a chance to confirm; if the user cancels, we push it back so
  // they land exactly where they were.
  useEffect(() => {
    function handlePopState() {
      if (!isTestInProgress()) return;
      const shouldLeave = window.confirm(LEAVE_CONFIRM_MESSAGE);
      if (shouldLeave) {
        setTestInProgress(false);
        window.history.back();
      } else {
        ensureHistoryGuardEntry();
      }
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function startTest() {
    const qs = buildPracticeTest().map(withShuffledOptions);
    setQuestions(qs);
    setAnswers({});
    setFlagged(new Set());
    setCurrent(0);
    setStage("in-progress");
    setTestInProgress(true);
    ensureHistoryGuardEntry();
  }

  function selectAnswer(questionId: string, option: string) {
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

  const result = useMemo(() => (stage === "results" ? scoreTest(questions, answers) : null), [stage, questions, answers]);

  if (stage === "intro") {
    return (
      <div className="mx-auto max-w-xl px-4 py-8 space-y-5 text-center">
        <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold outline-none">Practice Test</h1>
        <p className="text-muted">
          20 randomly selected questions, including exactly 5 on Australian values — the same
          structure as the real citizenship test.
        </p>
        <div className="rounded-2xl border border-card-border bg-card p-6 text-left text-sm space-y-2">
          <p><strong>To pass:</strong> score at least 75% overall <strong>and</strong> answer all 5 values questions correctly.</p>
          <p className="text-muted">Questions are drawn from a pool of {allQuestions.length} covering all four testable parts, and some include images (flags, symbols).</p>
        </div>
        <button
          onClick={startTest}
          className="min-h-14 rounded-2xl bg-primary px-6 font-semibold text-primary-foreground transition active:scale-95"
        >
          Start practice test
        </button>

        <TestHistoryList history={history} />
      </div>
    );
  }

  if (stage === "in-progress") {
    const q = questions[current];
    const answered = answers[q.id];
    const isFlagged = flagged.has(q.id);

    return (
      <div className="mx-auto max-w-xl px-4 py-6 space-y-5">
        <div className="flex items-center justify-between gap-2 text-sm text-muted">
          <h2 ref={headingRef} tabIndex={-1} className="text-sm font-normal text-muted outline-none">
            Question {current + 1} of {questions.length}
          </h2>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary font-medium">{PARTS[q.part].short}</span>
            <button
              onClick={() => setStage("review")}
              className="rounded-full border border-card-border px-2 py-0.5 text-xs font-medium transition active:scale-95"
            >
              Review all
            </button>
          </div>
        </div>

        <div className="h-1.5 w-full rounded-full bg-card-border">
          <div
            className="h-1.5 rounded-full bg-primary transition-all"
            style={{ width: `${((current + 1) / questions.length) * 100}%` }}
          />
        </div>

        <div className="rounded-2xl border border-card-border bg-card p-6 space-y-4">
          {q.image && (
            <div className="relative mx-auto h-32 w-56">
              <Image src={q.image.src} alt={q.image.alt} fill className="object-contain" />
            </div>
          )}
          <div className="flex items-start justify-between gap-3">
            <p className="text-lg font-medium">{q.question}</p>
            <button
              onClick={() => toggleFlag(q.id)}
              aria-pressed={isFlagged}
              aria-label={isFlagged ? "Unflag this question" : "Flag this question for review"}
              className={`shrink-0 rounded-full border px-2 py-1 text-lg leading-none transition active:scale-90 ${
                isFlagged ? "border-accent bg-accent/20" : "border-card-border"
              }`}
            >
              🚩
            </button>
          </div>
          <fieldset className="space-y-2 border-0 p-0 m-0">
            <legend className="sr-only">{q.question}</legend>
            {q.shuffledOptions.map((opt, i) => {
              const isSelected = answered === opt;
              const optionId = `${q.id}-opt-${i}`;
              return (
                <label
                  key={opt}
                  htmlFor={optionId}
                  className={`block min-h-14 w-full cursor-pointer rounded-2xl border px-4 py-3 text-left text-sm transition has-focus-visible:outline-2 has-focus-visible:outline-primary has-focus-visible:outline-offset-2 active:scale-[0.98] ${
                    isSelected
                      ? "border-primary bg-primary/10 font-medium"
                      : "border-card-border active:border-primary"
                  }`}
                >
                  <input
                    id={optionId}
                    type="radio"
                    name={`question-${q.id}`}
                    value={opt}
                    checked={isSelected}
                    onChange={() => selectAnswer(q.id, opt)}
                    className="sr-only"
                  />
                  {opt}
                </label>
              );
            })}
          </fieldset>
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            disabled={current === 0}
            onClick={() => setCurrent((c) => c - 1)}
            className="min-h-12 rounded-2xl border border-card-border bg-card px-5 text-sm font-medium transition active:scale-95 disabled:opacity-40"
          >
            ← Back
          </button>
          {current < questions.length - 1 ? (
            <button
              onClick={() => setCurrent((c) => c + 1)}
              className="min-h-12 flex-1 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition active:scale-95"
            >
              {answered ? "Next →" : "Skip →"}
            </button>
          ) : (
            <button
              onClick={() => setStage("review")}
              className="min-h-12 flex-1 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition active:scale-95"
            >
              Review answers
            </button>
          )}
        </div>
      </div>
    );
  }

  if (stage === "review") {
    const answeredCount = questions.filter((q) => answers[q.id]).length;
    const unansweredCount = questions.length - answeredCount;

    return (
      <div className="mx-auto max-w-xl px-4 py-6 space-y-5">
        <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-bold outline-none">Review your answers</h2>
        <p className="text-sm text-muted">
          {answeredCount} of {questions.length} answered
          {unansweredCount > 0 && <span className="text-accent"> · {unansweredCount} unanswered</span>}
          {flagged.size > 0 && <span> · {flagged.size} flagged</span>}
        </p>
        <p className="text-sm text-muted">Tap a question to jump back to it.</p>

        <div className="grid grid-cols-5 gap-2">
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
                aria-label={`Question ${i + 1}${isAnswered ? ", answered" : ", not answered"}${isFlagged ? ", flagged for review" : ""}`}
                className={`relative min-h-12 rounded-xl border text-sm font-semibold transition active:scale-95 ${
                  isAnswered ? "border-primary bg-primary/10" : "border-card-border bg-card text-muted"
                }`}
              >
                {i + 1}
                {isFlagged && (
                  <span aria-hidden className="absolute -right-1 -top-1 text-xs">🚩</span>
                )}
              </button>
            );
          })}
        </div>

        {unansweredCount > 0 && (
          <p className="text-sm text-accent">
            You have {unansweredCount} unanswered question{unansweredCount === 1 ? "" : "s"} — unanswered
            questions are marked incorrect.
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => setStage("in-progress")}
            className="min-h-14 rounded-2xl border border-card-border bg-card px-5 text-sm font-medium transition active:scale-95"
          >
            ← Back to test
          </button>
          <button
            onClick={finishTest}
            className="min-h-14 flex-1 rounded-2xl bg-primary px-6 font-semibold text-primary-foreground transition active:scale-95"
          >
            Submit test
          </button>
        </div>
      </div>
    );
  }

  // results
  return (
    <div className="mx-auto max-w-xl px-4 py-8 space-y-6">
      <h1 ref={headingRef} tabIndex={-1} className="sr-only outline-none">
        Practice test result: {result?.percentage}%, {result?.passed ? "pass" : "not a pass"}
      </h1>
      <div className={`rounded-2xl border p-6 text-center ${result?.passed ? "border-primary bg-primary/10" : "border-red-300 bg-red-50 dark:bg-red-950/40"}`}>
        <p className="text-sm font-medium uppercase tracking-wide text-muted">Result</p>
        <p className="mt-1 text-4xl font-bold">{result?.percentage}%</p>
        <p className="mt-2 text-lg font-semibold">
          {result?.passed ? "Pass — well done! 🎉" : "Not a pass yet"}
        </p>
        <p className="mt-1 text-sm text-muted">
          {result?.totalCorrect}/{result?.totalQuestions} correct overall · {result?.valuesCorrect}/{result?.valuesTotal} values questions correct
        </p>
        {!result?.passed && (
          <p className="mt-2 text-sm text-muted">
            {result && result.valuesCorrect < result.valuesTotal
              ? "Remember: all 5 values questions must be correct to pass, even if your overall score is 75%+."
              : "You need at least 75% overall to pass."}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Review your answers</h2>
        {questions.map((q, i) => {
          const given = answers[q.id];
          const isCorrect = given === q.correctOptionText;
          return (
            <div key={q.id} className="rounded-xl border border-card-border bg-card p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium">{i + 1}. {q.question}</p>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${isCorrect ? "bg-primary/10 text-primary" : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"}`}>
                  {isCorrect ? "Correct" : "Incorrect"}
                </span>
              </div>
              {q.image && (
                <div className="relative h-20 w-36">
                  <Image src={q.image.src} alt={q.image.alt} fill className="object-contain" />
                </div>
              )}
              <p className="text-sm text-muted">Your answer: {given ?? "—"}</p>
              {!isCorrect && <p className="text-sm text-primary">Correct answer: {q.correctOptionText}</p>}
              <p className="text-xs text-muted">{q.explanation}</p>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center gap-3">
        <button
          onClick={startTest}
          className="min-h-14 rounded-2xl bg-primary px-6 font-semibold text-primary-foreground transition active:scale-95"
        >
          Try another test
        </button>
      </div>

      <TestHistoryList history={history} />
    </div>
  );
}

function TestHistoryList({ history }: { history: TestHistoryEntry[] }) {
  if (!history.length) return null;
  return (
    <div className="text-left">
      <h3 className="text-sm font-semibold text-muted">Recent attempts</h3>
      <ul className="mt-2 space-y-1 text-sm">
        {history.slice(0, 5).map((h, i) => (
          <li key={i} className="flex justify-between rounded-lg border border-card-border bg-card px-3 py-2">
            <span>{new Date(h.date).toLocaleDateString()}</span>
            <span>{h.percentage}% · {h.valuesCorrect}/{h.valuesTotal} values</span>
            <span className={h.passed ? "text-primary font-medium" : "text-red-600 dark:text-red-400 font-medium"}>
              {h.passed ? "Pass" : "Fail"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
