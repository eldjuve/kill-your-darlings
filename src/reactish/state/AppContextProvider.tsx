import React, { useEffect, useState } from "react";
import { AppContext } from "./AppContext";
import type { Message, Snapshot } from "../../worker/worker";
import { cacheKey } from "../../utils";

export const AppContextProvider = ({ children }: React.PropsWithChildren) => {
  const [cache, setCache] = useState<Map<string, Snapshot>>(new Map());
  const [stockList, setStockList] = useState<Snapshot[]>([]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent<Message>) => {
      const message = event.data;
      if (message.type === "snapshotList") {
        setCache(
          new Map(message.stocks.map((stock) => [cacheKey(stock), stock])),
        );
        setStockList(message.stocks);
      } else if (message.type === "stockDelta") {
        const key = cacheKey(message);
        setCache((prevStocks) => {
          const snapshot = prevStocks.get(key);
          if (!snapshot) {
            return prevStocks;
          }
          const updated = {
            ...snapshot,
            ...message.update,
          };
          const newStocks = new Map(prevStocks);
          newStocks.set(key, updated);
          return newStocks;
        });
        setStockList((prev) => {
          return prev.map((stock) => {
            if (
              stock.symbol === message.symbol &&
              stock.exchange === message.exchange
            ) {
              return { ...stock, ...message.update };
            }
            return stock;
          });
        });
      }
    };

    const worker = new SharedWorker(
      new URL("../../worker/worker.ts", import.meta.url),
      {
        type: "module",
      },
    );

    worker.port.addEventListener("message", handleMessage);
    worker.port.start();

    return () => {
      worker.port.removeEventListener("message", handleMessage);
      worker.port.postMessage({ type: "disconnect" });
    };
  }, []);

  return (
    <AppContext.Provider value={{ cache, stockList }}>
      {children}
    </AppContext.Provider>
  );
};
