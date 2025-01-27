import { Show, createSignal, onMount } from "solid-js";
import { useLocation, A } from "@solidjs/router";
import { auth } from "~/lib/firebase";
import UserMenu from "~/components/UserMenu";

export default function Nav() {
  const location = useLocation();
  const active = (path: string) =>
    location.pathname.startsWith(path) ? "" : "text-muted-foreground";

  const [isAuthValid, setIsAuthValid] = createSignal(false);
  onMount(async () => {
    await auth.authStateReady();
    setIsAuthValid(!!auth.currentUser);
  });
  return (
    <div class="flex h-16 items-center px-4 border-b shrink-0">
      <nav class="flex items-center space-x-4 lg:space-x-6 mx-6">
        <A
          href="/"
          class={`text-sm font-medium ${active(
            "/"
          )} transition-colors hover:text-primary`}
        >
          Easy-File-Gen
        </A>
        <A
          href="/templates"
          class={`text-sm font-medium ${active(
            "/templates"
          )} transition-colors hover:text-primary`}
        >
          Templates
        </A>
        <A
          href="/settings"
          class={`text-sm font-medium ${active(
            "/settings"
          )} transition-colors hover:text-primary`}
        >
          Settings
        </A>
        <A
          href="/about"
          class={`text-sm font-medium ${active(
            "/about"
          )} transition-colors hover:text-primary`}
        >
          About
        </A>
      </nav>
      <div class="ml-auto flex items-center space-x-4">
        <Show
          when={isAuthValid()}
          fallback={
            <A
              href="/signin"
              class="text-sm font-medium transition-colors hover:text-primary"
            >
              Sign In
            </A>
          }
        >
          <UserMenu />
        </Show>
      </div>
    </div>
  );
}
