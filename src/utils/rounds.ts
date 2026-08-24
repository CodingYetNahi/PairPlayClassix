export const ROUND_RESULT_DELAY_MS = 10_000;

/** Deterministic Fisher-Yates order. The seed is persisted for online sessions. */
export function seededOrder(length: number, seed: number, namespace = ''): number[] {
  let value = (seed ^ [...namespace].reduce((sum, char) => Math.imul(sum ^ char.charCodeAt(0), 16777619), 2166136261)) >>> 0;
  const random = () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
  const order = Array.from({ length }, (_, index) => index);
  for (let index = order.length - 1; index > 0; index--) {
    const target = Math.floor(random() * (index + 1));
    [order[index], order[target]] = [order[target], order[index]];
  }
  return order;
}

export function roundContentIndex(length: number, round: number, seed: number, namespace: string): number {
  if (length < 1) return 0;
  return seededOrder(length, seed, namespace)[(round - 1) % length];
}
