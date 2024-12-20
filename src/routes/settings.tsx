import { useNavigate } from "@solidjs/router";
import { createEffect, Show } from "solid-js";
import DashboardLayout from "~/components/layout/DashboardLayout";
import SettingsForm from "~/components/settings/SettingsForm";
import { showToast } from "~/components/ui/toast";
import { createSettingsFormValuesResource } from "~/lib/api/createSettingsFormValuesResource";
import { updateSettings } from "~/lib/api/settings";
import { IconLoader } from "~/components/icons";
import { Timestamp } from "firebase/firestore";
import { auth } from "~/lib/firebase";

export default function Settings() {
  const navigate = useNavigate();
  const uid = auth.currentUser?.uid;
  const [settingsFormValues, _, error] = createSettingsFormValuesResource();
  createEffect(() => error() && navigate("/templates", { replace: true }));
  return (
    <DashboardLayout title="Settings">
      <div class="flex items-center justify-between space-y-2">
        <h1 class="text-3xl font-bold tracking-tight">Settings</h1>
      </div>
      <div class="flex flex-col gap-4 relative">
        <Show
          when={settingsFormValues()}
          fallback={
            <div class=" absolute top-0 left-0 size-full flex justify-center items-center bg-white bg-opacity-80">
              <IconLoader class="mr-2 size-8 animate-spin" />
            </div>
          }
        >
          <SettingsForm
            defaultValue={settingsFormValues()}
            onSubmit={async (value) => {
              try {
                await updateSettings({
                  apiToken: {
                    token: value.apiToken.token,
                    ...(value.apiToken.expiresAt
                      ? {
                          expiresAt: Timestamp.fromDate(
                            new Date(value.apiToken.expiresAt)
                          ),
                        }
                      : null),
                  },
                  accessControlAllowOrigin:
                    value.accessControlAllowOrigin ?? [],
                  webhooks: value.webhooks ?? [],
                });
                showToast({
                  title: "Settings updated.",
                  variant: "success",
                });
              } catch (e) {
                showToast({
                  title:
                    "Something went wrong. Please contact us for assistance.",
                  variant: "error",
                });
                console.error(e);
              }
            }}
            uid={uid ?? ""}
          />
        </Show>
      </div>
    </DashboardLayout>
  );
}
