import { useLocation } from "@solidjs/router";
import { useNavigate } from "@solidjs/router";
import { signOut } from "firebase/auth";
import { auth } from "~/lib/firebase";

export default function NonAuthNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const active = (path: string) =>
    path == location.pathname
      ? "border-sky-600"
      : "border-transparent hover:border-sky-600";

  return (
    <nav class="bg-sky-800">
      <ul class="container flex items-center p-3 text-gray-200">
        <li class={`border-b-2 ${active("/")} mx-1.5 sm:mx-6`}>
          <a href="/">Home</a>
        </li>
        <li class={`border-b-2 ${active("/about")} mx-1.5 sm:mx-6`}>
          <a href="/about">About</a>
        </li>
        <li class={`border-b-2 ${active("/signin")} mx-1.5 sm:mx-6`}>
          <a href="/signin">Sign In</a>
        </li>
        <li class={`border-b-2 ${active("/signin")} mx-1.5 ml-auto`}>
          <a
            href="#"
            onClick={async () => {
              await signOut(auth);
              navigate("/");
            }}
          >
            Sign Out
          </a>
        </li>
      </ul>
    </nav>
  );
}
