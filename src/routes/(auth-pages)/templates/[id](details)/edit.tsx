import { useParams } from "@solidjs/router";
import { useNavigate } from "@solidjs/router";
import { Show } from "solid-js";
import Page from "~/components/Page";
import { DeleteDialog } from "~/components/templates/DeleteDialog";
import { TemplateForm } from "~/components/templates/TemplateForm";
import { Button } from "~/components/ui/button";
import { createDataLoader } from "~/lib/api/createFetchData";
import { createTemplateFormValuesResource } from "~/lib/api/createTemplateFormValuesResource";
import { createTemplateResource } from "~/lib/api/createTemplateResource";
import { deleteTemplateById, updateTemplate } from "~/lib/api/templates";

export default function Edit() {
  const navigate = useNavigate();
  const templateId = useParams().id;
  const { templateFormValues, loading: loadingTemplateFormValues } =
    createTemplateFormValuesResource({
      templateId,
    });
  const { template, loading: loadingTempl } = createTemplateResource({
    templateId,
  });
  const [load] = createDataLoader(async (value) => {
    await updateTemplate({ ...template(), ...value });
    navigate("..");
  });
  return (
    <Page
      title={`Edit the Template`}
      loading={loadingTemplateFormValues() || loadingTempl()}
    >
      <div class="flex items-center space-x-2">
        <p class="text-sm text-muted-foreground mr-auto">Id: {templateId}</p>
        <DeleteDialog
          as={Button<"button">}
          variant="destructive"
          onDelete={async () => {
            await deleteTemplateById(templateId);
            navigate("/templates");
          }}
        >
          Delete
        </DeleteDialog>
      </div>
      <div class="flex flex-col gap-4 relative">
        <Show when={templateFormValues()}>
          <TemplateForm defaultValue={templateFormValues()} onSubmit={load} />
        </Show>
      </div>
    </Page>
  );
}
