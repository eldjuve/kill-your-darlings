export type Observer<T> = (value: T) => void;
export class Observable<S, T = S | undefined> {
  private _curVal: T | undefined;
  private _observers: Observer<T>[] = [];
  constructor(initialValue?: T) {
    this._curVal = initialValue;
  }
  public get value() {
    return this._curVal;
  }
  public subscribe(observer: Observer<T>) {
    this._observers.push(observer);
    if (this._curVal !== undefined) {
      observer(this._curVal);
    }
  }
  public next(val: T) {
    if (this._curVal === val) return;
    this._curVal = val;
    for (const observer of this._observers) {
      observer(val);
    }
  }
}
