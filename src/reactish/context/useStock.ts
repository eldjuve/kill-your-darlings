import { useAppContext } from "./useAppContext";

export const useStock = (symbol: string, exchange: string) => {
  const { stocks } = useAppContext();
  const stock = stocks.find(
    (s) => s.symbol === symbol && s.exchange === exchange,
  );
  if (!stock) {
    throw new Error(`Stock ${symbol} on ${exchange} not found`);
  }
  return stock;
};
