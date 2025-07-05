import React from "react";
import type { Snapshot } from "../../worker/worker";

export type AppContextType = {
  cache: Map<string, Snapshot>;
  stockList: Snapshot[];
};

export const AppContext = React.createContext<AppContextType | undefined>(
  undefined,
);
