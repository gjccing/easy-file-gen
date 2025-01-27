import { For, Index, Show } from "solid-js";
import { A, useNavigate, useParams } from "@solidjs/router";
import { deleteTemplateById } from "~/lib/api/templates";
import { Separator } from "~/components/ui/separator";
import { Button } from "~/components/ui/button";
import { DeleteDialog } from "~/components/templates/DeleteDialog";
import { createTemplateResource } from "~/lib/api/createTemplateResource";
import Page from "~/components/Page";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { TemplatePreviewReadOnlyForm } from "~/components/templates/TemplatePreviewReadOnlyForm";
import { createTaskPageResource } from "~/lib/api/createTaskPageResource";

export default function Details() {
  const navigate = useNavigate();
  const templateId = useParams().id;
  const { template, loading: loadingTempl } = createTemplateResource({
    templateId,
  });
  const {
    tasks,
    loading: loadingTasks,
    loadNext,
  } = createTaskPageResource({
    templateId,
  });
  return (
    <Page title="Template Detail" loading={loadingTempl() || loadingTasks()}>
      <div class="flex items-center space-x-2">
        <p class="text-sm text-muted-foreground mr-auto">Id: {templateId}</p>
        <Button variant="link" as="a" href={`/templates/${templateId}/edit`}>
          Edit
        </Button>
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
      <Show when={template()}>
        <TemplatePreviewReadOnlyForm defaultValue={template()} />
      </Show>
      <Separator />
      <h3 class="text-3xl font-bold">Record</h3>
      <Accordion multiple collapsible class="w-full">
        <Index each={tasks()}>
          {(task) => (
            <AccordionItem value={task().id}>
              <AccordionTrigger>
                Task: {task().id} - {task().state}
              </AccordionTrigger>
              <AccordionContent>
                <div class="mb-4 flex items-start pb-4 last:mb-0 last:pb-0">
                  <div class="space-y-1">
                    <p class="text-sm font-medium leading-none">
                      <Button
                        as={A}
                        href={task().downloadURL ?? ""}
                        target="_blank"
                        variant="link"
                      >
                        Download Link
                      </Button>
                      created at :{" "}
                      {new Date(
                        task().createdAt.seconds * 1000
                      ).toLocaleString()}
                      , last edited at:{" "}
                      {new Date(
                        task().editedAt.seconds * 1000
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
                <For each={task().events}>
                  {(event) => (
                    <div class="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                      <span class="flex size-2 translate-y-1 rounded-full bg-sky-500" />
                      <div class="space-y-1">
                        <p class="text-sm font-medium leading-none">
                          {event.name}
                        </p>
                        <p class="text-sm text-muted-foreground">
                          created at :{" "}
                          {new Date(
                            event.createdAt.seconds * 1000
                          ).toLocaleString()}
                        </p>
                        <pre class=" rounded border border-solid bg-gray-100 p-4">
                          {JSON.stringify(event, undefined, "  ")}
                        </pre>
                      </div>
                    </div>
                  )}
                </For>
                {/*  */}
              </AccordionContent>
            </AccordionItem>
          )}
        </Index>
      </Accordion>
    </Page>
  );
}
