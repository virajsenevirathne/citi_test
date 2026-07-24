import { part1Flashcards, part1Questions } from "./part1";
import { part2Flashcards, part2Questions } from "./part2";
import { part3Flashcards, part3Questions } from "./part3";
import { valuesFlashcards, valuesQuestions } from "./values";
import type { Flashcard, PartId, Question } from "./types";

export * from "./types";

export const allFlashcards: Flashcard[] = [
  ...part1Flashcards,
  ...part2Flashcards,
  ...part3Flashcards,
  ...valuesFlashcards,
];

export const allQuestions: Question[] = [
  ...part1Questions,
  ...part2Questions,
  ...part3Questions,
  ...valuesQuestions,
];

export const questionsByPart: Record<PartId, Question[]> = {
  part1: part1Questions,
  part2: part2Questions,
  part3: part3Questions,
  values: valuesQuestions,
};

export const flashcardsByPart: Record<PartId, Flashcard[]> = {
  part1: part1Flashcards,
  part2: part2Flashcards,
  part3: part3Flashcards,
  values: valuesFlashcards,
};
