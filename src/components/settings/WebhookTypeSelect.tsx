import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { SelectBaseItemComponentProps } from "@kobalte/core/src/select/select-base.jsx";
import { WebhookType } from "~/global.d";

const WEB_HOOK_TYPE_DESC_MAP: Record<WebhookType, string> = {
  [WebhookType.FINISHED]: "Trigger after a file generation finished.",
  [WebhookType.ERROR]: "Trigger after error happened.",
};

function WebhookTypeSelectItem(
  props: SelectBaseItemComponentProps<WebhookType>
) {
  return (
    <SelectItem item={props.item}>
      <p>{props.item.key}</p>
      <p class="text-sm text-muted-foreground">
        {WEB_HOOK_TYPE_DESC_MAP[props.item.key as WebhookType]}
      </p>
    </SelectItem>
  );
}

export default function WebhookTypeSelect(props: {
  class?: string;
  value?: WebhookType;
  onChange?: (value: WebhookType) => void;
}) {
  return (
    <Select
      class={props.class}
      disallowEmptySelection
      options={Object.keys(WebhookType)}
      itemComponent={WebhookTypeSelectItem}
      value={props.value}
      onChange={(value) => {
        if (value) props.onChange?.(value);
      }}
    >
      <SelectTrigger class="w-auto">
        <SelectValue<string>>{(state) => state.selectedOption()}</SelectValue>
      </SelectTrigger>
      <SelectContent />
    </Select>
  );
}
