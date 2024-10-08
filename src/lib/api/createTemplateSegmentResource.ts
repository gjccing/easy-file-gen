import { createSignal } from "solid-js";
import { showToast } from "~/components/ui/toast";
import {
  getTemplateDocsEndBeforeCreateAt,
  getTemplateDocsFirstPage,
  getTemplateDocsStartAfterCreateAt,
} from "~/lib/api/templates";

export const PER_SEGMENT = 10;
export type SegmentRef = [
  Model.Template["createdAt"] | undefined,
  "after" | "before"
];
type SegmentScope = [
  Model.Template["createdAt"] | undefined,
  Model.Template["createdAt"] | undefined
];

export function createTemplateSegmentResource(props: {
  initialSegmentRef: SegmentRef | undefined;
}) {
  const [segmentRef, setSegmentRef] = createSignal<SegmentRef>(
    props.initialSegmentRef ?? [, "after"]
  );
  const [segment, setSegment] = createSignal<Model.Template[]>([]);
  const [isLoading, setIsLoading] = createSignal<boolean>(false);
  const [segmentScope, setSegmentScope] = createSignal<SegmentScope>([
    undefined,
    undefined,
  ]);

  const load = async (ref: SegmentRef, forceUpdate?: boolean) => {
    setIsLoading(true);
    try {
      const result = await (ref[0]
        ? ref[1] === "after"
          ? getTemplateDocsStartAfterCreateAt(ref[0], PER_SEGMENT)
          : getTemplateDocsEndBeforeCreateAt(ref[0], PER_SEGMENT)
        : getTemplateDocsFirstPage(PER_SEGMENT));
      if (!ref[0]) setSegmentScope((pre) => [result.at(0)?.createdAt, pre[1]]);
      if (result.length < PER_SEGMENT) {
        setSegmentScope((pre) =>
          ref[1] === "after"
            ? [pre[0], result.at(-1)?.createdAt ?? ref[0]]
            : [result.at(0)?.createdAt ?? ref[0], pre[1]]
        );
      }

      if (result.length > 0 || forceUpdate) {
        setSegment(result);
        setSegmentRef(ref);
      }
      if (result.length === 0)
        showToast({ title: "No more data found.", variant: "warning" });
    } catch (e) {
      showToast({
        title: "Something went wrong. Please contact us for assistance.",
        variant: "error",
      });
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    ref: segmentRef,
    segment,
    load,
    async reload() {
      await load(segmentRef());
    },
    async loadNext() {
      const currentVal = segment();
      await load([currentVal.at(-1)?.createdAt, "after"]);
    },
    async loadPrev() {
      const currentVal = segment();
      await load([currentVal.at(0)?.createdAt, "before"]);
    },
    isLoading,
    isHead: () =>
      segmentScope()[0]?.valueOf() == segment().at(0)?.createdAt?.valueOf(),
    isTail: () =>
      segmentScope()[1]?.valueOf() == segment().at(-1)?.createdAt?.valueOf(),
  };
}
