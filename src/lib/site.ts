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
export const SITE_NAME = "Citizenship Practice";
export const YEAR = new Date().getFullYear();
export const SUPPORT_URL = "https://www.buymeacoffee.com/getaussieready";

const QUESTION_COUNT = allQuestions.length;
const FLASHCARD_COUNT = allFlashcards.length;

export const DEFAULT_TITLE = `Free Australian Citizenship Practice Test ${YEAR} | ${QUESTION_COUNT} Questions & Flashcards`;
export const DEFAULT_DESCRIPTION =
  `Free Australian citizenship practice test with ${QUESTION_COUNT} questions and ${FLASHCARD_COUNT} flashcards based on Our Common Bond. Practise with instant answers or take a timed 20-question mock exam, including the 5 Australian values questions.`;

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

/**
 * Full per-page metadata. Next replaces (not merges) nested objects like
 * openGraph/twitter, so each page must restate the shared fields and image.
 */
export function pageMetadata(title: string, description: string, path: string) {
  const image = { url: "/opengraph-image.png", width: 1200, height: 630, alt: "Free Australian Citizenship Practice Test" };
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: { type: "website" as const, locale: "en_AU", siteName: SITE_NAME, url: path, title, description, images: [image] },
    twitter: { card: "summary_large_image" as const, title, description, images: [image.url] },
  };
}
