import { expect, test, vitest } from "vitest";
import { EventObservable } from "../core";

test("Observable notifies new values", () => {
  const obs = new EventObservable();
  const subscription = vitest.fn();
  obs.subscribe(subscription);
  expect(subscription).not.toHaveBeenCalled();
  obs.private("first value");
  expect(subscription).toHaveBeenLastCalledWith("first value");
  obs.private("second value");
  expect(subscription).toHaveBeenLastCalledWith("second value");
  obs.private("last value");
  expect(subscription).toHaveBeenLastCalledWith("last value");
  expect(obs.getValue()).toEqual("last value");
});

test("Observable notifies current value on new subscribes", () => {
  const obs = new EventObservable("initial value");
  const subscription = vitest.fn();
  obs.subscribe(subscription);
  expect(subscription).toHaveBeenCalledWith("initial value");
});

test("Observable notifies current value on new subscribes after next", () => {
  const obs = new EventObservable();
  obs.private("first value");
  const subscription = vitest.fn();
  obs.subscribe(subscription);
  expect(subscription).toHaveBeenCalledWith("first value");
});

test("Observable notifies current value on new subscribes after optimistic next", () => {
  const obs = new EventObservable();
  obs.optimisticNext("optimistic value");
  const subscription = vitest.fn();
  obs.subscribe(subscription);
  expect(subscription).toHaveBeenCalledWith("optimistic value");
});

test("Observable notifies optimistic value on new subscribes", () => {
  const obs = new EventObservable();
  obs.optimisticNext("optimistic value");
  const subscription = vitest.fn();
  obs.subscribe(subscription);
  expect(subscription).toHaveBeenCalledWith("optimistic value");
});

test("Observable does not notify same value", () => {
  const obs = new EventObservable("initial value");
  const subscription = vitest.fn();
  obs.subscribe(subscription);
  obs.private("initial value");
  expect(subscription).toHaveBeenCalledTimes(1);
});

test("Observable notifies new values to multiple subscribers", () => {
  const obs = new EventObservable();
  const subscription1 = vitest.fn();
  const subscription2 = vitest.fn();
  obs.subscribe(subscription1);
  obs.subscribe(subscription2);
  obs.private("first value");
  expect(subscription1).toHaveBeenLastCalledWith("first value");
  expect(subscription2).toHaveBeenLastCalledWith("first value");
  obs.private("second value");
  expect(subscription1).toHaveBeenLastCalledWith("second value");
  expect(subscription2).toHaveBeenLastCalledWith("second value");
});
