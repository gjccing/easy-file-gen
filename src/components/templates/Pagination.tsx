import { createMemo, JSX } from "solid-js";
import {
  Pagination as _Pagination,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import { cn } from "~/lib/utils";

export function Pagination<T>(props: {
  class?: string | undefined;
  isHead?: boolean;
  isTail?: boolean;
  onClickPreviousButton: JSX.EventHandlerUnion<T, MouseEvent>;
  onClickNextButton: JSX.EventHandlerUnion<T, MouseEvent>;
}) {
  const paginationController = createMemo(() => {
    if (props.isHead && props.isTail) return { page: 1, count: 1 };
    else if (props.isHead) return { page: 1, count: 3 };
    else if (props.isTail) return { page: 3, count: 3 };
    else return { page: 2, count: 3 };
  });
  return (
    <_Pagination class={cn(props.class)} {...paginationController()}>
      <PaginationPrevious onClick={props.onClickPreviousButton} label="Newer" />
      <PaginationNext onClick={props.onClickNextButton} label="Older" />
    </_Pagination>
  );
}
