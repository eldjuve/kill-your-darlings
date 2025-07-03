import { AppContextProvider } from "./context/AppContextProvider";
import { useAppContext } from "./context/useAppContext";

export const Reactish = () => {
  return (
    <AppContextProvider>
      <div>
        <h1>Kill Your Darlings</h1>
        <p>This is a demo application that showcases the use of React state</p>
        <StockTable />
      </div>
    </AppContextProvider>
  );
};

const StockTable = () => {
  const { stocks } = useAppContext();

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
      <tbody>
        {stocks.map((stock) => (
          <tr key={`${stock.symbol}-${stock.exchange}`}>
            <td>{stock.symbol}</td>
            <td>{stock.exchange}</td>
            <td>{stock.last}</td>
            <td>{(stock.last / 100).toFixed(2)}%</td>
            <td>{stock.volume}</td>
            <td>{new Date(stock.lastUpdated).toLocaleTimeString()}</td>
            <td>{stock.bid}</td>
            <td>{stock.ask}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
