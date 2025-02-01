import { createSignal, onMount } from "solid-js";
import { getSettings } from "~/lib/api/settings";
import { createDataLoader } from "./createFetchData";

export function createSettingsResource() {
  const [settings, setSettings] = createSignal<Model.Settings>();
  const [load, loading, error] = createDataLoader(async () => {
    setSettings(await getSettings());
  });
  onMount(load);
  return { settings, loading, error, load };
}
