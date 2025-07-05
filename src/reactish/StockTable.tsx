import { useState, useEffect } from "react";
import type { Snapshot } from "src/worker/worker";
import { useAppContext } from "./state/useAppContext";

export const StockTable = () => {
  const { stockList } = useAppContext();

  return (
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
        {stockList.map((stock) => (
          <StockRow key={stock.symbol} item={stock} />
        ))}
      </tbody>
    </table>
  );
};
const StockRow = ({ item }: { item: Snapshot }) => {
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
  item: Snapshot;
  field: keyof Snapshot;
}) => {
  const [val, setVal] = useState(item[field] ?? "");
  const [change, setChange] = useState<"down" | "same" | "up">("same");

  useEffect(() => {
    setVal((cur) => {
      const newValue = item[field] ?? "";
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
  }, [item, field]);

  return (
    <td>
      {val}
      <div className={`arrow ${change}`} />
    </td>
  );
};
