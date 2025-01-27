import { createSignal, onMount } from "solid-js";
import { SettingsFormValues } from "~/components/settings/SettingsForm";
import { getSettings } from "~/lib/api/settings";
import { createDataLoader } from "./createFetchData";

export function createSettingsFormValuesResource() {
  const [settingsFormValues, setSettingsFormValues] =
    createSignal<SettingsFormValues>();
  const [load, loading, error] = createDataLoader(async () => {
    const settings = await getSettings();
    const apiTokenExpiresAt =
      settings?.apiToken.expiresAt?.toDate().toISOString().slice(0, 16) ?? "";
    setSettingsFormValues({
      ...settings,
      apiToken: {
        ...settings.apiToken,
        expiresAt: apiTokenExpiresAt,
      },
    });
  });
  onMount(load);
  return { settingsFormValues, loading, error, load };
}
