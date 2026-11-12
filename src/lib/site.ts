import { allFlashcards, allQuestions } from "@/content";

// Single source of truth for SEO: the canonical origin, names and copy.
//
// SITE_URL resolves, in order: an explicit NEXT_PUBLIC_SITE_URL, then Vercel's
// production domain (set automatically at build time on Vercel, including a
// custom domain if you add one), then localhost for local builds.
function resolveSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();
// One consistent entity name everywhere (header, OG, manifest, JSON-LD, llms.txt).
export const SITE_NAME = "Australian Citizenship Practice";
// Home-screen icon label only; long names get truncated under the icon.
export const SITE_SHORT_NAME = "Citizenship Prep";
export const YEAR = new Date().getFullYear();
export const SUPPORT_URL = "https://www.buymeacoffee.com/getaussieready";
// Official Department of Home Affairs page for the test and Our Common Bond.
export const OFFICIAL_RESOURCE_URL = "https://immi.homeaffairs.gov.au/citizenship/test-and-interview/our-common-bond";

/**
 * When the study content (questions, flashcards, FAQ) last changed, as an ISO
 * date. Update this by hand when content changes: it feeds the sitemap
 * <lastmod>, JSON-LD dateModified and the "Last updated" lines on pages. A
 * stable value (rather than the build time) keeps lastmod meaningful.
 */
export const CONTENT_LAST_UPDATED = "2026-11-13";

/** "13 November 2026" — for visible "Last updated" text. */
export const CONTENT_LAST_UPDATED_LABEL = new Date(`${CONTENT_LAST_UPDATED}T00:00:00Z`).toLocaleDateString("en-AU", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export const QUESTION_COUNT = allQuestions.length;
export const FLASHCARD_COUNT = allFlashcards.length;

/** Absolute URL for a site path ("/" -> "https://host/"). */
export function absoluteUrl(path: string) {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export const DEFAULT_TITLE = `Free Australian Citizenship Practice Test ${YEAR} | ${QUESTION_COUNT} Questions`;
export const DEFAULT_DESCRIPTION = `Free Australian citizenship practice test: ${QUESTION_COUNT} questions, ${FLASHCARD_COUNT} flashcards and a timed mock exam with the 5 values questions, based on Our Common Bond.`;

export const KEYWORDS = [
  "Australian citizenship practice test",
  "citizenship practice test",
  "Australian citizenship test",
  "citizenship test practice",
  `Australian citizenship test ${YEAR}`,
  "free citizenship test",
  "citizenship test questions and answers",
  "Our Common Bond practice questions",
  "Australian values questions",
  "citizenship mock exam",
  "citizenship test flashcards",
];

export const OG_IMAGE_ALT = "Free Australian Citizenship Practice Test";

/**
 * Full per-page metadata. Next replaces (not merges) nested objects like
 * openGraph/twitter, so each page must restate the shared fields and image.
 */
export function pageMetadata(title: string, description: string, path: string) {
  const image = { url: "/opengraph-image.png", width: 1200, height: 630, alt: OG_IMAGE_ALT };
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: { type: "website" as const, locale: "en_AU", siteName: SITE_NAME, url: path, title, description, images: [image] },
    twitter: { card: "summary_large_image" as const, title, description, images: [image.url] },
  };
}
