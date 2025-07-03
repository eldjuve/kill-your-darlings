import { renderHook, waitFor } from "@testing-library/react";
import { test, expect } from "vitest";
import { Observable } from "../core";
import { useObservable } from "../react";

test("useObservable returns value as react state", async () => {
  const obs = new Observable("initial value");
  const { result } = renderHook(() => useObservable(obs));
  expect(result.current).toEqual("initial value");
  obs.next("new value");
  await waitFor(() => {
    expect(result.current).toEqual("new value");
  });
});
