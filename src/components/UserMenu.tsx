import { onMount, createSignal } from "solid-js";
import { auth } from "~/lib/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export default function UserMenu() {
  const [profile, setProfile] = createSignal<{
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    photoFB: string | null;
  }>();
  onMount(async () => {
    await auth.authStateReady();
    if (auth.currentUser) {
      setProfile({
        ...auth.currentUser,
        photoFB: (auth.currentUser.displayName || "")
          .split(" ")
          .slice(0, 2)
          .map((i) => i[0].toUpperCase())
          .join(""),
      });
    }
  });

  async function handleClickLogout() {
    await auth.signOut();
    window.location.href = "/";
  }

  return (
    <DropdownMenu placement="bottom-end">
      <DropdownMenuTrigger
        as={Button<"button">}
        variant="ghost"
        class="relative size-8 rounded-full"
      >
        <Avatar class="size-8">
          <AvatarImage
            src={profile()?.photoURL ?? ""}
            alt={profile()?.displayName ?? ""}
          />
          <AvatarFallback>{profile()?.photoFB}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="w-56">
        <DropdownMenuLabel class="font-normal">
          <div class="flex flex-col space-y-1">
            <p class="text-sm font-medium leading-none">
              {profile()?.displayName}
            </p>
            <p class="text-xs leading-none text-muted-foreground">
              {profile()?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleClickLogout}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
