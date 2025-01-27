import { Show } from "solid-js";
import SettingsForm from "~/components/settings/SettingsForm";
import { showToast } from "~/components/ui/toast";
import { createSettingsFormValuesResource } from "~/lib/api/createSettingsFormValuesResource";
import { updateSettings } from "~/lib/api/settings";
import { Timestamp } from "firebase/firestore";
import { auth } from "~/lib/firebase";
import Page from "~/components/Page";
import { createDataLoader } from "~/lib/api/createFetchData";

export default function Settings() {
  const uid = auth.currentUser?.uid;
  const { settingsFormValues } = createSettingsFormValuesResource();
  const [load] = createDataLoader(async (value) => {
    await updateSettings({
      apiToken: {
        token: value.apiToken.token,
        ...(value.apiToken.expiresAt
          ? {
              expiresAt: Timestamp.fromDate(new Date(value.apiToken.expiresAt)),
            }
          : null),
      },
      accessControlAllowOrigin: value.accessControlAllowOrigin ?? [],
      webhooks: value.webhooks ?? [],
    });
    showToast({
      title: "Settings updated.",
      variant: "success",
    });
  });
  return (
    <Page title="Settings" loading={!settingsFormValues()}>
      <Show when={settingsFormValues()}>
        <SettingsForm
          defaultValue={settingsFormValues()}
          onSubmit={load}
          uid={uid ?? ""}
        />
      </Show>
    </Page>
  );
}
