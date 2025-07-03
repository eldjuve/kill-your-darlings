import { useLayoutEffect, useRef } from "react";
import { stockList } from "./cache/stocks";

export const Darling = () => {
  return (
    <div>
      <h1>Kill Your Darlings</h1>
      <p>This is a demo application that showcases the use of Observables</p>
      <StockTable />
    </div>
  );
};

const StockTable = () => {
  const ref = useRef<HTMLTableSectionElement>(null);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const unsubscribe = stockList.subscribe({
      onItemAdded: (item) => {
        const row = document.createElement("tr");
        row.innerHTML = `
        <td>${item.symbol}</td>
        <td>${item.exchange}</td>
        <td>${item.last}</td>
        <td>${item.last / 100}%</td>
        <td>${item.volume}</td>
        <td>${new Date(item.lastUpdated).toLocaleTimeString()}</td>
        <td>${item.bid}</td>
        <td>${item.ask}</td>
      `;
        ref.current?.appendChild(row);
      },
      onItemUpdated(item, index) {
        const row = ref.current?.children[index];
        if (row) {
          row.innerHTML = `
            <td>${item.symbol}</td>
            <td>${item.exchange}</td>
            <td>${item.last}</td>
            <td>${item.last / 100}%</td>
            <td>${item.volume}</td>
            <td>${new Date(item.lastUpdated).toLocaleTimeString()}</td>
            <td>${item.bid}</td>
            <td>${item.ask}</td>
            `;
        }
      },
      onItemRemoved(item, index) {
        const row = ref.current?.children[index];
        if (row) {
          ref.current?.removeChild(row);
        }
      },
      onClear() {
        if (!ref.current) return;
        ref.current.innerHTML = "";
      },
      onSubscribe: (list) => {
        list.forEach((item) => {
          const row = document.createElement("tr");
          row.innerHTML = `
          <td>${item.symbol}</td>
          <td>${item.exchange}</td>
          <td>${item.last}</td>
          <td>${item.last / 100}%</td>
          <td>${item.volume}</td>
          <td>${new Date(item.lastUpdated).toLocaleTimeString()}</td>
          <td>${item.bid}</td>
          <td>${item.ask}</td>
        `;
          ref.current?.appendChild(row);
        });
      },
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return (
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
      <tbody ref={ref}></tbody>
    </table>
  );
};
