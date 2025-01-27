import { Switch, Match, For, Show } from "solid-js";
import { A, useNavigate } from "@solidjs/router";
import { deleteTemplateById } from "~/lib/api/templates";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  IconEdit,
  IconFilePlus2,
  IconFileVideo2,
  IconFileX2,
} from "~/components/icons";
import { Button, buttonVariants } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { DeleteDialog } from "~/components/templates/DeleteDialog";
import { createTemplatesResource } from "~/lib/api/createTemplatesResource";
import { cn } from "~/lib/utils";
import Page from "~/components/Page";

export default function Templates() {
  const navigate = useNavigate();
  const { templates, loading, load } = createTemplatesResource();
  return (
    <Page title="Templates" loading={loading()}>
      <div class="flex items-center gap-4">
        <p class="text-sm text-muted-foreground">
          Template Number: {templates().length} / 10
        </p>
        <Show when={templates().length < 10}>
          <A class={`${buttonVariants({})} ml-auto`} href="/templates/new">
            <IconFilePlus2 />
          </A>
        </Show>
      </div>
      <Table class="w-[100%]">
        <TableHeader class="w-[100%]">
          <TableRow class="w-[100%]">
            <TableHead class="w-[80px] text-gray-600">
              <span class="sr-only">Output Type</span>
            </TableHead>
            <TableHead class="w-[200px]">Name</TableHead>
            <TableHead>Engine</TableHead>
            <TableHead class="w-[180px] text-right">
              <span class="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody class="w-[100%]">
          <Switch>
            <Match when={templates().length > 0}>
              <For each={templates()}>
                {(template: Model.Template) => (
                  <TableRow class="w-[100%]">
                    <TableCell
                      class={cn(
                        "font-medium uppercase",
                        { "text-gray-400": !template.enabled },
                        "w-[80px]"
                      )}
                    >
                      {template.outputType}
                    </TableCell>
                    <TableCell
                      class={cn(
                        "max-w-[300px]",
                        { "text-gray-400": !template.enabled },
                        "w-[200px]"
                      )}
                    >
                      {template.name}
                    </TableCell>
                    <TableCell
                      class={cn("max-w-0", {
                        "text-gray-400": !template.enabled,
                      })}
                    >
                      {template.engine}
                    </TableCell>
                    <TableCell class="w-[180px] text-right">
                      <Tooltip openDelay={0} closeDelay={0}>
                        <TooltipTrigger
                          as={Button}
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`./${template.id}`)}
                        >
                          <IconFileVideo2 />
                          <span class="sr-only">
                            See details(output & error)
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          See details(output & error)
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip openDelay={0} closeDelay={0}>
                        <TooltipTrigger
                          as={Button}
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`./${template.id}/edit`)}
                        >
                          <IconEdit />
                          <span class="sr-only">Edit the template</span>
                        </TooltipTrigger>
                        <TooltipContent>Edit the template</TooltipContent>
                      </Tooltip>
                      <Tooltip openDelay={0} closeDelay={0}>
                        <TooltipTrigger>
                          <DeleteDialog
                            as={Button}
                            variant="ghost"
                            size="icon"
                            onDelete={async () => {
                              await deleteTemplateById(template.id);
                              await load();
                            }}
                          >
                            <IconFileX2 />
                            <span class="sr-only">Delete the template</span>
                          </DeleteDialog>
                        </TooltipTrigger>
                        <TooltipContent>Delete the template</TooltipContent>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                )}
              </For>
            </Match>
            <Match when={templates().length === 0}>
              <TableRow>
                <TableCell colSpan={5} class="h-80 text-center">
                  No Data
                </TableCell>
              </TableRow>
            </Match>
          </Switch>
        </TableBody>
      </Table>
    </Page>
  );
}
