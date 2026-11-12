import { PARTS } from "@/content";
import { FAQ } from "@/content/faq";
import {
  absoluteUrl,
  CONTENT_LAST_UPDATED,
  DEFAULT_DESCRIPTION,
  FLASHCARD_COUNT,
  OFFICIAL_RESOURCE_URL,
  QUESTION_COUNT,
  SITE_NAME,
} from "@/lib/site";
import { groupByTopic, PART_IDS, partContent, STUDY_INDEX_PATH, STUDY_PAGES, studyPath } from "@/lib/study";

// Plain-text summaries for AI assistants (https://llmstxt.org), generated from
// the same content modules as the pages so they never drift.

const ABOUT_LINES = [
  `- Free, no sign-up, no account. Works on phones, tablets and computers, and offline after the first visit.`,
  `- ${QUESTION_COUNT} practice questions (each with the correct answer and an explanation) and ${FLASHCARD_COUNT} flashcards.`,
  `- Practice mode: 20 random questions, including 5 Australian values questions, with instant answers.`,
  `- Timed mock exam: 20 questions including 5 values questions, 45 minutes, scored with the real pass rule.`,
  `- Based on the official booklet "Australian Citizenship: Our Common Bond".`,
  `- Unofficial: not affiliated with the Australian Government or the Department of Home Affairs. The real test questions are different.`,
];

export function llmsTxt() {
  const parts = PART_IDS.map(
    (id) =>
      `- [${STUDY_PAGES[id].name} questions and answers](${absoluteUrl(studyPath(id))}): all ${partContent(id).questions.length} questions on ${STUDY_PAGES[id].phrase} with answers, plus key facts`,
  );

  return [
    `# ${SITE_NAME}`,
    "",
    `> ${DEFAULT_DESCRIPTION}`,
    "",
    `${SITE_NAME} is a free, unofficial website for people preparing for the Australian citizenship test. Last updated ${CONTENT_LAST_UPDATED}.`,
    "",
    ...ABOUT_LINES,
    "",
    "## About the real Australian citizenship test",
    "",
    ...FAQ.filter((f) => f.about === "test").map(({ q, a }) => `- ${q} ${a}`),
    "",
    "## Practice",
    "",
    `- [Practice test and timed mock exam](${absoluteUrl("/practice-test")}): 20 random questions with instant answers, or a 45-minute timed mock exam`,
    `- [Flashcards](${absoluteUrl("/flashcards")}): ${FLASHCARD_COUNT} flashcards of key facts, filterable by part, with progress saved in the browser`,
    "",
    "## Questions and answers",
    "",
    `- [All citizenship test questions and answers](${absoluteUrl(STUDY_INDEX_PATH)}): index of the four parts of Our Common Bond`,
    ...parts,
    "",
    "## About",
    "",
    `- [Home](${absoluteUrl("/")}): overview, sample questions and FAQ`,
    `- [About this site](${absoluteUrl("/about")}): what the site is based on, how questions were written, and the unofficial disclaimer`,
    `- [Official resource: Our Common Bond (Department of Home Affairs)](${OFFICIAL_RESOURCE_URL})`,
    "",
    "## Optional",
    "",
    `- [Full content](${absoluteUrl("/llms-full.txt")}): every practice question with its answer and explanation, and every flashcard, as Markdown`,
    "",
  ].join("\n");
}

export function llmsFullTxt() {
  const lines: string[] = [
    `# ${SITE_NAME}: all practice questions and flashcards`,
    "",
    `> Every practice question (${QUESTION_COUNT}) and flashcard (${FLASHCARD_COUNT}) from ${absoluteUrl("/")}, grouped by the four parts of "Australian Citizenship: Our Common Bond". Last updated ${CONTENT_LAST_UPDATED}.`,
    "",
    ...ABOUT_LINES,
    "",
    "## Frequently asked questions",
    "",
    ...FAQ.flatMap(({ q, a }) => [`### ${q}`, "", a, ""]),
  ];

  for (const id of PART_IDS) {
    const { questions, flashcards } = partContent(id);
    lines.push(`## ${PARTS[id].title.replace(" — ", ": ")}`, "", `Web page: ${absoluteUrl(studyPath(id))}`, "");
    lines.push(`### Practice questions (${questions.length})`, "");
    for (const { topic, items } of groupByTopic(questions)) {
      lines.push(`#### ${topic}`, "");
      for (const q of items) {
        lines.push(`- Q: ${q.question}`);
        if (q.image) lines.push(`  - Image: ${q.image.alt}`);
        lines.push(`  - Answer: ${q.options[q.answerIndex]}`, `  - Why: ${q.explanation}`);
      }
      lines.push("");
    }
    lines.push(`### Key facts (${flashcards.length} flashcards)`, "");
    for (const { topic, items } of groupByTopic(flashcards)) {
      lines.push(`#### ${topic}`, "");
      for (const f of items) lines.push(`- ${f.front} ${f.back}`);
      lines.push("");
    }
  }

  return lines.join("\n");
}
