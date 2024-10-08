import { cn } from "~/lib/utils";
import {
  TextFieldLabel,
  TextField,
  TextFieldErrorMessage,
  TextFieldDescription,
} from "~/components/ui/text-field";
import { JSXElement, Show } from "solid-js";

export default function FieldSet(props: {
  class?: string;
  label?: string;
  description?: string;
  invalid?: boolean;
  error?: string;
  children: JSXElement;
  ref?: HTMLElement | ((e: HTMLElement) => void);
}) {
  return (
    <TextField
      class={cn(
        "space-y-2 md:space-y-0 md:space-x-2 md:flex md:items-center",
        props.class
      )}
      validationState={props.invalid ? "invalid" : "valid"}
      ref={props.ref}
    >
      <Show when={!!props.label}>
        <TextFieldLabel class="md:shrink-0 md:w-24 md:self-start md:leading-[42px]">
          {props.label}
        </TextFieldLabel>
      </Show>
      <div class="md:flex-grow space-y-2">
        {props.children}
        <Show when={!!props.description}>
          <TextFieldDescription>{props.description}</TextFieldDescription>
        </Show>
        <TextFieldErrorMessage class="text-destructive">
          {props.error}
        </TextFieldErrorMessage>
      </div>
    </TextField>
  );
}
