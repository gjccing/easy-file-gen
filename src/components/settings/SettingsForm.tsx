import { createSignal, Show } from "solid-js";
import type { SubmitHandler } from "@modular-forms/solid";
import { createForm, valiForm, setValue } from "@modular-forms/solid";
import {
  TextFieldLabel,
  TextField,
  TextFieldInput,
  TextFieldTextArea,
  TextFieldErrorMessage,
  TextFieldDescription,
} from "~/components/ui/text-field";
import type { InferInput } from "@valibot/valibot";
import * as v from "@valibot/valibot";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { IconLoader, IconCopy, IconTrash } from "~/components/icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Switch, SwitchControl, SwitchThumb } from "~/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

const OUTPUT_TYPE_MAP: Record<string, string> = {
  PDF: "PDF Document (.pdf)",
  DOCX: "Microsoft Word (.docx)",
  EPUB: "EPUB Publication (.epub)",
  TXT: "Plain Text (.txt)",
  RTF: "Rich Text Format (.rtf)",
};

const TemplateSchema = v.object({
  apiToken: v.object({
    token: v.pipe(
      v.string(),
      v.minLength(50, "The token is too short."),
      v.maxLength(150, "The token is too long."),
      v.base64("Please enter a Base64 string."),
      v.nonEmpty(
        "Please generate or give an API token to protect your resource."
      )
    ),
    expiresAt: v.union([
      v.pipe(v.string(), v.isoDateTime("The date is badly formatted.")),
      v.literal(""),
    ]),
  }),
  accessControlAllowOrigin: v.array(
    v.object({
      origin: v.pipe(
        v.string(),
        v.regex(
          /^[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}$/,
          "Please enter a formatted origin, such as https://example.com"
        )
      ),
      enabled: v.boolean(),
    })
  ),
  webhooks: v.array(
    v.object({
      type: v.picklist(["finished", "error"]),
      targetUrl: v.pipe(
        v.string(),
        v.regex(
          /^[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/,
          "Please enter a formatted url, such as http://example.com/path"
        )
      ),
      headers: v.record(v.string(), v.string()),
      retryLimit: v.number(),
      enabled: v.boolean(),
    })
  ),
});

type SettingsFormValues = InferInput<typeof TemplateSchema>;

function generateRandomVisibleString(length: number): string {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    result += charset[randomIndex];
  }
  return result;
}

export function SettingsForm(props: {
  class?: string | undefined;
  defaultValue?: Model.Template;
  onSubmit: SubmitHandler<SettingsFormValues>;
}) {
  const [templateForm, { Form, Field, FieldArray }] =
    createForm<SettingsFormValues>({
      validate: valiForm(TemplateSchema),
      initialValues: {
        accessControlAllowOrigin: [],
      },
    });

  const [showCopiedTooltip, setOpenopiedTooltip] = createSignal(false);

  return (
    <Form class={cn("grid gap-6", props.class)} onSubmit={props.onSubmit}>
      <Field name="enabled" type="boolean">
        {(field) => (
          <TextField
            class="space-y-2 md:space-y-0 md:space-x-2 md:flex md:items-center"
            validationState={field.active && field.error ? "invalid" : "valid"}
          >
            <TextFieldLabel class="md:shrink-0 md:w-32">Enable</TextFieldLabel>
            <Switch
              checked={field.value}
              onChange={(value) => setValue(templateForm, field.name, value)}
            >
              <SwitchControl>
                <SwitchThumb />
              </SwitchControl>
            </Switch>
          </TextField>
        )}
      </Field>
      <Field name="outputType" type="string">
        {(field) => (
          <TextField
            class="space-y-2 md:space-y-0 md:space-x-2 md:flex md:items-center"
            validationState={field.active && field.error ? "invalid" : "valid"}
          >
            <TextFieldLabel class="md:shrink-0 md:w-32">
              Output Type
            </TextFieldLabel>
            <div class="md:flex-grow md:space-y-2">
              <Select
                disallowEmptySelection
                options={Object.keys(OUTPUT_TYPE_MAP)}
                itemComponent={(props) => (
                  <SelectItem item={props.item}>
                    <p>{props.item.key}</p>
                    <p class="text-sm text-muted-foreground">
                      {OUTPUT_TYPE_MAP[props.item.key]}
                    </p>
                  </SelectItem>
                )}
                value={field.value}
                onChange={(value) => setValue(templateForm, field.name, value)}
              >
                <SelectTrigger class="w-auto">
                  <SelectValue<string>>
                    {(state) => state.selectedOption()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent />
              </Select>
              <TextFieldErrorMessage class="text-destructive">
                {field.error}
              </TextFieldErrorMessage>
            </div>
          </TextField>
        )}
      </Field>
      <Field name="name" type="string">
        {(field, props) => (
          <TextField
            class="space-y-2 md:space-y-0 md:space-x-2 md:flex md:items-center"
            validationState={field.active && field.error ? "invalid" : "valid"}
          >
            <TextFieldLabel class="md:shrink-0 md:w-32">Name</TextFieldLabel>
            <div class="md:flex-grow md:space-y-2">
              <TextFieldInput
                {...props}
                class="w-[50%]"
                maxlength="100"
                type="text"
              />
              <Show when={!(field.active && field.error)}>
                <TextFieldDescription>
                  Required. Please keep the name within 100 characters.
                </TextFieldDescription>
              </Show>
              <TextFieldErrorMessage class="text-destructive">
                {field.error}
              </TextFieldErrorMessage>
            </div>
          </TextField>
        )}
      </Field>
      <Field name="description" type="string">
        {(field, props) => (
          <TextField
            class="space-y-2 md:space-y-0 md:space-x-2 md:flex md:items-center"
            validationState={field.active && field.error ? "invalid" : "valid"}
          >
            <TextFieldLabel class="md:shrink-0 md:w-32">
              Description
            </TextFieldLabel>
            <div class="md:flex-grow md:space-y-2">
              <TextFieldTextArea {...props} maxlength="500" autoResize />
              <Show when={!(field.active && field.error)}>
                <TextFieldDescription>
                  Please keep the description within 500 characters.
                </TextFieldDescription>
              </Show>
              <TextFieldErrorMessage class="text-destructive">
                {field.error}
              </TextFieldErrorMessage>
            </div>
          </TextField>
        )}
      </Field>
      <Separator />
      <h3>API Token</h3>
      <p class="text-sm"></p>
      <Field name="apiToken.token" type="string">
        {(field, props) => (
          <TextField
            class="space-y-2 md:space-y-0 md:space-x-2 md:flex md:items-center"
            validationState={field.active && field.error ? "invalid" : "valid"}
          >
            <TextFieldLabel class="md:shrink-0 md:w-32">Token</TextFieldLabel>
            <div class="md:flex-grow md:space-y-2">
              <div class="flex space-x-2">
                <TextFieldInput
                  {...props}
                  value={field.value}
                  minLength="50"
                  maxlength="150"
                  type="text"
                  class="flex-auto"
                />
                <Button
                  class="shrink-0"
                  onClick={() =>
                    setValue(
                      templateForm,
                      field.name,
                      btoa(generateRandomVisibleString(100))
                    )
                  }
                >
                  Generate Token
                </Button>
                <Tooltip open={showCopiedTooltip()}>
                  <TooltipTrigger
                    class="shrink-0"
                    as={Button<"button">}
                    variant="secondary"
                    onMouseLeave={() => setOpenopiedTooltip(false)}
                    onClick={() => {
                      navigator.clipboard.writeText(field.value ?? "");
                      setOpenopiedTooltip(true);
                    }}
                  >
                    <IconCopy />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copied!</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Show when={!(field.active && field.error)}>
                <TextFieldDescription>
                  Required. Please enter a Base64 string which only includes
                  A-B, a-b, 0-9, +, /, =. The token is required to call the
                  generating file API to prevent your template from being
                  abused. Please keep the token between 50 and 150 characters.
                </TextFieldDescription>
              </Show>
              <TextFieldErrorMessage class="text-destructive">
                {field.error}
              </TextFieldErrorMessage>
            </div>
          </TextField>
        )}
      </Field>
      <Field name="apiToken.expiresAt" type="string">
        {(field, props) => {
          let inputEl: HTMLInputElement | undefined;
          return (
            <TextField
              class="space-y-2 md:space-y-0 md:space-x-2 md:flex md:items-center"
              validationState={
                field.active && field.error ? "invalid" : "valid"
              }
            >
              <TextFieldLabel class="md:shrink-0 md:w-32">
                Expires At
              </TextFieldLabel>
              <div class="md:flex-grow md:space-y-2">
                <div class="flex space-x-2">
                  <TextFieldInput
                    {...props}
                    class="w-auto"
                    type="datetime-local"
                  />
                </div>
                <Show when={!(field.active && field.error)}>
                  <TextFieldDescription>
                    If you don't want the token to expire, leave it blank
                  </TextFieldDescription>
                </Show>
                <TextFieldErrorMessage class="text-destructive">
                  {field.error}
                </TextFieldErrorMessage>
              </div>
            </TextField>
          );
        }}
      </Field>
      <Separator />

      <Separator />
      <h3>Access-Control-Allow-Origin</h3>
      <FieldArray name="accessControlAllowOrigin">
        {(fieldArray) => (
          <TextField class="space-y-2 md:space-y-0 md:space-x-2 md:flex md:items-center">
            <div class="md:flex-grow md:space-y-2">
              {/* <TextFieldInput
                {...props}
                class="w-[50%]"
                maxlength="100"
                type="text"
              />
              <Show when={!(field.active && field.error)}>
                <TextFieldDescription>
                  Required. Please keep the name within 100 characters.
                </TextFieldDescription>
              </Show>
              <TextFieldErrorMessage class="text-destructive">
                {field.error}
              </TextFieldErrorMessage> */}
            </div>
          </TextField>
        )}
      </FieldArray>
      <div>
        <Button type="submit" disabled={templateForm.submitting}>
          {templateForm.submitting && (
            <IconLoader class="mr-2 size-4 animate-spin" />
          )}
          Submit
        </Button>
      </div>
    </Form>
  );
}
