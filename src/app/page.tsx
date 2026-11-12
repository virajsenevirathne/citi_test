import Link from "next/link";
import { CardsIcon, TargetIcon, TimerIcon } from "@/components/icons";
import SupportButton from "@/components/SupportButton";
import JsonLd from "@/components/JsonLd";
import { allFlashcards, allQuestions, PARTS, questionsByPart } from "@/content";
import { FAQ } from "@/content/faq";
import { AUDIENCE, graph, ORGANIZATION_ID, WEBAPP_ID, webPage } from "@/lib/schema";
import {
  absoluteUrl,
  CONTENT_LAST_UPDATED,
  CONTENT_LAST_UPDATED_LABEL,
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";
import { PART_IDS, STUDY_INDEX_PATH, STUDY_PAGES, studyPath } from "@/lib/study";

export default function Home() {
  const partIds = PART_IDS;
  // One text-only sample question per part, shown with its answer (crawlable content).
  const samples = partIds
    .map((id) => questionsByPart[id].find((q) => !q.image))
    .filter((q): q is NonNullable<typeof q> => Boolean(q));

  const structuredData = graph(
    webPage("/", DEFAULT_TITLE, DEFAULT_DESCRIPTION, {
      about: { "@id": WEBAPP_ID },
      mainEntity: { "@id": `${SITE_URL}/#faq` },
    }),
    {
      "@type": "WebApplication",
      "@id": WEBAPP_ID,
      name: SITE_NAME,
      url: absoluteUrl("/"),
      description: DEFAULT_DESCRIPTION,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript. Works offline after the first visit.",
      inLanguage: "en-AU",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "AUD" },
      audience: AUDIENCE,
      publisher: { "@id": ORGANIZATION_ID },
      dateModified: CONTENT_LAST_UPDATED,
      featureList: [
        `${allQuestions.length} practice questions with answers and explanations`,
        `${allFlashcards.length} flashcards`,
        "20-question practice test with 5 Australian values questions",
        "Timed 45-minute mock exam",
        "Works offline, no sign-up",
      ],
    },
    {
      "@type": "LearningResource",
      "@id": `${SITE_URL}/#learning-resource`,
      name: "Australian citizenship practice questions and flashcards",
      url: absoluteUrl(STUDY_INDEX_PATH),
      learningResourceType: ["Practice test", "Flashcards", "Questions and answers"],
      educationalLevel: "Beginner",
      inLanguage: "en-AU",
      isAccessibleForFree: true,
      audience: AUDIENCE,
      provider: { "@id": ORGANIZATION_ID },
      dateModified: CONTENT_LAST_UPDATED,
      about: "Australian citizenship test (Australian Citizenship: Our Common Bond)",
      hasPart: partIds.map((id) => ({ "@type": "LearningResource", name: STUDY_PAGES[id].name, url: absoluteUrl(studyPath(id)) })),
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      mainEntity: FAQ.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    },
  );

  const cards = [
    { href: "/flashcards", icon: CardsIcon, title: "Flashcards", text: "Flip through key facts by topic, mark what you know, and focus on what you don\u2019t.", cta: "Start studying →" },
    { href: "/practice-test", icon: TargetIcon, title: "Practice", text: "20 questions with instant answers and explanations. No timer, just learn.", cta: "Start practice →" },
    { href: "/practice-test", icon: TimerIcon, title: "Timed mock exam", text: "45 minutes, results at the end. Feels like the real thing.", cta: "Take a mock exam →" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-8 md:py-12">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-[#0b3d2c] px-6 py-12 text-center text-primary-foreground shadow-lg sm:px-12 sm:py-16 dark:from-[#12301f] dark:to-[#0b1a12] dark:text-foreground">
        <div aria-hidden className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
        <p className="relative inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
          Based on &ldquo;Australian Citizenship: Our Common Bond&rdquo;
        </p>
        <h1 className="relative mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
          Free Australian citizenship practice test
        </h1>
        <p className="relative mx-auto mt-4 max-w-xl text-base opacity-90">
          Practise with {allQuestions.length} citizenship test questions and {allFlashcards.length} flashcards
          covering every testable part, including the Australian values questions, flags and symbols. Free,
          no sign-up, and works offline.
        </p>
        <div className="relative mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/practice-test" className="rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow transition hover:brightness-105 active:scale-95">
            Take a practice test
          </Link>
          <Link href="/flashcards" className="rounded-xl border border-white/40 px-6 py-3 text-sm font-semibold transition hover:bg-white/10 active:scale-95">
            Study flashcards
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {cards.map(({ icon: CardIcon, ...c }) => (
          <Link
            key={c.title}
            href={c.href}
            className="group rounded-2xl border border-card-border bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md active:scale-[0.98]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><CardIcon size={26} /></div>
            <h2 className="mt-3 text-lg font-semibold">{c.title}</h2>
            <p className="mt-1 text-sm text-muted">{c.text}</p>
            <span className="mt-4 inline-block text-sm font-medium text-primary">{c.cta}</span>
          </Link>
        ))}
      </section>

      <section className="rounded-2xl border border-card-border bg-card p-6">
        <h2 className="text-lg font-semibold">How the real test works</h2>
        <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-muted">
          <li>Computer-based, multiple choice, in English, 45 minutes.</li>
          <li>20 randomly selected questions, including 5 on Australian values.</li>
          <li>To pass: at least 75% overall <strong className="text-foreground">and</strong> all 5 values questions correct.</li>
          <li>Questions come only from the official resource book, <em>Australian Citizenship: Our Common Bond</em>.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Testable content covered</h2>
        <p className="text-sm text-muted">Read every practice question with its answer and explanation, part by part.</p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {partIds.map((id) => (
            <li key={id}>
              <Link
                href={studyPath(id)}
                className="group flex h-full items-center justify-between gap-3 rounded-xl border border-card-border bg-card p-4 transition hover:border-primary"
              >
                <span>
                  <span className="block font-medium">{PARTS[id].title}</span>
                  <span className="mt-0.5 block text-sm text-muted">{questionsByPart[id].length} questions with answers</span>
                </span>
                <span aria-hidden className="text-primary transition group-hover:translate-x-0.5">&rarr;</span>
              </Link>
            </li>
          ))}
        </ul>
        <Link href={STUDY_INDEX_PATH} className="inline-block text-sm font-medium text-primary">
          All questions and answers →
        </Link>
      </section>

      <section className="space-y-3" aria-labelledby="samples-heading">
        <h2 id="samples-heading" className="text-lg font-semibold">Sample citizenship test questions</h2>
        <p className="text-sm text-muted">A taste of the practice questions. Tap a question to see the answer.</p>
        <div className="space-y-2">
          {samples.map((q) => (
            <details key={q.id} className="group rounded-xl border border-card-border bg-card p-4 open:border-primary">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-medium">
                <span>
                  <span className="mr-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">{PARTS[q.part].short}</span>
                  {q.question}
                </span>
                <span aria-hidden className="text-primary transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm"><strong>Answer:</strong> {q.options[q.answerIndex]}</p>
              <p className="mt-1 text-sm text-muted">{q.explanation}</p>
            </details>
          ))}
        </div>
        <Link href="/practice-test" className="inline-block text-sm font-medium text-primary">
          Try all {allQuestions.length} practice questions →
        </Link>
      </section>

      <section className="space-y-3" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="text-lg font-semibold">Citizenship test FAQ</h2>
        <div className="space-y-2">
          {FAQ.map(({ q, a }) => (
            <details key={q} className="group rounded-xl border border-card-border bg-card p-4 open:border-primary">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-medium">
                <h3 className="text-base font-medium">{q}</h3>
                <span aria-hidden className="text-primary transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-sm text-muted">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section aria-labelledby="about-heading" className="rounded-2xl border border-card-border bg-card p-6">
        <h2 id="about-heading" className="text-lg font-semibold">About this site</h2>
        <p className="mt-2 text-sm text-muted">
          {SITE_NAME} is a free, independent study site for the Australian citizenship test. The questions and flashcards
          were written from the official booklet, <em>Australian Citizenship: Our Common Bond</em>, and are not the real
          test questions. Content last updated{" "}
          <time dateTime={CONTENT_LAST_UPDATED}>{CONTENT_LAST_UPDATED_LABEL}</time>.
        </p>
        <Link href="/about" className="mt-3 inline-block text-sm font-medium text-primary">
          More about this site →
        </Link>
      </section>

      <SupportButton />
      <JsonLd data={structuredData} />
    </div>
  );
}
