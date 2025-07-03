import React from "react";
import type { Snapshot } from "../../worker/worker";

export type AppContextType = {
  stocks: Snapshot[];
};

export const AppContext = React.createContext<AppContextType | undefined>(
  undefined,
);
