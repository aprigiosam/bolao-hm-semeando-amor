/**
 * Calculates the score for a match prediction.
 * 
 * Rules:
 * - Exact score: 10 points
 * - Correct result (winner or draw): 5 points
 * - Otherwise: 0 points
 */
export function calculatePredictionScore(
  predHome: number,
  predAway: number,
  realHome: number,
  realAway: number
): number {
  // Exact score
  if (predHome === realHome && predAway === realAway) {
    return 10;
  }

  // Correct result (winner or draw)
  // We use Math.sign to compare the outcomes:
  // 1 for home win, -1 for away win, 0 for draw
  const predOutcome = Math.sign(predHome - predAway);
  const realOutcome = Math.sign(realHome - realAway);

  if (predOutcome === realOutcome) {
    return 5;
  }

  return 0;
}
