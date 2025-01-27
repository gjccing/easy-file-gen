import { type JSX } from "solid-js";
import { onMount, Show, createSignal } from "solid-js";
import { useNavigate, useLocation } from "@solidjs/router";
import { auth } from "~/lib/firebase";
import Nav from "~/components/Nav";
import { IconLoader } from "~/components/icons";

export default (props: { children?: JSX.Element }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthValid, setIsAuthValid] = createSignal(false);
  onMount(async () => {
    await auth.authStateReady();
    if (!auth.currentUser)
      navigate(
        "/signin?redirect=" +
          encodeURIComponent(
            location.pathname + location.search + location.hash
          ),
        { replace: true }
      );
    else setIsAuthValid(!!auth.currentUser);
  });
  return (
    <div class="flex flex-col h-svh">
      <Nav />
      <Show
        when={isAuthValid()}
        fallback={
          <div class="grow flex justify-center items-center">
            <IconLoader class="mr-2 size-16 animate-spin" />
          </div>
        }
      >
        <div class="flex-1 space-y-4 p-8 pt-6">{props.children}</div>
      </Show>
    </div>
  );
};
