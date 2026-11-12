import type { MetadataRoute } from "next";
import { absoluteUrl, CONTENT_LAST_UPDATED } from "@/lib/site";
import { PART_IDS, STUDY_INDEX_PATH, studyPath } from "@/lib/study";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  // A stable date (bumped when content changes), not the build time, so search
  // engines can trust <lastmod>.
  const lastModified = CONTENT_LAST_UPDATED;
  return [
    { url: absoluteUrl("/"), lastModified, changeFrequency: "monthly", priority: 1 },
    { url: absoluteUrl("/practice-test"), lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/flashcards"), lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl(STUDY_INDEX_PATH), lastModified, changeFrequency: "monthly", priority: 0.8 },
    ...PART_IDS.map((id) => ({
      url: absoluteUrl(studyPath(id)),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: absoluteUrl("/about"), lastModified, changeFrequency: "yearly", priority: 0.4 },
  ];
}
