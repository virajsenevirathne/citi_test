import { SITE_NAME } from "@/lib/site";
import { allFlashcards, allQuestions, questionsByPart } from "./index";

const QUESTIONS = allQuestions.length;
const FLASHCARDS = allFlashcards.length;
const VALUES_QUESTIONS = questionsByPart.values.length;

// Shown on the home page AND emitted as FAQPage structured data, so the two must match.
// Answers are written to stand alone (each makes sense when quoted on its own).
// Only state facts about the real test that are already in this repo's content.
// `about` says whether the answer is about the real test or about this site.
export const FAQ: { q: string; a: string; about: "test" | "site" }[] = [
  {
    about: "site",
    q: "Where can I practise for the Australian citizenship test for free?",
    a: `${SITE_NAME} is a free website with ${QUESTIONS} practice questions, ${FLASHCARDS} flashcards and a timed 45-minute mock exam based on the official booklet, Australian Citizenship: Our Common Bond. There is no sign-up, and it is an unofficial study tool, not affiliated with the Department of Home Affairs.`,
  },
  {
    about: "site",
    q: "Are there free Australian citizenship practice tests online?",
    a: `Yes. ${SITE_NAME} offers free practice tests of 20 random questions, including 5 Australian values questions, drawn from a pool of ${QUESTIONS}. You can practise with instant answers and explanations, or sit a timed 45-minute mock exam.`,
  },
  {
    about: "test",
    q: "How do I prepare for the Australian citizenship test?",
    a: "Study the official booklet, Australian Citizenship: Our Common Bond, because all test questions come from it. Then check what you know with flashcards and practice questions, and finish with timed mock exams until you pass them comfortably, getting every values question right.",
  },
  {
    about: "test",
    q: "How many questions are in the Australian citizenship test?",
    a: "The test has 20 multiple-choice questions, chosen at random. Five of them are about Australian values.",
  },
  {
    about: "test",
    q: "What is the pass mark for the citizenship test?",
    a: "You need at least 75% overall (15 out of 20) and you must answer all 5 Australian values questions correctly. Scoring 75% or more but missing a values question is not a pass.",
  },
  {
    about: "test",
    q: "How long do I have to complete the test?",
    a: "You have 45 minutes. You can answer the questions in any order and come back to ones you skip. Our timed mock exam uses the same 45-minute limit.",
  },
  {
    about: "test",
    q: "What should I study for the citizenship test?",
    a: "All test questions come from the official resource booklet, Australian Citizenship: Our Common Bond. It covers Australia and its people; democratic beliefs, rights and liberties; government and the law; and Australian values.",
  },
  {
    about: "test",
    q: "What are the Australian values questions?",
    a: `They are the 5 test questions on Part 4 of Our Common Bond, covering values such as the rule of law, parliamentary democracy, freedom of speech, association and religion, equality, mutual respect and tolerance, and loyalty to Australia. You must answer all 5 correctly to pass. This site has ${VALUES_QUESTIONS} practice questions on Australian values.`,
  },
  {
    about: "site",
    q: "How many practice questions does this site have?",
    a: `${SITE_NAME} has ${QUESTIONS} practice questions and ${FLASHCARDS} flashcards covering all four parts of Our Common Bond, including ${VALUES_QUESTIONS} Australian values questions. Every question has the correct answer and a short explanation.`,
  },
  {
    about: "site",
    q: "Can I do a citizenship practice test on my phone or offline?",
    a: `Yes. ${SITE_NAME} works on phones, tablets and computers, can be added to your home screen, and keeps working offline after your first visit. It is free and needs no sign-up.`,
  },
  {
    about: "site",
    q: "Is this the official Australian citizenship test?",
    a: "No. This is a free, unofficial study tool for practice only. It is not affiliated with the Australian Government or the Department of Home Affairs, and the questions on the real test will be different.",
  },
];
