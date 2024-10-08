import { FirebaseError } from "firebase/app";
import { createSignal, onMount } from "solid-js";
import { TemplateFormValues } from "~/components/templates/TemplateForm";
import { showToast } from "~/components/ui/toast";
import { getTemplateAndContentById } from "~/lib/api/templates";

export function createTemplateFormValuesResource(props: {
  templateId: string;
}) {
  const [template, setTemplate] = createSignal<Model.Template>();
  const [content, setContent] = createSignal<File>();
  const [error, setError] = createSignal<any>();
  const loadTemplate = async () => {
    try {
      const [template, content] = await getTemplateAndContentById(
        props.templateId
      );
      setTemplate(template);
      setContent(content);
    } catch (e) {
      if (e instanceof FirebaseError) {
        if (e.code === "permission-denied")
          showToast({
            title:
              "Can not find the template. Please check URL or contact us for assistance.",
            variant: "error",
          });
        else if (e.code === "storage/object-not-found")
          showToast({
            title:
              "Can not find the content file. Please remove and create it again or contact us for assistance.",
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
  return [
    (): TemplateFormValues | undefined => {
      const _template = template();
      const _content = content();
      if (_template && _content) {
        return {
          outputType: _template.outputType,
          name: _template.name,
          description: _template.description,
          engine: _template.engine,
          enabled: _template.enabled,
          content: _content,
        };
      }
    },
    template,
    content,
    error,
  ];
}
