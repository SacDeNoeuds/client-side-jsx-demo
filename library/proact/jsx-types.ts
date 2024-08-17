import type { HTMLElements } from "./jsx/jsx"

declare global {
  namespace JSX {
    type Element = Node
    interface CustomAttributes {}
    interface IntrinsicElements extends HTMLElements {}
  }
}
