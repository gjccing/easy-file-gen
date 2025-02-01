import { onMount } from "solid-js";
import SwaggerUI from "swagger-ui";
import spec from "./spec.yaml";
import Nav from "~/components/Nav";
import { Title } from "@solidjs/meta";
import { auth } from "~/lib/firebase";
import { showToast } from "~/components/ui/toast";

export default function API() {
  onMount(async () => {
    const swaggerUi = SwaggerUI({
      dom_id: "#myDomId",
      spec,
    });
    await auth.authStateReady();
    if (auth.currentUser) {
      swaggerUi.preauthorizeApiKey(
        "BearerAuth",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ6NGU4Mm5ua1l2ZmNxbTJMUU5pbnE2dGFGWVEyIiwiZXhwaXJlc0F0IjpudWxsfQ.S6SMZPVX_WeNJYI8qqeF6HYCz3X-EmqI5KV63sDP5xM"
      );
      showToast({
        title: "Automatically set authorization.",
        variant: "success",
      });
    }
  });
  return (
    <>
      <Title>API</Title>
      <div class="flex flex-col h-svh">
        <Nav />
        <div class="flex-1 space-y-4 p-8 pt-6">
          <main id="myDomId"></main>
        </div>
      </div>
    </>
  );
}
