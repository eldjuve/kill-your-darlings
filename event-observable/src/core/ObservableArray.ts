export interface ObservableArrayObserver<T> {
  onSubscribe: BasicObserver<T>;
  onItemAdded: (item: T) => void;
  onItemUpdated: (item: T, index: number) => void;
  onItemRemoved: (item: T, index: number) => void;
  onClear: () => void;
}

type BasicObserver<T> = (value: T[]) => void;

type Observer<T> = ObservableArrayObserver<T> | BasicObserver<T>;

export class ObservableArray<T> {
  private _value: T[] = [];
  private _observers: Observer<T>[] = [];

  public getValue() {
    return this._value;
  }

  public get value() {
    return this.getValue();
  }

  public push(item: T) {
    this._value.push(item);
    this._observers.forEach((observer) => {
      if (typeof observer === "object") {
        observer.onItemAdded(item);
      } else {
        observer(this._value);
      }
    });
  }

  private _notifyRemoved(item: T, index: number) {
    this._observers.forEach((observer) => {
      if (typeof observer === "object") {
        observer.onItemRemoved(item, index);
      } else {
        observer(this._value);
      }
    });
  }

  public remove(filterFunc: (item: T) => boolean): void;
  public remove(item: T): void;
  public remove(a: ((item: T) => boolean) | T) {
    if (a instanceof Function) {
      this._value.forEach((item, index) => {
        if (a(item)) {
          const removed = this._value.splice(index, 1)[0];
          this._notifyRemoved(removed, index);
        }
      });
    } else {
      const index = this._value.indexOf(a);
      const removed = this._value.splice(index, 1)[0];
      this._notifyRemoved(removed, index);
    }
  }

  notifyUpdated(item: T, index: number) {
    this._observers.forEach((observer) => {
      if (typeof observer === "object") {
        observer.onItemUpdated(item, index);
      } else {
        observer(this._value);
      }
    });
  }

  public replace(filterFunc: (item: T) => boolean, newItem: T): void;
  public replace(oldItem: T, newItem: T): void;
  public replace(a: T | ((item: T) => boolean), b: T) {
    if (a instanceof Function) {
      this._value.forEach((item, index) => {
        if (a(item)) {
          this._value[index] = b;
          this.notifyUpdated(b, index);
        }
      });
    } else {
      const index = this._value.indexOf(a);
      this._value[index] = b;
      this.notifyUpdated(b, index);
    }
  }

  public addOrUpdate(filterFunc: (item: T) => boolean, newItem: T) {
    const prev = this._value.find(filterFunc);

    if (prev) {
      this.replace(prev, newItem);
    } else {
      this.push(newItem);
    }
  }

  private _unsubscribe(observer: Observer<T>) {
    this._observers = this._observers.filter((curObs) => curObs !== observer);
  }

  public subscribe(observer: Observer<T>) {
    this._observers.push(observer);
    if (typeof observer === "object") {
      observer.onSubscribe(this._value);
    } else {
      observer(this._value);
    }
    return () => this._unsubscribe(observer);
  }

  public clear() {
    this._value = [];
    this._observers.forEach((observer) => {
      if (typeof observer === "object") {
        observer.onClear();
      } else {
        observer(this._value);
      }
    });
  }
}
