import {
  Combobox,
  ComboboxContent,
  ComboboxControl,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemLabel,
  ComboboxTrigger,
} from "~/components/ui/combobox";
import { IconX, IconExternalLink } from "~/components/icons";
import { Button, buttonVariants } from "~/components/ui/button";
import { Show } from "solid-js";
import { OutputType, SupportedEngine } from "~/global.d";

interface EngineInfo {
  type: OutputType;
  label: SupportedEngine;
  description: string;
  link: string;
  disabled?: boolean;
}

export const ENGINE_OPTIONS: Record<SupportedEngine, EngineInfo> = {
  "@react-pdf/renderer@3.4.4": {
    type: OutputType.PDF,
    label: SupportedEngine["@react-pdf/renderer@3.4.4"],
    description:
      "React renderer for creating PDF files on the browser and server",
    link: "https://github.com/diegomura/react-pdf/tree/%40react-pdf/renderer%403.4.4",
  },
};

export default function EngineCombobox(props: {
  class?: string;
  outputType: OutputType;
  value?: SupportedEngine;
  readOnly?: boolean;
  disabled?: boolean;
  onChange?: (value?: SupportedEngine) => void;
}) {
  const getSelectedEngine = () =>
    props.value ? ENGINE_OPTIONS[props.value] : undefined;
  const getOptions = () =>
    Object.values(ENGINE_OPTIONS).map((option) => ({
      ...option,
      disabled: option.type !== props.outputType,
    }));
  const onInputChange = (value: string) => {
    if (value === "") props.onChange?.(undefined);
  };
  return (
    <Combobox<EngineInfo>
      value={getSelectedEngine()}
      options={getOptions()}
      onInputChange={onInputChange}
      onBlur={() => props.value}
      onChange={(value) => props.onChange?.(value?.label)}
      optionValue="label"
      optionTextValue="label"
      optionLabel="label"
      itemComponent={(props) => (
        <div class="flex items-start space-y-1">
          <ComboboxItem item={props.item} class="flex-grow">
            <ComboboxItemLabel>
              <p>{props.item.rawValue.label}</p>
              <p class="text-sm text-muted-foreground">
                {props.item.rawValue.description}
              </p>
            </ComboboxItemLabel>
          </ComboboxItem>
          <a
            class={buttonVariants({ variant: "link" })}
            href={props.item.rawValue.link}
            target="_blank"
          >
            <IconExternalLink />
          </a>
        </div>
      )}
      readOnly={props.readOnly}
      disabled={props.disabled}
    >
      <ComboboxControl aria-label="Template Engine" class={props.class}>
        {(state) => (
          <>
            <ComboboxInput
              onBlur={(event) =>
                (event.currentTarget.value = props.value ?? "")
              }
            />
            <Show when={props.value && !props.readOnly && !props.disabled}>
              <Button
                class="rounded-[50%] p-2 h-auto"
                type="button"
                variant="ghost"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => {
                  props.onChange?.(undefined);
                  state.clear();
                }}
              >
                <IconX />
              </Button>
            </Show>

            <ComboboxTrigger />
          </>
        )}
      </ComboboxControl>
      <ComboboxContent />
    </Combobox>
  );
}
