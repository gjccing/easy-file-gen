import { FirebaseError } from "firebase/app";
import { createSignal, onMount } from "solid-js";
import { getTemplateById } from "~/lib/api/templates";
import { createDataLoader } from "./createFetchData";

export function createTemplateResource(props: { templateId: string }) {
  const [template, setTemplate] = createSignal<Model.Template>();
  const [load, loading, error] = createDataLoader(
    async () => {
      setTemplate(await getTemplateById(props.templateId));
    },
    (error) => {
      if (error instanceof FirebaseError) {
        if (error.code === "permission-denied")
          return "Can not find the template. Please check URL or contact us for assistance.";
      }
    }
  );
  onMount(load);
  return { template, loading, error, load };
}
