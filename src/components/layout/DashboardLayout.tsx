import { type JSX } from "solid-js";
import { onMount, Switch, Match, createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { Title } from "@solidjs/meta";

import { auth } from "~/lib/firebase";
import MainNav from "~/components/layout/MainNav";
import UserNav from "~/components/layout/UserNav";
import { IconLoader } from "~/components/icons";
import { cn } from "~/lib/utils";

export default function DashboardLayout(props: {
  title: string;
  containerClass?: string | undefined;
  children?: JSX.Element;
}) {
  const navigate = useNavigate();
  const [isAuthValid, setIsAuthValid] = createSignal(false);
  onMount(() => {
    auth.onAuthStateChanged(() => {
      if (auth.currentUser === null) navigate("/signin", { replace: true });
      else setIsAuthValid(true);
    });
  });
  return (
    <>
      <Title>{props.title}</Title>
      <div class="flex flex-col">
        <div class="border-b">
          <div class="flex h-16 items-center px-4">
            <MainNav class="mx-6" />
            <div class="ml-auto flex items-center space-x-4">
              <UserNav />
            </div>
          </div>
        </div>
        <div class={`flex-1 space-y-4 p-8 pt-6 ${cn(props.containerClass)}`}>
          <Switch>
            <Match when={isAuthValid}>{props.children}</Match>
            <Match when={!isAuthValid}>
              <IconLoader class="mr-2 size-16 animate-spin" />
            </Match>
          </Switch>
        </div>
      </div>
    </>
  );
}
