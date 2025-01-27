import { createEffect, onCleanup, onMount } from "solid-js";
import { useNavigate, useSearchParams } from "@solidjs/router";

import { cn } from "~/lib/utils";
import { auth } from "~/lib/firebase";
import { IconX } from "~/components/icons";
import { buttonVariants } from "~/components/ui/button";
import { UserAuthForm } from "~/components/signin/UserAuthForm";

export default function Signin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams<{
    redirect?: string;
  }>();

  return (
    <div class="container relative h-svh flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <a
        href="/"
        class={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute right-4 top-4 md:right-8 md:top-8"
        )}
      >
        <IconX />
      </a>
      <div class="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div class="absolute inset-0 bg-zinc-900" />
        <div class="relative z-20 flex items-center text-lg font-medium">
          EasyFileGen
        </div>
        <div class="relative z-20 mt-auto">
          <blockquote class="space-y-2">
            <p class="text-lg">
              Effortlessly convert raw data into customized files with our
              seamless template-based service. Generate and download files using
              API integration. Perfect for automated file creation.
            </p>
          </blockquote>
        </div>
      </div>
      <div class="lg:p-8">
        <div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div class="flex flex-col space-y-2 text-center">
            <h1 class="text-2xl font-semibold tracking-tight">
              Create or Login an account
            </h1>
            <p class="text-sm text-muted-foreground">Enter your email below</p>
          </div>
          <UserAuthForm
            onLogin={() => {
              const { redirect } = searchParams;
              debugger;
              navigate(redirect ?? "/templates", { replace: true });
            }}
          />
          <p class="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <a
              href="/terms"
              class="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              class="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
