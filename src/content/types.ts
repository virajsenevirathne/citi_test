export type PartId = "part1" | "part2" | "part3" | "values";

export const PARTS: Record<PartId, { title: string; short: string }> = {
  part1: { title: "Part 1 — Australia and its people", short: "Australia & its people" },
  part2: { title: "Part 2 — Australia's democratic beliefs, rights and liberties", short: "Rights & liberties" },
  part3: { title: "Part 3 — Government and the law in Australia", short: "Government & law" },
  values: { title: "Part 4 — Australian values", short: "Australian values" },
};

export interface ImageRef {
  src: string;
  alt: string;
}

export interface Flashcard {
  id: string;
  part: PartId;
  topic: string;
  front: string;
  back: string;
  image?: ImageRef;
}

export interface Question {
  id: string;
  part: PartId;
  topic: string;
  question: string;
  image?: ImageRef;
  options: string[];
  answerIndex: number;
  explanation: string;
}
