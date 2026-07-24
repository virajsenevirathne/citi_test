import Link from "next/link";
import { allFlashcards, allQuestions, PARTS } from "@/content";

export default function Home() {
  const partIds = Object.keys(PARTS) as (keyof typeof PARTS)[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-10">
      <section className="space-y-3 text-center">
        <p className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          Based on &ldquo;Australian Citizenship: Our Common Bond&rdquo;
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Prepare for the Australian Citizenship Test
        </h1>
        <p className="mx-auto max-w-xl text-muted">
          {allFlashcards.length} flashcards and {allQuestions.length} practice questions covering
          every part of the official testable content — including flags, symbols and other
          image-based questions.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/flashcards"
          className="group rounded-3xl border border-card-border bg-card p-6 shadow-sm transition active:scale-[0.98] active:shadow-none hover:shadow-md hover:border-primary"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-3xl">🗂️</div>
          <h2 className="mt-3 text-xl font-semibold">Flashcards</h2>
          <p className="mt-1 text-sm text-muted">
            Flip through key facts by topic, mark what you know, and focus on what you don&rsquo;t.
          </p>
          <span className="mt-4 inline-block text-sm font-medium text-primary">
            Start studying →
          </span>
        </Link>

        <Link
          href="/practice-test"
          className="group rounded-3xl border border-card-border bg-card p-6 shadow-sm transition active:scale-[0.98] active:shadow-none hover:shadow-md hover:border-primary"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-3xl">📝</div>
          <h2 className="mt-3 text-xl font-semibold">Practice Test</h2>
          <p className="mt-1 text-sm text-muted">
            20 randomly selected questions, including 5 on Australian values — just like the
            real test.
          </p>
          <span className="mt-4 inline-block text-sm font-medium text-primary">
            Start a test →
          </span>
        </Link>
      </section>

      <section className="rounded-2xl border border-card-border bg-card p-6">
        <h2 className="text-lg font-semibold">How the real test works</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted list-disc list-inside">
          <li>The test is computer-based, multiple choice, and in English.</li>
          <li>It consists of 20 randomly selected questions, including 5 questions on Australian values.</li>
          <li>To pass, you must score at least 75% overall <strong className="text-foreground">and</strong> answer all 5 values questions correctly.</li>
          <li>The test draws only on the official resource book, <em>Australian Citizenship: Our Common Bond</em>.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Testable content covered</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {partIds.map((id) => (
            <div key={id} className="rounded-xl border border-card-border bg-card p-4">
              <p className="font-medium">{PARTS[id].title}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
