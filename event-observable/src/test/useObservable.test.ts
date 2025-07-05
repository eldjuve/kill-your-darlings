import { renderHook, waitFor } from "@testing-library/react";
import { test, expect } from "vitest";
import { EventObservable } from "../core";
import { useObservable } from "../react";

test("useObservable returns value as react state", async () => {
  const obs = new EventObservable("initial value");
  const { result } = renderHook(() => useObservable(obs));
  expect(result.current).toEqual("initial value");
  obs.private("new value");
  await waitFor(() => {
    expect(result.current).toEqual("new value");
  });
});
