import { useStockList } from "./state/useStock";
import type { Observable } from "@event-observable/core";
import type { Snapshot, StockDelta } from "src/worker/worker";
import { useObservable } from "@event-observable/react";
import { useEffect, useState } from "react";

export const ReactishDarling = () => {
  return (
    <div>
      <h1>Kill Your Darlings</h1>
      <p>This is a demo application that showcases the use of Observables</p>
      <StockTable />
    </div>
  );
};

const StockTable = () => {
  const stockList = useStockList();
  const [useV2, setUseV2] = useState(false);

  return (
    <div>
      <button onClick={() => setUseV2(!useV2)}>
        {useV2 ? "Use V1" : "Use V2"}
      </button>
      <table>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Exchange</th>
            <th>Last</th>
            <th>Change</th>
            <th>Volume</th>
            <th>Time</th>
            <th>Bid</th>
            <th>Ask</th>
          </tr>
        </thead>
        <tbody>
          {stockList?.map((item, index) =>
            useV2 ? (
              <StockRowV2 key={index} item={item} />
            ) : (
              <StockRow key={index} item={item} />
            ),
          )}
        </tbody>
      </table>
    </div>
  );
};

const StockRow = ({ item }: { item: Observable<Snapshot, StockDelta> }) => {
  const data = useObservable(item);

  if (!data) {
    return (
      <tr>
        <td colSpan={8}>Loading...</td>
      </tr>
    );
  }

  return (
    <tr>
      <td>{data.symbol}</td>
      <td>{data.exchange}</td>
      <td>{data.last}</td>
      <td>{(data.last / 100).toFixed(2)}%</td>
      <td>{data.volume}</td>
      <td>{new Date(data.lastUpdated).toLocaleTimeString()}</td>
      <td>{data.bid}</td>
      <td>{data.ask}</td>
    </tr>
  );
};

const StockRowV2 = ({ item }: { item: Observable<Snapshot, StockDelta> }) => {
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
      <StockCangeField item={item} field="symbol" />
      <StockCangeField item={item} field="exchange" />
      <StockCangeField item={item} field="last" />
      <StockCangeField item={item} field="volume" />
      <StockCangeField item={item} field="lastUpdated" />
      <StockCangeField item={item} field="bid" />
      <StockCangeField item={item} field="ask" />
    </tr>
  );
};

const StockField = ({
  item,
  field,
}: {
  item: Observable<Snapshot, StockDelta>;
  field: keyof Snapshot;
}) => {
  const [val, setVal] = useState(item.getValue()?.[field] ?? "");

  useEffect(() => {
    const subscription = item.subscribeToEvents((event) => {
      if (field in event.update) {
        setVal(event.update[field] ?? "");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return <td>{val}</td>;
};

const StockCangeField = ({
  item,
  field,
}: {
  item: Observable<Snapshot, StockDelta>;
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
