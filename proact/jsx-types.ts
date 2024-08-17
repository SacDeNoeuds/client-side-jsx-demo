import type { HTMLElements } from "./jsx/types";

declare global {
  namespace JSX {
    type Element = Node;
    interface CustomAttributes {}
    interface IntrinsicElements extends HTMLElements {}
  }
}
