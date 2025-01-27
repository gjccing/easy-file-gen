import { A } from "@solidjs/router";
import Counter from "~/components/Counter";
import PublicLayout from "~/components/PublicLayout";

export default function Home() {
  return (
    <PublicLayout title="Home">
      <Counter />
      <p class="mt-8">
        Visit{" "}
        <a
          href="https://solidjs.com"
          target="_blank"
          class="text-sky-600 hover:underline"
        >
          solidjs.com
        </a>{" "}
        to learn how to build Solid apps.
      </p>
      <p class="my-4">
        <span>Home</span>
        {" - "}
        <A href="/about" class="text-sky-600 hover:underline">
          About Page
        </A>{" "}
      </p>
    </PublicLayout>
  );
}
