import React, { useEffect } from "react";
import { AppContext } from "./AppContext";
import { applyMessage } from "../cache/stocks";

export const AppContextProvider = ({ children }: React.PropsWithChildren) => {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      applyMessage(event.data);
    };

    const worker = new SharedWorker(
      new URL("../../worker/worker.ts", import.meta.url),
      {
        type: "module",
      },
    );

    worker.port.addEventListener("message", handleMessage);
    worker.port.start();

    return () => {
      worker.port.removeEventListener("message", handleMessage);
      worker.port.postMessage({ type: "disconnect" });
    };
  }, []);

  return <AppContext.Provider value={{}}>{children}</AppContext.Provider>;
};
