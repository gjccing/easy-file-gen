import { cn } from "~/lib/utils";
import {
  Combobox,
  ComboboxContent,
  ComboboxControl,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemLabel,
  ComboboxSection,
  ComboboxTrigger,
} from "~/components/ui/combobox";
import {
  TextFieldInput,
  TextFieldDescription,
} from "~/components/ui/text-field";
import { IconX, IconTag } from "~/components/icons";
import { Button } from "~/components/ui/button";
import { For, Show } from "solid-js";
import { Badge } from "~/components/ui/badge";

export default function TagsCombobox(props: {
  class?: string;
  maxTagLength?: number;
  maxTags?: number;
  value?: string[];
  onChange?: (value: string[] | undefined) => void;
}) {
  return (
    <>
      <TextFieldInput
        class={cn(props.class)}
        maxLength={props.maxTagLength}
        type="text"
        placeholder="Enter your custom tag"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (!props.value?.includes(e.currentTarget.value))
              props.onChange?.(
                (props.value ?? []).concat(e.currentTarget.value)
              );
            e.currentTarget.value = "";
          }
        }}
        disabled={(props.value?.length ?? 0) >= (props.maxTags ?? Infinity)}
      />
      <Show when={props.value?.length}>
        <TextFieldDescription>Click tags to delete them</TextFieldDescription>
      </Show>
      <div class="flex flex-wrap gap-2">
        <For each={props.value ?? []}>
          {(tag) => (
            <Badge
              class="gap-1 select-none cursor-pointer"
              variant="outline"
              round
              onClick={() => {
                props.onChange?.(props.value?.filter((item) => item !== tag));
              }}
            >
              <IconTag /> <span>{tag}</span>
            </Badge>
          )}
        </For>
      </div>
    </>
  );
}
