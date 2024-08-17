import { Signal } from "signal-polyfill"
import { Counter } from "./Counter"

function App() {
  const count = new Signal.State(0)
  return (
    <div>
      <Counter count={count} />
      <br />
      <div>Value: {count}</div>
    </div>
  )
}
const element = document.getElementById("app")
if (!element) throw new Error("no root element")
element.replaceChildren(<App />)
