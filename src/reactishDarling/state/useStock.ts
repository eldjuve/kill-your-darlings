import { useObservable } from "@event-observable/react";
import { getStockObservable, stockList } from "../cache/stocks";
import type { Stock } from "src/worker/worker";

export const useStock = (stock: Stock) => {
  return useObservable(getStockObservable(stock));
};

export const useStockList = () => {
  return useObservable(stockList);
};
