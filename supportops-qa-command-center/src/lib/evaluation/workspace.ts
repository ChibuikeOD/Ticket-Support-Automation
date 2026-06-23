export const EVALUATION_BATCH_SIZES = [5, 10, 15, 20] as const;

export const DEFAULT_GOLD_EVAL_CONCURRENCY = 10;

export type EvaluationBatchSize = (typeof EVALUATION_BATCH_SIZES)[number];

export function isEvaluationBatchSize(value: number): value is EvaluationBatchSize {
  return EVALUATION_BATCH_SIZES.includes(value as EvaluationBatchSize);
}

export function selectRandomGoldCases<T>(
  cases: T[],
  count: number,
  random: () => number = Math.random,
): T[] {
  if (!isEvaluationBatchSize(count)) {
    throw new Error("Evaluation batch size must be one of 5, 10, 15, or 20.");
  }

  if (count > cases.length) {
    throw new Error(`Gold dataset only has ${cases.length} cases; cannot sample ${count}.`);
  }

  const indices = cases.map((_, index) => index);

  for (let i = 0; i < count; i += 1) {
    const swapIndex = i + Math.floor(random() * (indices.length - i));
    [indices[i], indices[swapIndex]] = [indices[swapIndex], indices[i]];
  }

  return indices.slice(0, count).map((index) => cases[index]);
}
