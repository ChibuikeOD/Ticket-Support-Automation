export const EVALUATION_PERCENTAGES = [25, 50, 75, 100] as const;

export type EvaluationPercentage = (typeof EVALUATION_PERCENTAGES)[number];

export function isEvaluationPercentage(value: number): value is EvaluationPercentage {
  return EVALUATION_PERCENTAGES.includes(value as EvaluationPercentage);
}

export function selectGoldCasesByPercentage<T>(cases: T[], percentage: number): T[] {
  if (!isEvaluationPercentage(percentage)) {
    throw new Error("Evaluation percentage must be one of 25, 50, 75, or 100.");
  }

  return cases.slice(0, Math.ceil(cases.length * (percentage / 100)));
}
