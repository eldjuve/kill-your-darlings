import type { Stock } from "src/worker/worker";
import { useAppContext } from "./useAppContext";
import { cacheKey } from "../../utils";

export const useStock = (stock: Stock) => {
  const { cache: stocks } = useAppContext();
  const key = cacheKey(stock);
  return stocks.get(key);
};
