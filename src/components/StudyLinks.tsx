import GuardedLink from "@/components/GuardedLink";
import { QUESTION_COUNT } from "@/lib/site";
import { PART_IDS, partContent, STUDY_INDEX_PATH, STUDY_PAGES, studyPath } from "@/lib/study";

/**
 * Server-rendered study links shown under the interactive practice test and
 * flashcards, so those pages have crawlable text and internal links even though
 * the app itself renders on the client. Links ask before leaving a test.
 */
export default function StudyLinks({ intro }: { intro: string }) {
  return (
    <section aria-labelledby="study-links-heading" className="mx-auto max-w-3xl px-4 pb-10">
      <div className="rounded-2xl border border-card-border bg-card p-6">
        <h2 id="study-links-heading" className="text-lg font-semibold">Study every question and answer</h2>
        <p className="mt-2 text-sm text-muted">{intro}</p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {PART_IDS.map((id) => (
            <li key={id}>
              <GuardedLink
                href={studyPath(id)}
                className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-card-border px-4 py-2 text-sm font-medium transition hover:border-primary"
              >
                <span>{STUDY_PAGES[id].name}</span>
                <span className="shrink-0 text-xs font-normal text-muted">{partContent(id).questions.length} Qs</span>
              </GuardedLink>
            </li>
          ))}
        </ul>
        <GuardedLink href={STUDY_INDEX_PATH} className="mt-4 inline-block text-sm font-medium text-primary">
          All {QUESTION_COUNT} questions and answers →
        </GuardedLink>
      </div>
    </section>
  );
}
