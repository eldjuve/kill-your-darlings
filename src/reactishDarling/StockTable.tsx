import type { EventObservable } from "@event-observable/core";
import { useState, useEffect } from "react";
import type { Snapshot, StockDelta } from "src/worker/worker";
import { useStockList } from "./state/useStock";

export const StockTable = () => {
  const stockList = useStockList();

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Exchange</th>
            <th>Last</th>
            <th>Volume</th>
            <th>Time</th>
            <th>Bid</th>
            <th>Ask</th>
          </tr>
        </thead>
        <tbody>
          {stockList?.map((item, index) => (
            <StockRow key={index} item={item} />
          ))}
        </tbody>
      </table>
    </div>
  );
};
const StockRow = ({
  item,
}: {
  item: EventObservable<Snapshot, StockDelta>;
}) => {
  const data = item.getValue();

  if (!data) {
    return (
      <tr>
        <td colSpan={8}>Loading...</td>
      </tr>
    );
  }
  return (
    <tr>
      <StockField item={item} field="symbol" />
      <StockField item={item} field="exchange" />
      <StockField item={item} field="last" />
      <StockField item={item} field="volume" />
      <StockField item={item} field="lastUpdated" />
      <StockField item={item} field="bid" />
      <StockField item={item} field="ask" />
    </tr>
  );
};
const StockField = ({
  item,
  field,
}: {
  item: EventObservable<Snapshot, StockDelta>;
  field: keyof Snapshot;
}) => {
  const [val, setVal] = useState(item.getValue()?.[field] ?? "");
  const [change, setChange] = useState<"down" | "same" | "up">("same");

  useEffect(() => {
    const subscription = item.subscribeToEvents((event) => {
      if (field in event.update) {
        setVal((cur) => {
          const newValue = event.update[field] ?? "";
          if (typeof cur === "number" && typeof newValue === "number") {
            if (newValue > cur) {
              setChange("up");
            } else if (newValue < cur) {
              setChange("down");
            } else {
              setChange("same");
            }
          }
          return newValue;
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <td>
      {val}
      <div className={`arrow ${change}`} />
    </td>
  );
};
