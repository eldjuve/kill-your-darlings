import { Observable, ObservableArray } from "@event-observable/core";
import type { Message, Snapshot, Stock, StockDelta } from "../../worker/worker";

const cache = new Map<string, Observable<Snapshot>>();
export const stockList = new ObservableArray<Snapshot>();

const cacheKey = ({ exchange, symbol }: Stock) => {
  return `${exchange}|${symbol}`;
};

export function getStockObservable(stock: Stock): Observable<Snapshot> {
  const key = cacheKey(stock);
  if (!cache.has(key)) {
    const observable = new Observable<Snapshot>();
    cache.set(key, observable);
  }
  return cache.get(key)!;
}

function applyStockUpdate({ symbol, exchange, update }: StockDelta): void {
  const key = cacheKey({ exchange, symbol });
  if (cache.has(key)) {
    const observable = cache.get(key)!;
    const currentValue = observable.getValue();
    if (currentValue) {
      const updatedValue = {
        ...currentValue,
        ...update,
      };
      observable.next(updatedValue);
      stockList.addOrUpdate(
        (s) => s.symbol === symbol && s.exchange === exchange,
        updatedValue,
      );
    } else {
      // If there's no current value, we might want to handle this case
      // depending on the application logic. For now, we can just log it.
      console.warn(`No current value for stock ${key} to apply update.`);
    }
  }
}

export function applyMessage(message: Message): void {
  if (message.type === "snapshotList") {
    for (const stock of message.stocks) {
      const observable = getStockObservable(stock);
      observable.next(stock);
      stockList.push(stock);
    }
  } else {
    applyStockUpdate(message);
  }
}

const worker = new SharedWorker(
  new URL("../../worker/worker.ts", import.meta.url),
  {
    type: "module",
  },
);

worker.port.onmessage = (event) => {
  applyMessage(event.data);
};
