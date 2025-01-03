import { onMount, Switch, Match, For, Show, createEffect } from "solid-js";
import { A, useNavigate } from "@solidjs/router";
import { deleteTemplateById } from "~/lib/api/templates";
import DashboardLayout from "~/components/layout/DashboardLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  IconLoader,
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
import { Pagination } from "~/components/templates/Pagination";
import { DeleteDialog } from "~/components/templates/DeleteDialog";
import {
  createTemplateSegmentResource,
  SegmentRef,
} from "~/lib/api/createTemplateSegmentResource";
import { cn } from "~/lib/utils";
import { useSearchParams } from "@solidjs/router";
import { Timestamp } from "firebase/firestore";

export default function Templates() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams<{
    segmentRef: string;
  }>();
  let initialRef: SegmentRef | undefined;
  if (searchParams.segmentRef) {
    const temp = JSON.parse(decodeURI(searchParams.segmentRef));
    initialRef = [
      temp[0] ? new Timestamp(temp[0].seconds, temp[0].nanoseconds) : undefined,
      temp[1],
    ];
  }
  const {
    ref,
    segment,
    load,
    reload,
    loadNext,
    loadPrev,
    isLoading,
    isHead,
    isTail,
  } = createTemplateSegmentResource({ initialSegmentRef: initialRef });
  onMount(async () => {
    await reload();
    if (ref()[0] && segment().length === 0) await load([, "after"]);
  });
  createEffect(() => {
    const currentRef = ref();
    setSearchParams({ segmentRef: encodeURI(JSON.stringify(currentRef)) });
  });
  return (
    <DashboardLayout title="Templates">
      <div class="flex items-center justify-between space-y-2">
        <h1 class="text-3xl font-bold tracking-tight">Templates</h1>
      </div>
      <div class="flex flex-col gap-4 relative">
        <div class="flex items-center gap-4">
          <A class={`${buttonVariants({})} ml-auto`} href="/templates/new">
            <IconFilePlus2 />
          </A>
        </div>
        <Table class="w-[100%]">
          <TableHeader class="w-[100%]">
            <TableRow class="w-[100%]">
              <TableHead class="w-[80px] text-gray-600">
                <span class="sr-only">Output Type</span>
              </TableHead>
              <TableHead class="w-[200px]">Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead class="w-[150px] text-right">Usage</TableHead>
              <TableHead class="w-[180px] text-right">
                <span class="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody class="w-[100%]">
            <Switch>
              <Match when={segment().length > 0}>
                <For each={segment()}>
                  {(template) => (
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
                      <TableCell class="max-w-0">
                        <pre class=" size-[100%] overflow-hidden text-ellipsis">
                          {template.description}
                        </pre>
                      </TableCell>
                      <TableCell
                        class={cn(
                          "text-right ",
                          { "text-gray-400": !template.enabled },
                          "w-[150px]"
                        )}
                      >
                        {template.callingCount?.toLocaleString()}
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
                                if (segment().length === 1) await loadPrev();
                                else await reload();
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
              <Match when={segment().length === 0}>
                <TableRow>
                  <TableCell colSpan={5} class="h-80 text-center">
                    No Data
                  </TableCell>
                </TableRow>
              </Match>
            </Switch>
          </TableBody>
        </Table>
        <Pagination
          class="flex justify-end"
          isHead={isHead()}
          isTail={isTail()}
          onClickPreviousButton={loadPrev}
          onClickNextButton={loadNext}
        />
        <Show when={isLoading()}>
          <div class=" absolute top-0 left-0 size-full flex justify-center items-center bg-white bg-opacity-80">
            <IconLoader class="mr-2 size-8 animate-spin" />
          </div>
        </Show>
      </div>
    </DashboardLayout>
  );
}
