import { useState, useEffect } from "react";
import type { Observable, ObservableArray, ReadonlyObservable } from "./core";

export const useObservable = <T, E>(
  observable: Observable<T, E> | ReadonlyObservable<T, E>,
) => {
  const [value, setValue] = useState(observable.getOptimisticValue());
  useEffect(() => {
    const subscription = observable.subscribe((val) => {
      setValue(val);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [observable]);
  return value;
};

export function useObservableArray<T>(observableArray: ObservableArray<T>) {
  const [value, setValue] = useState<T[]>([]);

  useEffect(() => {
    const unsubscribe = observableArray.subscribe((update) => {
      setValue([...update]);
    });
    return () => {
      unsubscribe();
    };
  }, [observableArray]);

  return value;
}
