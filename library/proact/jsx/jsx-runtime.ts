import { type Reactive, effect, isReactive } from "../signal"
import type { HTMLElements } from "./jsx"

declare global {
  namespace JSX {
    // type Element = Node;
    interface CustomAttributes {}
    interface IntrinsicAttributes {}
    interface IntrinsicElements extends HTMLElements {}
  }
}

type Child = string | number | boolean | null | undefined | Node
type Children = Array<Child | Reactive<Child>>
type Component<Props = {}> = (props: Props & { children?: Children }) => Node
export type ComponentProps<T> = T extends Component<infer Props>
  ? Props
  : T extends keyof HTMLElements
  ? HTMLElements[T]
  : Record<string, never>

export { jsx as jsxs }
export function jsx<TagOrComponent extends keyof HTMLElements | Component>(
  tag: TagOrComponent,
  props: ComponentProps<TagOrComponent> & { children?: Children },
): Node {
  // basically, if it’s a function.
  if (typeof tag === "function") return tag(props as never)
  const { children, ...attributes } = props
  return createElement(String(tag), attributes, children ?? [])
}

export function createElement(
  tag: string,
  props: Record<string, any>,
  children: Children | Children[number],
) {
  if (!Array.isArray(children)) children = [children]
  const element = document.createElement(tag)
  renderChildren(element, children)
  for (const [key, value] of Object.entries(props)) {
    // OPTIONAL: only if you added the ref prop.
    if (key === "ref") value(element)
    else if (isEventHandler(key, value)) setEventHandler(element, key, value)
    else if (isReactive(value)) setReactiveAttribute(element, key, value)
    else setAttribute(element, key, value)
  }
  return element
}

type AnyFunction = (...args: any[]) => any
function isEventHandler(key: string, value: unknown): value is AnyFunction {
  return typeof value === "function" && key.startsWith("on")
}

function setEventHandler(
  element: HTMLElement,
  event: string,
  handler: (event: any) => any,
) {
  const eventName = event.replace("on", "").toLowerCase()
  element.addEventListener(eventName, handler)
}

function setAttribute(element: Element, key: string, value: unknown) {
  // handle edge-cases first
  if (key === "checked") return ((element as any)[key] = value)
  if (key === "value") return ((element as any)[key] = value ?? "")
  if (typeof value === "boolean") element.toggleAttribute(key, value)
  else element.setAttribute(key, String(value))
}

function setReactiveAttribute(
  element: Element,
  key: string,
  value: Reactive<any>,
) {
  // TODO: avoid running effect when the element
  // is disconnected from the dom.

  // the proposal is shipped with an `effect` function, let’s use it:
  effect(() => {
    // leverage the existing `setAttribute` implementation` !
    setAttribute(element, key, value.get())
  })
}

function renderChildren(element: Element, children: Children) {
  children.flat().forEach((child) => {
    isReactive(child)
      ? renderReactiveChild(element, child)
      : renderChild(element, child)
  })
}

function renderChild(element: Element, child: Child) {
  const node = childToNode(child)
  // The node may have been added previously.
  // (applicable only when we’ll add reactivity)
  if (!element.contains(node)) element.append(node)
}

function renderReactiveChild(element: Element, signal: Reactive<Child>) {
  // TODO: avoid running effect when the element
  // is disconnected from the dom.

  // To spare us some work, we’ll consider one use-case, and one use-case only: when we have a child list.
  // Why do I do that ? Because a single child can be considered as a list of 1 element.
  // Plus, a reactive child can see its value change from a single child to multiple children. Handling a single child as a child list covers all scenarios.

  // keep a previousNode reference to handle updates and removal of child lists.
  let previousNodes: Node[] = []
  effect(() => {
    const child = signal.get()
    const children = Array.isArray(child) ? child : [child]
    const nodes = children.flat().map(childToNode)

    // "anchor" because the node I’ll take as reference to know where
    // to append/replace old nodes by new nodes.
    const anchor = previousNodes[0]
    // handle edge-case first: first render
    if (!anchor) element.append(...nodes)
    else {
      // because I’ll be removing old nodes, I need to persist an anchor first.
      const tempAnchor = document.createTextNode("")
      // insert temp anchor before the anchor –previous– node.
      element.insertBefore(tempAnchor, anchor)
      previousNodes.forEach((node) => element.removeChild(node))
      // add all new nodes before temp anchor
      nodes.forEach((node) => element.insertBefore(node, tempAnchor))

      element.removeChild(tempAnchor)
    }
    previousNodes = nodes // keep reference !
  })
}

function childToNode(child: Child): Node {
  if (child instanceof Node) return child
  if (child === undefined || child === null) return document.createTextNode("")
  if (typeof child === "boolean") return document.createTextNode("")
  if (typeof child === "number") return document.createTextNode(String(child))
  if (typeof child === "string") return document.createTextNode(child)

  const error = new Error("unhandled child type")
  Object.assign(error, { cause: child })
  throw error
}
