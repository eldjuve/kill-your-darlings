import { Observable } from "@event-observable/core";
import type { Message, Snapshot, Stock, StockDelta } from "../../worker/worker";

const cache = new Map<string, Observable<Snapshot, StockDelta>>();
export const stockList = new Observable<Observable<Snapshot, StockDelta>[]>();

const cacheKey = ({ exchange, symbol }: Stock) => {
  return `${exchange}|${symbol}`;
};

export function getStockObservable(
  stock: Stock,
): Observable<Snapshot, StockDelta> {
  const key = cacheKey(stock);
  if (!cache.has(key)) {
    const observable = new Observable<Snapshot, StockDelta>();
    cache.set(key, observable);
  }
  return cache.get(key)!;
}

function applyStockUpdate(delta: StockDelta): void {
  const { symbol, exchange, update } = delta;
  const key = cacheKey({ exchange, symbol });
  if (cache.has(key)) {
    const observable = cache.get(key)!;
    const currentValue = observable.getValue();
    if (currentValue) {
      const updatedValue = {
        ...currentValue,
        ...update,
      };
      observable.next(updatedValue, delta);
    } else {
      // If there's no current value, we might want to handle this case
      // depending on the application logic. For now, we can just log it.
      console.warn(`No current value for stock ${key} to apply update.`);
    }
  }
}

export function applyMessage(message: Message): void {
  if (message.type === "snapshotList") {
    const obsArray = message.stocks.map((stock) => {
      const observable = getStockObservable(stock);
      observable.next(stock);
      return observable;
    });
    stockList.next(obsArray);
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
