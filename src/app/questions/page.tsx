import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import { breadcrumbList, graph, webPage, type Crumb } from "@/lib/schema";
import {
  absoluteUrl,
  CONTENT_LAST_UPDATED,
  CONTENT_LAST_UPDATED_LABEL,
  FLASHCARD_COUNT,
  pageMetadata,
  QUESTION_COUNT,
  YEAR,
} from "@/lib/site";
import { PART_IDS, partContent, STUDY_INDEX_PATH, STUDY_PAGES, studyPath } from "@/lib/study";

const title = `Australian Citizenship Test Questions & Answers ${YEAR}`;
const description = `All ${QUESTION_COUNT} free Australian citizenship practice questions with answers and explanations, grouped by the four parts of Our Common Bond, plus key facts.`;

export const metadata: Metadata = pageMetadata(title, description, STUDY_INDEX_PATH);

const crumbs: Crumb[] = [
  { name: "Home", path: "/" },
  { name: "Questions", path: STUDY_INDEX_PATH },
];

export default function QuestionsIndexPage() {
  const structuredData = graph(
    webPage(STUDY_INDEX_PATH, "Australian citizenship test questions and answers", description, {
      "@type": "CollectionPage",
      breadcrumb: breadcrumbList(crumbs),
      mainEntity: {
        "@type": "ItemList",
        itemListElement: PART_IDS.map((id, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: `${STUDY_PAGES[id].name} (${partContent(id).questions.length} questions)`,
          url: absoluteUrl(studyPath(id)),
        })),
      },
    }),
  );

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-8 md:py-12">
      <header className="space-y-4">
        <Breadcrumbs crumbs={crumbs} />
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Australian citizenship test questions and answers</h1>
        <p className="text-base text-muted">
          All {QUESTION_COUNT} of our practice questions, with the correct answer and a short explanation for each, plus{" "}
          {FLASHCARD_COUNT} key facts. They are grouped by the four testable parts of the official booklet,{" "}
          <em>Australian Citizenship: Our Common Bond</em>. Read through a part, then test yourself with a practice test
          or a timed mock exam.
        </p>
        <p className="text-sm text-muted">
          Last updated <time dateTime={CONTENT_LAST_UPDATED}>{CONTENT_LAST_UPDATED_LABEL}</time>
        </p>
      </header>

      <section aria-labelledby="parts-heading" className="space-y-3">
        <h2 id="parts-heading" className="text-lg font-semibold">Choose a part to study</h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {PART_IDS.map((id, i) => {
            const { questions, flashcards } = partContent(id);
            return (
              <li key={id}>
                <Link
                  href={studyPath(id)}
                  className="group flex h-full flex-col rounded-2xl border border-card-border bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md active:scale-[0.98]"
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">Part {i + 1}</span>
                  <span className="mt-1 text-lg font-semibold">{STUDY_PAGES[id].name}</span>
                  <span className="mt-2 flex-1 text-sm text-muted">{STUDY_PAGES[id].intro}</span>
                  <span className="mt-4 text-sm font-medium text-primary">
                    {`${questions.length} questions \u00b7 ${flashcards.length} key facts \u2192`}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="space-y-3 rounded-2xl border border-card-border bg-card p-6">
        <h2 className="text-lg font-semibold">How the real test works</h2>
        <ul className="list-inside list-disc space-y-2 text-sm text-muted">
          <li>20 randomly selected multiple-choice questions, including 5 on Australian values.</li>
          <li>45 minutes to finish.</li>
          <li>
            To pass: at least 75% overall <strong className="text-foreground">and</strong> all 5 values questions correct.
          </li>
        </ul>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/practice-test"
            className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-110 active:scale-95"
          >
            Take a practice test
          </Link>
          <Link
            href="/flashcards"
            className="rounded-xl border border-card-border px-5 py-3 text-sm font-semibold transition hover:border-primary active:scale-95"
          >
            Study flashcards
          </Link>
        </div>
      </section>

      <JsonLd data={structuredData} />
    </div>
  );
}
