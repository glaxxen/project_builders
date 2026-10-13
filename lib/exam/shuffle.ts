import type { ExamQuestion } from "@/lib/db/sqlite-store";

export interface ShuffledOption {
  originalIndex: number;
  text: string;
}

export interface StudentExamQuestion {
  id: string;
  text: string;
  topic?: string;
  options: ShuffledOption[];
}

/**
 * Deterministic string hash to generate a numeric seed.
 */
export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Mulberry32 PRNG: high quality, fast, deterministic.
 */
export function createSeededRng(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fisher-Yates array shuffle with a deterministic RNG.
 */
export function shuffleArray<T>(array: T[], rng: () => number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Deterministically shuffles question order and option order per student.
 * Guaranteed to stay identical across page refreshes for the same user.
 * CRITICAL SECURITY: Never returns correctOptionIndex to the client!
 */
export function prepareStudentQuestions(
  questions: ExamQuestion[],
  userIdentifier: string
): StudentExamQuestion[] {
  const seed = hashString(userIdentifier.toLowerCase().trim() || "student-seed");
  const rng = createSeededRng(seed);

  // 1. Deterministically shuffle questions
  const shuffledQuestions = shuffleArray(questions, rng);

  // 2. Deterministically shuffle options for each question
  return shuffledQuestions.map((q) => {
    // Map each option with its original index
    const optionsWithIndex: ShuffledOption[] = q.options.map((text, idx) => ({
      originalIndex: idx,
      text,
    }));

    // Shuffle options using the student's RNG
    const shuffledOptions = shuffleArray(optionsWithIndex, rng);

    return {
      id: q.id,
      text: q.text,
      topic: q.topic,
      options: shuffledOptions,
    };
  });
}
