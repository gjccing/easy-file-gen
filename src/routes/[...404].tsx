import { A } from "@solidjs/router";
import PublicLayout from "~/components/PublicLayout";

export default function NotFound() {
  return (
    <PublicLayout title="404 not found">
      <p class="mt-8">
        Back to{" "}
        <A href="/" class="text-sky-600 hover:underline">
          home page
        </A>
        .
      </p>
    </PublicLayout>
  );
}
