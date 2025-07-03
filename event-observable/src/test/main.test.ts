import { expect, test, vitest } from "vitest";
import { Observable } from "../core";

test("Observable notifies new values", () => {
  const obs = new Observable();
  const subscription = vitest.fn();
  obs.subscribe(subscription);
  expect(subscription).not.toHaveBeenCalled();
  obs.next("first value");
  expect(subscription).toHaveBeenLastCalledWith("first value");
  obs.next("second value");
  expect(subscription).toHaveBeenLastCalledWith("second value");
  obs.next("last value");
  expect(subscription).toHaveBeenLastCalledWith("last value");
  expect(obs.getValue()).toEqual("last value");
});

test("Observable notifies current value on new subscribes", () => {
  const obs = new Observable("initial value");
  const subscription = vitest.fn();
  obs.subscribe(subscription);
  expect(subscription).toHaveBeenCalledWith("initial value");
});

test("Observable notifies current value on new subscribes after next", () => {
  const obs = new Observable();
  obs.next("first value");
  const subscription = vitest.fn();
  obs.subscribe(subscription);
  expect(subscription).toHaveBeenCalledWith("first value");
});

test("Observable notifies current value on new subscribes after optimistic next", () => {
  const obs = new Observable();
  obs.optimisticNext("optimistic value");
  const subscription = vitest.fn();
  obs.subscribe(subscription);
  expect(subscription).toHaveBeenCalledWith("optimistic value");
});

test("Observable notifies optimistic value on new subscribes", () => {
  const obs = new Observable();
  obs.optimisticNext("optimistic value");
  const subscription = vitest.fn();
  obs.subscribe(subscription);
  expect(subscription).toHaveBeenCalledWith("optimistic value");
});

test("Observable does not notify same value", () => {
  const obs = new Observable("initial value");
  const subscription = vitest.fn();
  obs.subscribe(subscription);
  obs.next("initial value");
  expect(subscription).toHaveBeenCalledTimes(1);
});

test("Observable notifies new values to multiple subscribers", () => {
  const obs = new Observable();
  const subscription1 = vitest.fn();
  const subscription2 = vitest.fn();
  obs.subscribe(subscription1);
  obs.subscribe(subscription2);
  obs.next("first value");
  expect(subscription1).toHaveBeenLastCalledWith("first value");
  expect(subscription2).toHaveBeenLastCalledWith("first value");
  obs.next("second value");
  expect(subscription1).toHaveBeenLastCalledWith("second value");
  expect(subscription2).toHaveBeenLastCalledWith("second value");
});
