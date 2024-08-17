import { Signal } from "signal-polyfill"

interface Props {
  count: Signal.State<number>
}
export function Counter({ count }: Props) {
  const decrement = (event: Event) => count.set(count.get() - 1)
  const increment = (event: Event) => count.set(count.get() + 1)

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
  )
}
