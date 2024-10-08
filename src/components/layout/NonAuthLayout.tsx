import { type JSX } from "solid-js";
import { Suspense } from "solid-js";
import NonAuthNav from "./NonAuthNav";

export default function NonAuthLayout(props: { children?: JSX.Element }) {
  return (
    <div>
      <NonAuthNav />
      <Suspense>{props.children}</Suspense>
    </div>
  );
}
