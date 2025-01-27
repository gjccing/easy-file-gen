import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { SelectBaseItemComponentProps } from "@kobalte/core/src/select/select-base.jsx";
import { OutputType } from "~/global.d";

const OUTPUT_TYPE_DESC_MAP: Record<OutputType, string> = {
  PDF: "PDF Document (.pdf)",
  //   DOCX: "Microsoft Word (.docx)",
  //   EPUB: "EPUB Publication (.epub)",
  //   TXT: "Plain Text (.txt)",
  //   RTF: "Rich Text Format (.rtf)",
};

function OutputTypeSelectItem(props: SelectBaseItemComponentProps<OutputType>) {
  return (
    <SelectItem item={props.item}>
      <p>{props.item.key}</p>
      <p class="text-sm text-muted-foreground">
        {OUTPUT_TYPE_DESC_MAP[props.item.key as OutputType]}
      </p>
    </SelectItem>
  );
}

export default function OutputTypeSelect(props: {
  class?: string;
  value?: OutputType;
  readOnly?: boolean;
  disabled?: boolean;
  onChange?: (value: OutputType) => void;
}) {
  return (
    <Select
      class={props.class}
      disallowEmptySelection
      options={Object.keys(OutputType)}
      itemComponent={OutputTypeSelectItem}
      value={props.value}
      onChange={(value) => {
        if (value) props.onChange?.(value);
      }}
      readOnly={props.readOnly}
      disabled={props.disabled}
    >
      <SelectTrigger class="w-auto">
        <SelectValue<string>>{(state) => state.selectedOption()}</SelectValue>
      </SelectTrigger>
      <SelectContent />
    </Select>
  );
}
