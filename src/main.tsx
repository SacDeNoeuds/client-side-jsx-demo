import "./styles.css";
import { Counter } from "./Counter";
import { HTMLElements } from "proact/jsx/types";

declare global {
  namespace JSX {
    // type Element = Node;
    interface CustomAttributes {}
    interface IntrinsicElements extends HTMLElements {}
  }
}

function App() {
  return (
    <div>
      <Counter />
    </div>
  );
}
const element = document.getElementById("app")
if (!element) throw new Error('no root element');
element.replaceChildren(<App />);
