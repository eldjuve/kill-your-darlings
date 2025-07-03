export type BasicObserver<T> = (value: T) => void;
export type FullObserver<T> = {
  next: BasicObserver<T>;
  error: (reason: string) => void;
  //TODO: implement complete
  //complete: () => void
};
export type OnceObserver<T> = {
  once: BasicObserver<T>;
};
export type ConditionalObserver<T> = {
  completed: (value: T) => boolean;
};
export type LimitedObserver<T> = OnceObserver<T> | ConditionalObserver<T>;
export type Subscription = {
  unsubscribe: () => void;
};
export type ReadonlyObservable<T, E = undefined> = Omit<
  Observable<T, E>,
  "next" | "confirm"
>;
export type Observer<T> = BasicObserver<T> | FullObserver<T>;
export class Observable<S, E = undefined, T = S | undefined> {
  private _curVal: T | undefined;
  private _optimisticVal: T | undefined;
  private _onLastObserverUnsubscribed: (() => void) | undefined = undefined;
  private _observers: (Observer<T> | LimitedObserver<T>)[] = [];
  private _eventObservers: Observer<E>[] = [];
  public hasSubscribed = false;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private promiseResolver: (value: NonNullable<T>) => void = (value) => {};
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private promiseReject: (reason: string) => void = (reason) => {};
  public initialSnapshot = new Promise<NonNullable<T>>((resolve, reject) => {
    this.promiseResolver = resolve;
    this.promiseReject = reject;
  });
  constructor(initialValue?: T) {
    this._curVal = initialValue;
    this._optimisticVal = initialValue;
    if (initialValue) {
      this.promiseResolver(initialValue);
    }
  }
  private _unsubscribe(observer: Observer<T> | LimitedObserver<T>) {
    this._observers = this._observers.filter((curObs) => curObs !== observer);
    if (!this._observers.length && this._onLastObserverUnsubscribed) {
      this._onLastObserverUnsubscribed();
    }
  }
  public subscribe(observer: Observer<T>): Subscription {
    if (!this._observers.includes(observer)) {
      this._observers.push(observer);
      if (this._optimisticVal !== undefined) {
        this.notify(observer, this._optimisticVal);
      }
    }
    return {
      unsubscribe: () => this._unsubscribe(observer),
    };
  }
  public once(observer: BasicObserver<T>) {
    this._observers.push({ once: observer });
    if (this._optimisticVal !== undefined) {
      this.notify(observer, this._optimisticVal);
    }
    return {
      unsubscribe: () => this._unsubscribe(observer),
    };
  }
  public subscribeUntilObserverHasCompleted(observer: (value: T) => boolean) {
    this._observers.push({ completed: observer });
    if (this._optimisticVal !== undefined) {
      this.notify(observer, this._optimisticVal);
    }
    return {
      unsubscribe: () => this._unsubscribe(observer),
    };
  }
  private _unsubscribeToEvents(observer: Observer<E>) {
    this._eventObservers = this._eventObservers.filter(
      (curObs) => curObs !== observer,
    );
  }
  private notifyAll(val: T) {
    for (const observer of this._observers) {
      this.notify(observer, val);
    }
  }
  private notify(observer: Observer<T> | LimitedObserver<T>, val: T) {
    if (typeof observer === "object") {
      if ("once" in observer) {
        this._unsubscribe(observer);
        observer.once(val);
      } else if ("completed" in observer) {
        const unsubscribe = observer.completed(val);
        if (unsubscribe) {
          this._unsubscribe(observer);
        }
      } else {
        observer.next(val);
      }
    } else {
      observer(val);
    }
  }
  public subscribeToEvents(observer: Observer<E>): Subscription {
    if (!this._eventObservers.includes(observer)) {
      this._eventObservers.push(observer);
    }
    return {
      unsubscribe: () => this._unsubscribeToEvents(observer),
    };
  }
  private notifyAllEventObservers(val: E) {
    for (const observer of this._eventObservers) {
      if (typeof observer === "object") {
        observer.next(val);
      } else {
        observer(val);
      }
    }
  }
  public next(val: T, event?: E) {
    if (this._curVal === val) return;
    this._curVal = val;
    this.optimisticNext(val);
    if (event) {
      this.notifyAllEventObservers(event);
    }
  }
  public optimisticNext(val: T) {
    if (this._optimisticVal === val) return;
    this._optimisticVal = val;
    this.notifyAll(val);
    if (val) {
      this.promiseResolver(val);
    }
  }
  public getValue() {
    return this._curVal;
  }
  public get value() {
    return this.getValue();
  }
  public getOptimisticValue() {
    return this._optimisticVal;
  }
  public map<R>(mapFunc: (val: T) => R) {
    const inner = new Observable<R>();
    const subscription = this.subscribe((val) => {
      inner.next(mapFunc(val));
    });
    inner._onLastObserverUnsubscribed = subscription.unsubscribe;
    return inner as ReadonlyObservable<R>;
  }
  public rejectPromise(reason: string) {
    this.promiseReject(reason);
  }
}
