import { createSignal, onMount } from "solid-js";
import { getTemplates } from "~/lib/api/templates";
import { createDataLoader } from "./createFetchData";

export const LIMIT_NUMBER = 10;

export function createTemplatesResource() {
  const [templates, setTemplates] = createSignal<Model.Template[]>([]);
  const [load, loading, error] = createDataLoader(async () => {
    setTemplates(await getTemplates(LIMIT_NUMBER));
  });
  onMount(load);
  return { templates, loading, error, load };
}
