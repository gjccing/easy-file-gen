import { FirebaseError } from "firebase/app";
import { createSignal, onMount } from "solid-js";
import { showToast } from "~/components/ui/toast";
import { getTemplateById } from "~/lib/api/templates";

export function createTemplateResource(props: { templateId: string }) {
  const [template, setTemplate] = createSignal<Model.Template>();
  const [error, setError] = createSignal<any>();
  const [loading, setLoading] = createSignal<boolean>();
  const loadTemplate = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };
  onMount(loadTemplate);
  return [template, error, loadTemplate, loading];
}
