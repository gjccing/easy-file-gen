import type { SubmitHandler } from "@modular-forms/solid";
import {
  createForm,
  valiForm,
  setValue,
  getValue,
  reset,
} from "@modular-forms/solid";
import { TextFieldInput, TextFieldTextArea } from "~/components/ui/text-field";
import type { InferInput } from "valibot";
import * as v from "valibot";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { IconLoader } from "~/components/icons";
import { Switch, SwitchControl, SwitchThumb } from "~/components/ui/switch";
import FieldSet from "~/components/FieldSet";
import OutputTypeSelect from "~/components/OutputTypeSelect";
import { OutputType, SupportedEngine } from "~/global.d";
import { Separator } from "~/components/ui/separator";
import EngineCombobox from "~/components/EngineCombobox";
import { Show } from "solid-js";
import { clientOnly } from "@solidjs/start";
const MonacoEditor = clientOnly(
  () => import("~/components/templates/monaco/Editor")
);

const TemplateSchema = v.object({
  enabled: v.boolean(),
  name: v.pipe(
    v.string(),
    v.maxLength(50, "The name is too long."),
    v.nonEmpty("Please give a name to this template.")
  ),
  description: v.pipe(
    v.string(),
    v.maxLength(500, "The description is too long.")
  ),
  outputType: v.enum(OutputType, "Invalid output file type"),
  engine: v.enum(SupportedEngine, "Please pick a engine from the menu."),
});

export type TemplateFormValues = InferInput<typeof TemplateSchema>;

export function TemplatePreviewReadOnlyForm(props: {
  class?: string | undefined;
  defaultValue?: TemplateFormValues;
}) {
  const [templateForm, { Form, Field }] = createForm<TemplateFormValues>({
    validate: valiForm(TemplateSchema),
    initialValues: props.defaultValue ?? {
      enabled: true,
      outputType: OutputType.PDF,
    },
  });

  return (
    <Form class={cn("grid gap-6", props.class)} onSubmit={() => {}}>
      <Field name="enabled" type="boolean">
        {(field) => (
          <FieldSet
            label="Enable"
            invalid={Boolean(field.active && field.error)}
            error={field.error}
          >
            <Switch
              checked={field.value}
              onChange={(value) => setValue(templateForm, field.name, value)}
              disabled
            >
              <SwitchControl>
                <SwitchThumb />
              </SwitchControl>
            </Switch>
          </FieldSet>
        )}
      </Field>
      <Field name="name" type="string">
        {(field, props) => (
          <FieldSet
            label="Name"
            description="Required. Please keep the name within 50 characters."
            invalid={Boolean(field.active && field.error)}
            error={field.error}
          >
            <TextFieldInput
              {...props}
              value={field.value}
              class="md:w-[50%]"
              maxlength="50"
              type="text"
              disabled
            />
          </FieldSet>
        )}
      </Field>
      <Field name="description" type="string">
        {(field, props) => (
          <FieldSet
            label="Description"
            description="Please keep the description within 500 characters."
            invalid={Boolean(field.active && field.error)}
            error={field.error}
          >
            <TextFieldTextArea
              {...props}
              value={field.value}
              maxlength="500"
              autoResize
              disabled
            />
          </FieldSet>
        )}
      </Field>
      <Field name="outputType" type="string">
        {(field) => (
          <FieldSet
            label="Output Type"
            invalid={Boolean(field.active && field.error)}
            error={field.error}
          >
            <OutputTypeSelect
              value={field.value}
              disabled
              onChange={(value) => setValue(templateForm, field.name, value)}
            />
          </FieldSet>
        )}
      </Field>
      <Field name="engine" type="string">
        {(field) => (
          <FieldSet
            label="Engine"
            invalid={Boolean(field.active && field.error)}
            error={field.error}
          >
            <Show
              when={getValue(templateForm, "outputType")}
              fallback={<IconLoader class="mr-2 size-8 animate-spin" />}
            >
              {(val) => (
                <EngineCombobox
                  class="md:w-[50%]"
                  outputType={val()}
                  value={field.value}
                  onChange={(value) => {
                    if (value) setValue(templateForm, field.name, value);
                    else reset(templateForm, field.name);
                  }}
                  disabled
                />
              )}
            </Show>
          </FieldSet>
        )}
      </Field>
    </Form>
  );
}
