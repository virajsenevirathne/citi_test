import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import { breadcrumbList, graph, ORGANIZATION_ID, webPage, type Crumb } from "@/lib/schema";
import {
  CONTENT_LAST_UPDATED,
  CONTENT_LAST_UPDATED_LABEL,
  FLASHCARD_COUNT,
  OFFICIAL_RESOURCE_URL,
  pageMetadata,
  QUESTION_COUNT,
  SITE_NAME,
} from "@/lib/site";
import { STUDY_INDEX_PATH } from "@/lib/study";

const title = `About ${SITE_NAME}`;
const description = `About ${SITE_NAME}: a free, unofficial Australian citizenship test study site with ${QUESTION_COUNT} questions and ${FLASHCARD_COUNT} flashcards based on Our Common Bond.`;

export const metadata: Metadata = pageMetadata(title, description, "/about");

const crumbs: Crumb[] = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
];

export default function AboutPage() {
  const structuredData = graph(
    webPage("/about", title, description, {
      "@type": "AboutPage",
      breadcrumb: breadcrumbList(crumbs),
      about: { "@id": ORGANIZATION_ID },
    }),
  );

  return (
    <article className="mx-auto max-w-3xl space-y-8 px-4 py-8 md:py-12">
      <header className="space-y-4">
        <Breadcrumbs crumbs={crumbs} />
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">About {SITE_NAME}</h1>
        <p className="text-base text-muted">
          {SITE_NAME} is a free website for practising for the Australian citizenship test. It has {QUESTION_COUNT}{" "}
          practice questions, {FLASHCARD_COUNT} flashcards and a timed 45-minute mock exam. There is no sign-up, it works
          on phones, tablets and computers, and it keeps working offline after your first visit.
        </p>
        <p className="text-sm text-muted">
          Last updated <time dateTime={CONTENT_LAST_UPDATED}>{CONTENT_LAST_UPDATED_LABEL}</time>
        </p>
      </header>

      <section className="space-y-3 rounded-2xl border border-card-border bg-card p-6">
        <h2 className="text-lg font-semibold">What it&rsquo;s based on</h2>
        <p className="text-sm text-muted">
          All questions in the real citizenship test come from the official resource booklet,{" "}
          <em>Australian Citizenship: Our Common Bond</em>. Everything on this site follows the four testable parts of
          that booklet: Australia and its people; Australia&rsquo;s democratic beliefs, rights and liberties; government
          and the law in Australia; and Australian values.
        </p>
      </section>

      <section className="space-y-3 rounded-2xl border border-card-border bg-card p-6">
        <h2 className="text-lg font-semibold">How the questions were written</h2>
        <p className="text-sm text-muted">
          The practice questions and flashcards were written for this site from the content of <em>Our Common Bond</em>.
          Each question has one correct answer and a short explanation, so you learn why the answer is right. They are
          not the questions from the real test, which will be different. You can read every question and answer on the{" "}
          <Link href={STUDY_INDEX_PATH} className="font-medium text-primary underline-offset-4 hover:underline">
            questions and answers pages
          </Link>
          .
        </p>
        <p className="text-sm text-muted">
          The practice test and mock exam follow the structure of the real test: 20 questions, including 5 on Australian
          values, and a 45-minute time limit for the mock exam. To pass you need at least 75% and all 5 values questions
          correct.
        </p>
      </section>

      <section className="space-y-3 rounded-2xl border border-card-border bg-card p-6">
        <h2 className="text-lg font-semibold">Unofficial and independent</h2>
        <p className="text-sm text-muted">
          This is an independent study tool. It is not affiliated with, or endorsed by, the Australian Government or the
          Department of Home Affairs. For official information about the test and to read <em>Our Common Bond</em>, visit
          the Department of Home Affairs:{" "}
          <a
            href={OFFICIAL_RESOURCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Our Common Bond and the citizenship test
          </a>
          .
        </p>
        <p className="text-sm text-muted">
          There are no accounts. Your flashcard progress and test history are saved only in your own browser.
        </p>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/practice-test"
          className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-110 active:scale-95"
        >
          Take a practice test
        </Link>
        <Link
          href="/flashcards"
          className="rounded-xl border border-card-border bg-card px-5 py-3 text-sm font-semibold transition hover:border-primary active:scale-95"
        >
          Study flashcards
        </Link>
      </div>

      <JsonLd data={structuredData} />
    </article>
  );
}
