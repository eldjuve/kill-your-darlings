import React, { useEffect, useState } from "react";
import { AppContext } from "./AppContext";
import type { Snapshot } from "../../worker/worker";

export const AppContextProvider = ({ children }: React.PropsWithChildren) => {
  const [stocks, setStocks] = useState<Snapshot[]>([]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "snapshotList") {
        setStocks(event.data.stocks);
      } else if (event.data.type === "stockDelta") {
        setStocks((prevStocks) => {
          return prevStocks.map((stock) => {
            if (
              stock.symbol === event.data.symbol &&
              stock.exchange === event.data.exchange
            ) {
              return { ...stock, ...event.data.update };
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

    worker.port.onmessage = handleMessage;

    return () => {
      worker.port.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <AppContext.Provider value={{ stocks }}>{children}</AppContext.Provider>
  );
};
