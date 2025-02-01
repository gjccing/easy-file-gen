import { A } from "@solidjs/router";
import PublicLayout from "~/components/PublicLayout";

export default function Home() {
  return (
    <PublicLayout title="Easy-File-Gen">
      <p class="mt-8">
        Streamline File Generation and Boost Your Service Performance Focus on
        your core business—we’ll handle your file generation! 🚀
      </p>
      <h4 class="max-3-xs text-3xl font-thin uppercase my-8">
        Quick Start Guide
      </h4>
      <ol class=" text-left list-decimal mx-auto w-[fit-content]">
        <li>
          <A href="/settings" class="text-sky-600 hover:underline">
            🔑 Set Up Your API Token.
          </A>
        </li>
        <li>
          <A href="/templates/new" class="text-sky-600 hover:underline">
            📄 Set Up Your Template.
          </A>
        </li>
        <li>
          <A
            href="/api#operations-tag-Trigger"
            class="text-sky-600 hover:underline"
          >
            📥 Submit Raw Data and your template ID to the trigger API.
          </A>
        </li>
        <li>
          ⚙️ Wait for the file to be generated, get the generation progress by{" "}
          <A
            href="/api#operations-tag-State"
            class="text-sky-600 hover:underline"
          >
            State API
          </A>{" "}
          or{" "}
          <A href="/settings#webhooks" class="text-sky-600 hover:underline">
            Setting Webhook
          </A>
          .
        </li>
      </ol>
    </PublicLayout>
  );
}
