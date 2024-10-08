import type { ComponentProps } from "solid-js";
import { splitProps } from "solid-js";
import { A } from "@solidjs/router";
import { useLocation } from "@solidjs/router";
import { cn } from "~/lib/utils";

export default function MainNav(props: ComponentProps<"nav">) {
  const location = useLocation();
  const [, rest] = splitProps(props, ["class"]);
  const active = (path: string) =>
    location.pathname.startsWith(path) ? "" : "text-muted-foreground";
  return (
    <nav
      class={cn("flex items-center space-x-4 lg:space-x-6", props.class)}
      {...rest}
    >
      <A
        href="/templates"
        class={`text-sm font-medium ${active(
          "/templates"
        )} transition-colors hover:text-primary`}
      >
        Templates
      </A>
    </nav>
  );
}
