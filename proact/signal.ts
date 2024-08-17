import { Signal } from "signal-polyfill";

export type Reactive<T> = { get: () => T };
export function isReactive(value: any): value is Reactive<any> {
  return (
    !!value &&
    typeof value === "object" &&
    typeof (value as any).get === "function"
  );
}

// code taken from https://github.com/proposal-signals/signal-polyfill?tab=readme-ov-file#creating-a-simple-effect
let needsEnqueue = true;
const watcher = new Signal.subtle.Watcher(() => {
  if (needsEnqueue) {
    needsEnqueue = false;
    queueMicrotask(processPending);
  }
});

function processPending() {
  needsEnqueue = true;

  for (const s of watcher.getPending()) {
    s.get();
  }

  watcher.watch();
}
export function effect(callback: () => void) {
  const computed = new Signal.Computed(callback);

  watcher.watch(computed);
  computed.get();

  const dispose = () => {
    watcher.unwatch(computed);
  };
  return dispose;
}
