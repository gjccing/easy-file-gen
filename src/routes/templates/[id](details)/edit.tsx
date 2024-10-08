import { useParams } from "@solidjs/router";
import { useNavigate } from "@solidjs/router";
import { createEffect, Show } from "solid-js";
import { IconLoader } from "~/components/icons";
import DashboardLayout from "~/components/layout/DashboardLayout";
import { TemplateForm } from "~/components/templates/TemplateForm";
import { showToast } from "~/components/ui/toast";
import { createTemplateFormValuesResource } from "~/lib/api/createTemplateFormValuesResource";
import { updateTemplate } from "~/lib/api/templates";

export default function Edit() {
  const navigate = useNavigate();
  const templateId = useParams().id;
  const [templateFormValues, template, _, error] =
    createTemplateFormValuesResource({ templateId });
  createEffect(() => error() && navigate("/templates", { replace: true }));
  return (
    <DashboardLayout title="Edit Template" containerClass="relative">
      <p class="text-sm text-muted-foreground">Id: {templateId}</p>
      <Show
        when={templateFormValues()}
        fallback={
          <div class=" absolute top-0 left-0 size-full flex justify-center items-center bg-white bg-opacity-80">
            <IconLoader class="mr-2 size-8 animate-spin" />
          </div>
        }
      >
        <div class="flex items-center justify-between space-y-2">
          <h1 class="text-3xl font-bold tracking-tight">
            Edit the Template:
            {templateFormValues().name}
            <br />
          </h1>
        </div>
        <div class="flex flex-col gap-4 relative">
          <TemplateForm
            class="test"
            defaultValue={templateFormValues()}
            onSubmit={async (data) => {
              try {
                await updateTemplate({ ...template(), ...data });
                navigate("..");
              } catch (e) {
                showToast({
                  title:
                    "Something went wrong. Please contact us for assistance.",
                  variant: "error",
                });
                console.error(e);
              }
            }}
          />
        </div>
      </Show>
    </DashboardLayout>
  );
}
