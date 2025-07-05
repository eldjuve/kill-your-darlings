import { EventObservable } from "@event-observable/core";
import type {
  Message,
  Snapshot,
  Stock,
  StockDelta,
  StockSnapshotList,
} from "../../worker/worker";
import { cacheKey } from "../../utils";

type StockObservable = EventObservable<Snapshot, StockDelta>;

const cache = new Map<string, StockObservable>();
export const stockList = new EventObservable<
  StockObservable[],
  StockSnapshotList
>(applyStockListUpdate);

export function getStockObservable(
  stock: Stock | Snapshot,
): EventObservable<Snapshot, StockDelta> {
  const key = cacheKey(stock);
  if (!cache.has(key)) {
    const observable = new EventObservable<Snapshot, StockDelta>(
      applyStockUpdate,
    );
    cache.set(key, observable);
  }
  return cache.get(key)!;
}

function applyStockListUpdate(
  snapshotList: StockObservable[] | undefined,
  delta: StockSnapshotList,
) {
  return delta.stocks.map((stock) => {
    const observable = getStockObservable(stock);
    observable.next(stock);
    return observable;
  });
}

function applyStockUpdate(snapshot: Snapshot | undefined, delta: StockDelta) {
  if (!snapshot) {
    return undefined;
  }
  const { update } = delta;
  return {
    ...snapshot,
    ...update,
  };
}

export function applyMessage(message: Message): void {
  if (message.type === "snapshotList") {
    stockList.applyEvent(message);
  } else {
    const key = cacheKey(message);
    const observable = cache.get(key);
    observable?.applyEvent(message);
  }
}
