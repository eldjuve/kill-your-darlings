import type { Stock } from "./worker/worker";

export const cacheKey = ({ exchange, symbol }: Stock) => {
  return `${exchange}|${symbol}`;
};
