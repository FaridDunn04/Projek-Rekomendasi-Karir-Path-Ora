
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}


export function formatConfidenceScore(score: number): string {
  return formatPercentage(score, 0);
}


export function formatMatchScore(score: number): string {
  return formatPercentage(score, 0);
}
