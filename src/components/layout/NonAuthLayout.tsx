import { type JSX } from "solid-js"
import { Suspense } from "solid-js";
import Nav from "./Nav";

export default function NonAuthLayout(props: { children?: JSX.Element; }) {
  return (
    <div>
      <Nav />
      <Suspense>{props.children}</Suspense>
    </div>
  );
}
