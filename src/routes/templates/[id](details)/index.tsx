import { Show, createEffect } from "solid-js";
import { useNavigate, useParams } from "@solidjs/router";
import debounce from "lodash/debounce";
import DashboardLayout from "~/components/layout/DashboardLayout";
import { Toggle } from "~/components/ui/toggle";
import { deleteTemplateById, enableTemplateById } from "~/lib/api/templates";
import { IconLoader, IconLock, IconUnlock } from "~/components/icons";
import { showToast } from "~/components/ui/toast";
import { Separator } from "~/components/ui/separator";
import { Button } from "~/components/ui/button";
import { DeleteDialog } from "~/components/templates/DeleteDialog";
import { createTemplateResource } from "~/lib/api/createTemplateResource";

export default function Details() {
  const navigate = useNavigate();
  const templateId = useParams().id;
  const [template, error] = createTemplateResource({ templateId });
  createEffect(() => error() && navigate("/templates", { replace: true }));
  return (
    <DashboardLayout title="Template Detail" containerClass="relative">
      <p class="text-sm text-muted-foreground">Id: {templateId}</p>
      <div class="flex items-center gap-2">
        <Toggle
          pressed={template()?.enabled}
          onChange={debounce(async (enabled) => {
            await enableTemplateById(template()?.id ?? "", enabled);
            loadTemplate();
            showToast({
              title: `The template:${template()?.name} is ${
                enabled ? "enabled" : "disabled"
              }.`,
              variant: "default",
            });
          }, 150)}
        >
          {(state) => (
            <Show when={state.pressed()} fallback={<IconLock />}>
              <IconUnlock />
            </Show>
          )}
        </Toggle>
        <h1 class="text-3xl font-bold">
          {template()?.outputType}: {template()?.name}
        </h1>
        <div class="ml-auto flex items-center justify-end space-x-2">
          <Button variant="link" as="a" href={`/templates/${templateId}/edit`}>
            Edit
          </Button>
          <DeleteDialog
            as={Button<"button">}
            variant="destructive"
            onDelete={async () => {
              await deleteTemplateById(templateId);
              navigate("../");
            }}
          >
            Delete
          </DeleteDialog>
        </div>
      </div>
      <p class="text-muted-foreground">{template()?.description}</p>
      <Separator />
      GenFileRecord
      <Show when={!template()}>
        <div class=" absolute top-0 left-0 size-full flex justify-center items-center bg-white bg-opacity-80">
          <IconLoader class="mr-2 size-8 animate-spin" />
        </div>
      </Show>
    </DashboardLayout>
  );
}
