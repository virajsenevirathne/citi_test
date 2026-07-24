import { questionsByPart, type Question } from "@/content";

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Mirrors the real test format: 20 questions total, exactly 5 of which are
 * Australian values questions. The other 15 are drawn from parts 1-3.
 */
export function buildPracticeTest(): Question[] {
  const valuesPool = shuffle(questionsByPart.values).slice(0, 5);
  const generalPool = shuffle([
    ...questionsByPart.part1,
    ...questionsByPart.part2,
    ...questionsByPart.part3,
  ]).slice(0, 15);
  return shuffle([...valuesPool, ...generalPool]);
}

export interface ShuffledQuestion extends Question {
  shuffledOptions: string[];
  correctOptionText: string;
}

export function withShuffledOptions(q: Question): ShuffledQuestion {
  const correctOptionText = q.options[q.answerIndex];
  return {
    ...q,
    shuffledOptions: shuffle(q.options),
    correctOptionText,
  };
}

export interface TestResult {
  totalCorrect: number;
  totalQuestions: number;
  valuesCorrect: number;
  valuesTotal: number;
  percentage: number;
  passed: boolean;
}

export function scoreTest(
  questions: Question[],
  answers: Record<string, string>
): TestResult {
  let totalCorrect = 0;
  let valuesCorrect = 0;
  let valuesTotal = 0;

  for (const q of questions) {
    const isValues = q.part === "values";
    if (isValues) valuesTotal++;
    const given = answers[q.id];
    const isCorrect = given !== undefined && given === q.options[q.answerIndex];
    if (isCorrect) {
      totalCorrect++;
      if (isValues) valuesCorrect++;
    }
  }

  const percentage = Math.round((totalCorrect / questions.length) * 100);
  const passed = percentage >= 75 && valuesCorrect === valuesTotal;

  return {
    totalCorrect,
    totalQuestions: questions.length,
    valuesCorrect,
    valuesTotal,
    percentage,
    passed,
  };
}
