import { Detail } from "./Detail";
import { AppContextProvider } from "./state/AppContextProvider";
import { StockTable } from "./StockTable";

export const ReactishDarling = () => {
  return (
    <AppContextProvider>
      <h1>Kill Your Darlings</h1>
      <p>This is a demo application that showcases the use of Observables</p>
      <Detail />
    </AppContextProvider>
  );
};
