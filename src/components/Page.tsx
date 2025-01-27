import { Title } from "@solidjs/meta";
import { JSX, Show } from "solid-js";
import { IconLoader } from "~/components/icons";

export default function Page(props: {
  title?: string;
  loading?: boolean;
  children?: JSX.Element;
}) {
  return (
    <>
      <Title>{props.title}</Title>
      <div class="flex items-center justify-between space-y-2">
        <h1 class="text-3xl font-bold tracking-tight">{props.title}</h1>
      </div>
      <main class="flex flex-col gap-4 relative">
        {props.children}
        <Show when={props.loading}>
          <div class=" absolute top-0 left-0 size-full flex justify-center items-center bg-white bg-opacity-80">
            <IconLoader class="mr-2 size-8 animate-spin" />
          </div>
        </Show>
      </main>
    </>
  );
}
