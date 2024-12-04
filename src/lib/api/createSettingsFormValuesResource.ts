import { FirebaseError } from "firebase/app";
import { createSignal, onMount } from "solid-js";
import { SettingsFormValues } from "~/components/settings/SettingsForm";
import { showToast } from "~/components/ui/toast";
import { getSettings } from "~/lib/api/settings";

export function createSettingsFormValuesResource() {
  const [settings, setSettings] = createSignal<Model.Settings>();
  const [error, setError] = createSignal<any>();
  const loadSettings = async () => {
    try {
      setSettings(await getSettings());
    } catch (e) {
      if (!(e instanceof FirebaseError && e.code === "permission-denied")) {
        showToast({
          title: "Something went wrong. Please contact us for assistance.",
          variant: "error",
        });
        setError(e);
        console.error(e);
      }
    }
  };
  onMount(loadSettings);
  return [
    (): SettingsFormValues | undefined => {
      const _settings = settings();
      const apiTokenExpiresAt = _settings?.apiToken.expiresAt
        ?.toDate()
        .toISOString()
        .slice(0, 16);
      if (_settings) {
        return {
          ..._settings,
          apiToken: {
            ..._settings.apiToken,
            expiresAt: apiTokenExpiresAt,
          },
        };
      }
    },
    settings,
    error,
  ];
}
