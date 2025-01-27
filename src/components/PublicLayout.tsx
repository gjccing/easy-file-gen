import { Title } from "@solidjs/meta";
import { JSX } from "solid-js";
import Nav from "./Nav";

export default function Page(props: {
  title?: string;
  children?: JSX.Element;
}) {
  return (
    <>
      <div class="flex flex-col h-svh">
        <Nav />
        <div class="flex-1 space-y-4 p-8 pt-6">
          <main class="text-center mx-auto text-gray-700 p-4">
            <Title>{props.title}</Title>
            <h1 class="max-6-xs text-6xl text-sky-700 font-thin uppercase my-16">
              {props.title}
            </h1>
            <div class="text-center mx-auto text-gray-700 p-4">
              {props.children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
