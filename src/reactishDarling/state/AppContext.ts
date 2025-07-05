import React from "react";

export type AppContextType = {};

export const AppContext = React.createContext<AppContextType | undefined>(
  undefined,
);
