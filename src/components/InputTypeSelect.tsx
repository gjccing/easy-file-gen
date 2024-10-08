import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export enum InputType {
  JSON = "JSON",
}

export default function InputTypeSelect(props: {
  class?: string;
  value?: InputType;
  onChange?: (value: InputType) => void;
}) {
  return (
    <Select
      class={props.class}
      disallowEmptySelection
      options={Object.keys(InputType)}
      itemComponent={(props) => (
        <SelectItem item={props.item}>{props.item.rawValue}</SelectItem>
      )}
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
