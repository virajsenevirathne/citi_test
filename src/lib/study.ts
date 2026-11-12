import { flashcardsByPart, PARTS, questionsByPart, type Flashcard, type PartId, type Question } from "@/content";

// Server-rendered study pages: one per part of Our Common Bond, listing every
// question with its answer, so the content is readable without JavaScript.
export const STUDY_INDEX_PATH = "/questions";

export const STUDY_PAGES: Record<
  PartId,
  {
    slug: string;
    /** Display name, sentence case. */
    name: string;
    /** Short title-case name for the <title>. */
    titleName: string;
    /** Name as it reads mid-sentence ("questions on ..."). */
    phrase: string;
    heading: string;
    intro: string;
  }
> = {
  part1: {
    slug: "australia-and-its-people",
    titleName: "Australia and Its People",
    phrase: "Australia and its people",
    name: "Australia and its people",
    heading: "Australia and its people: citizenship test questions and answers",
    intro:
      "Practice questions on Part 1 of Our Common Bond: Aboriginal and Torres Strait Islander peoples, European settlement, the states and territories, important days, and Australia’s flags and national symbols.",
  },
  part2: {
    slug: "democratic-beliefs-rights-and-liberties",
    titleName: "Rights and Liberties",
    phrase: "democratic beliefs, rights and liberties",
    name: "Democratic beliefs, rights and liberties",
    heading: "Democratic beliefs, rights and liberties: citizenship test questions and answers",
    intro:
      "Practice questions on Part 2 of Our Common Bond: parliamentary democracy, the rule of law, freedoms of speech, association and religion, equality, and the responsibilities and privileges of Australian citizenship.",
  },
  part3: {
    slug: "government-and-the-law",
    titleName: "Government and the Law",
    phrase: "government and the law",
    name: "Government and the law",
    heading: "Government and the law in Australia: citizenship test questions and answers",
    intro:
      "Practice questions on Part 3 of Our Common Bond: the Constitution, the three levels of government, Parliament, the separation of powers, the courts, and how laws are made and enforced.",
  },
  values: {
    slug: "australian-values",
    titleName: "Australian Values",
    phrase: "Australian values",
    name: "Australian values",
    heading: "Australian values: citizenship test questions and answers",
    intro:
      "Practice questions on Part 4 of Our Common Bond, Australian values. The real test includes 5 values questions and you must answer all 5 correctly to pass, so these are worth knowing well.",
  },
};

export const PART_IDS = Object.keys(PARTS) as PartId[];

export function studyPath(part: PartId) {
  return `${STUDY_INDEX_PATH}/${STUDY_PAGES[part].slug}`;
}

export function partFromSlug(slug: string): PartId | undefined {
  return PART_IDS.find((id) => STUDY_PAGES[id].slug === slug);
}

/** Groups items by topic, keeping topics in order of first appearance. */
export function groupByTopic<T extends { topic: string }>(items: T[]): { topic: string; items: T[] }[] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const list = groups.get(item.topic);
    if (list) list.push(item);
    else groups.set(item.topic, [item]);
  }
  return Array.from(groups, ([topic, list]) => ({ topic, items: list }));
}

export function partContent(part: PartId): { questions: Question[]; flashcards: Flashcard[] } {
  return { questions: questionsByPart[part], flashcards: flashcardsByPart[part] };
}

/** URL-safe anchor id for a topic heading. */
export function topicAnchor(topic: string) {
  return topic
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
