import { useStock } from "./state/useStock";

const fakeParams = {
  symbol: "AAPL",
  exchange: "NYSE" as const,
};

export const Detail = () => {
  const stock = fakeParams;

  const data = useStock(stock);

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Detail</h2>
      <p>This is a placeholder for the detail view.</p>
      <p>Details about a specific stock or item would go here.</p>
      <table>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Exchange</th>
            <th>Last</th>
            <th>Bid</th>
            <th>Ask</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{data.symbol}</td>
            <td>{data.exchange}</td>
            <td>{data.last.toFixed(2)}</td>
            <td>{data.bid.toFixed(2)}</td>
            <td>{data.ask.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
