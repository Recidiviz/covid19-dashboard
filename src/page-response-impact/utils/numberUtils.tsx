export function formatPercent(percent: number): number {
  return Math.round(percent * 100);
}

export function formatAbsValue(value: number): number {
  return Math.abs(value);
}

export function calculatePercentDiff(orig: number, curr: number): number {
  const num = (orig - curr) / orig;
  return Math.round(num * 100);
}
