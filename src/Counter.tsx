import { Signal } from "signal-polyfill";

interface Props {
  initialCount?: number;
}
export function Counter({ initialCount = 0 }: Props) {
  const count = new Signal.State(initialCount);
  const decrement = (event: Event) => count.set(count.get() - 1);
  const increment = (event: Event) => count.set(count.get() + 1);

  return (
    <div class="counter" data-count={count}>
      <button type="button" onclick={decrement}>
        -
      </button>
      <span>{count}</span>
      <button type="button" onclick={increment}>
        +
      </button>
    </div>
  );
}
