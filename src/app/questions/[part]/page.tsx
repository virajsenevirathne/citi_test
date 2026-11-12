import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import { CardsIcon, TargetIcon } from "@/components/icons";
import { PARTS } from "@/content";
import { AUDIENCE, breadcrumbList, graph, ORGANIZATION_ID, webPage, type Crumb } from "@/lib/schema";
import { absoluteUrl, CONTENT_LAST_UPDATED, CONTENT_LAST_UPDATED_LABEL, pageMetadata, YEAR } from "@/lib/site";
import {
  groupByTopic,
  PART_IDS,
  partContent,
  partFromSlug,
  STUDY_INDEX_PATH,
  STUDY_PAGES,
  studyPath,
  topicAnchor,
} from "@/lib/study";

// Only the four part slugs exist; anything else is a 404 (required for static export).
export const dynamicParams = false;

export function generateStaticParams() {
  return PART_IDS.map((id) => ({ part: STUDY_PAGES[id].slug }));
}

function resolve(slug: string) {
  const part = partFromSlug(slug);
  if (!part) notFound();
  return part;
}

export async function generateMetadata({ params }: PageProps<"/questions/[part]">): Promise<Metadata> {
  const part = resolve((await params).part);
  const page = STUDY_PAGES[part];
  const { questions } = partContent(part);
  const title = `${page.titleName} – Citizenship Test Questions ${YEAR}`;
  const description = `${questions.length} free Australian citizenship practice questions on ${page.phrase}, with answers and explanations, plus key facts from Our Common Bond.`;
  return pageMetadata(title, description, studyPath(part));
}

export default async function StudyPartPage({ params }: PageProps<"/questions/[part]">) {
  const part = resolve((await params).part);
  const page = STUDY_PAGES[part];
  const path = studyPath(part);
  const { questions, flashcards } = partContent(part);
  const topics = groupByTopic(questions);
  const factTopics = groupByTopic(flashcards);
  const partNumber = PART_IDS.indexOf(part) + 1;
  const otherParts = PART_IDS.filter((id) => id !== part);

  const crumbs: Crumb[] = [
    { name: "Home", path: "/" },
    { name: "Questions", path: STUDY_INDEX_PATH },
    { name: page.name, path },
  ];

  const quizId = `${absoluteUrl(path)}#quiz`;
  const structuredData = graph(
    webPage(path, page.heading, page.intro, {
      breadcrumb: breadcrumbList(crumbs),
      mainEntity: { "@id": quizId },
    }),
    {
      "@type": "Quiz",
      "@id": quizId,
      name: `${page.name}: Australian citizenship practice questions`,
      about: `${PARTS[part].title} (Australian Citizenship: Our Common Bond)`,
      educationalLevel: "Beginner",
      learningResourceType: "Practice questions",
      inLanguage: "en-AU",
      isAccessibleForFree: true,
      audience: AUDIENCE,
      dateModified: CONTENT_LAST_UPDATED,
      provider: { "@id": ORGANIZATION_ID },
      hasPart: questions.map((q) => ({
        "@type": "Question",
        eduQuestionType: "Multiple choice",
        text: q.question,
        acceptedAnswer: { "@type": "Answer", text: q.options[q.answerIndex] },
      })),
    },
  );

  // Continuous numbering across topic groups (Q1, Q2, ...).
  const numberOf = new Map(topics.flatMap((t) => t.items).map((q, i) => [q.id, i + 1]));

  return (
    <article className="mx-auto max-w-3xl space-y-10 px-4 py-8 md:py-12">
      <header className="space-y-4">
        <Breadcrumbs crumbs={crumbs} />
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Part {partNumber} of Our Common Bond
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{page.heading}</h1>
        <p className="text-base text-muted">{page.intro}</p>
        <p className="text-sm text-muted">
          {questions.length} questions with answers &middot; {flashcards.length} key facts &middot; Last updated{" "}
          <time dateTime={CONTENT_LAST_UPDATED}>{CONTENT_LAST_UPDATED_LABEL}</time>
        </p>
        <StudyCtas />
      </header>

      <nav aria-labelledby="topics-heading" className="rounded-2xl border border-card-border bg-card p-5">
        <h2 id="topics-heading" className="text-base font-semibold">Topics on this page</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {topics.map(({ topic, items }) => (
            <li key={topic}>
              <a
                href={`#${topicAnchor(topic)}`}
                className="inline-flex min-h-9 items-center rounded-full border border-card-border px-3 text-sm text-muted transition hover:border-primary hover:text-foreground"
              >
                {topic} <span className="ml-1.5 text-xs">({items.length})</span>
              </a>
            </li>
          ))}
          <li>
            <a
              href="#key-facts"
              className="inline-flex min-h-9 items-center rounded-full border border-card-border px-3 text-sm text-muted transition hover:border-primary hover:text-foreground"
            >
              Key facts <span className="ml-1.5 text-xs">({flashcards.length})</span>
            </a>
          </li>
        </ul>
      </nav>

      <section aria-labelledby="questions-heading" className="space-y-8">
        <h2 id="questions-heading" className="text-2xl font-bold tracking-tight">Practice questions and answers</h2>
        {topics.map(({ topic, items }) => (
          <section key={topic} aria-labelledby={topicAnchor(topic)} className="scroll-mt-24 space-y-3">
            <h3 id={topicAnchor(topic)} className="scroll-mt-24 text-lg font-semibold">{topic}</h3>
            <ol className="space-y-3">
              {items.map((q) => (
                <li key={q.id} className="rounded-2xl border border-card-border bg-card p-5">
                  <p className="font-semibold leading-snug">
                    <span className="mr-1.5 text-primary">Q{numberOf.get(q.id)}.</span>
                    {q.question}
                  </p>
                  {q.image && (
                    <div className="relative mt-3 h-24 w-40">
                      <Image src={q.image.src} alt={q.image.alt} fill sizes="160px" className="object-contain object-left" />
                    </div>
                  )}
                  <p className="mt-3 text-sm">
                    <strong className="text-primary">Answer:</strong> {q.options[q.answerIndex]}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    <span className="font-medium text-foreground">Why:</span> {q.explanation}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </section>

      <section id="key-facts" aria-labelledby="key-facts-heading" className="scroll-mt-24 space-y-6">
        <div className="space-y-1">
          <h2 id="key-facts-heading" className="text-2xl font-bold tracking-tight">Key facts: {page.phrase}</h2>
          <p className="text-sm text-muted">The same facts as our flashcards, as a list you can read through.</p>
        </div>
        {factTopics.map(({ topic, items }) => (
          <section key={topic} className="space-y-3">
            <h3 className="text-lg font-semibold">{topic}</h3>
            <ul className="divide-y divide-card-border rounded-2xl border border-card-border bg-card">
              {items.map((f) => (
                <li key={f.id} className="p-4 text-sm">
                  <p className="font-medium">{f.front}</p>
                  <p className="mt-1 text-muted">{f.back}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </section>

      <section className="space-y-4 rounded-2xl border border-card-border bg-card p-6">
        <h2 className="text-lg font-semibold">Test yourself</h2>
        <p className="text-sm text-muted">
          Reading answers is a good start. To check you really know them, take a practice test with questions from
          every part, or sit a timed 45-minute mock exam.
        </p>
        <StudyCtas />
      </section>

      <nav aria-labelledby="more-parts-heading" className="space-y-3">
        <h2 id="more-parts-heading" className="text-lg font-semibold">Study the other parts</h2>
        <ul className="grid gap-3 sm:grid-cols-3">
          {otherParts.map((id) => (
            <li key={id}>
              <Link
                href={studyPath(id)}
                className="block h-full rounded-xl border border-card-border bg-card p-4 text-sm font-medium transition hover:border-primary"
              >
                {STUDY_PAGES[id].name}
                <span className="mt-1 block text-xs font-normal text-muted">{partContent(id).questions.length} questions</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <JsonLd data={structuredData} />
    </article>
  );
}

function StudyCtas() {
  return (
    <div className="flex flex-wrap gap-3">
      <Link
        href="/practice-test"
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-110 active:scale-95"
      >
        <TargetIcon size={18} /> Take a practice test
      </Link>
      <Link
        href="/flashcards"
        className="inline-flex items-center gap-2 rounded-xl border border-card-border bg-card px-5 py-3 text-sm font-semibold transition hover:border-primary active:scale-95"
      >
        <CardsIcon size={18} /> Study flashcards
      </Link>
    </div>
  );
}
