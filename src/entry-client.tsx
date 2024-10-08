// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { app } from "~/lib/firebase";
import "./userWorker";
// import "solid-devtools";

const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider("6Lfw1CIqAAAAACaUTidlS-4ieRYdJil8dEGoagYp"),
  isTokenAutoRefreshEnabled: true,
});

mount(() => <StartClient />, document.getElementById("app")!);
