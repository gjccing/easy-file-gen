import { createSignal, onMount } from "solid-js";
import { TemplateFormValues } from "~/components/templates/TemplateForm";
import { getTemplateAndContentById } from "~/lib/api/templates";
import { createDataLoader } from "./createFetchData";
import { FirebaseError } from "firebase/app";

export function createTemplateFormValuesResource(props: {
  templateId: string;
}) {
  const [templateFormValues, setTemplateFormValues] = createSignal<
    TemplateFormValues | undefined
  >();
  const [load, loading, error] = createDataLoader(
    async () => {
      const [template, content] = await getTemplateAndContentById(
        props.templateId
      );
      setTemplateFormValues({
        outputType: template.outputType,
        name: template.name,
        description: template.description,
        engine: template.engine,
        enabled: template.enabled,
        content,
      });
    },
    (error) => {
      if (error instanceof FirebaseError) {
        if (error.code === "permission-denied")
          return "Can not find the template. Please check URL or contact us for assistance.";
        else if (error.code === "storage/object-not-found")
          return "Can not find the content file. Please remove and create it again or contact us for assistance.";
      }
    }
  );
  onMount(load);
  return { templateFormValues, loading, error, load };
}
