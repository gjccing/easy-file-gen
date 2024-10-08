import { FirebaseError } from "firebase/app";
import { createSignal, onMount } from "solid-js";
import { showToast } from "~/components/ui/toast";
import { getTemplateById } from "~/lib/api/templates";

export function createTemplateResource(props: { templateId: string }) {
  const [template, setTemplate] = createSignal<Model.Template>();
  const [error, setError] = createSignal<any>();
  const loadTemplate = async () => {
    try {
      setTemplate(await getTemplateById(props.templateId));
    } catch (e) {
      if (e instanceof FirebaseError) {
        if (e.code === "permission-denied")
          showToast({
            title:
              "Can not find the template. Please check URL or contact us for assistance.",
            variant: "error",
          });
      } else
        showToast({
          title: "Something went wrong. Please contact us for assistance.",
          variant: "error",
        });
      setError(e);
      console.error(e);
    }
  };
  onMount(loadTemplate);
  return [template, error];
}
