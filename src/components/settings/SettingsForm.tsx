import { createSignal, For } from "solid-js";
import {
  createForm,
  valiForm,
  setValue,
  insert,
  remove,
  getValue,
} from "@modular-forms/solid";
import { TextFieldInput } from "~/components/ui/text-field";
import FieldSet from "~/components/FieldSet";
import type { InferInput } from "valibot";
import * as v from "valibot";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { IconLoader, IconCopy, IconX } from "~/components/icons";
import { Separator } from "~/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { WebhookType } from "~/global.d";
import WebhookTypeSelect from "./WebhookTypeSelect";
import WebhookDeleteDialog from "./WebhookDeleteDialog";
import jwtSign from "jwt-encode";

function genRandAlphanumericStr(length: number): string {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    result += charset[randomIndex];
  }
  return result;
}

const SettingsSchema = v.object({
  apiToken: v.object({
    token: v.pipe(
      v.string(),
      v.nonEmpty(
        "Please generate or give an API token to protect your resource."
      ),
      v.regex(
        /^[A-Za-z0-9]+$/,
        "Please only enter an alphanumeric string which only includes A-B, a-b, 0-9."
      ),
      v.minLength(50, "The token is too short. Please over 50"),
      v.maxLength(150, "The token is too long.")
    ),
    expiresAt: v.union([
      v.pipe(v.string(), v.isoDateTime("The date is badly formatted.")),
      v.literal(""),
    ]),
  }),
  accessControlAllowOrigin: v.undefinedable(
    v.array(
      v.pipe(
        v.string(),
        v.nonEmpty("Please enter an allowed origin"),
        v.regex(
          /^(https):\/\/(www\.)?[-a-zA-Z0-9@%._\+~#=]{2,256}(:\d+)?$/,
          "Please enter a formatted origin, such as https://example.com"
        )
      )
    )
  ),
  webhooks: v.undefinedable(
    v.pipe(
      v.array(
        v.object({
          type: v.enum(WebhookType, "Invalid output file type"),
          url: v.pipe(
            v.string(),
            v.nonEmpty("Please enter an URL"),
            v.regex(
              /^(https):\/\/(www\.)?[-a-zA-Z0-9@%._\+~#=]{2,256}(:\d+)?(\/[-a-zA-Z0-9@%_\+.~#?&//=]*)?$/,
              "Please enter a formatted url, such as http://example.com/path"
            )
          ),
          retryLimit: v.pipe(v.number(), v.minValue(1), v.maxValue(5)),
        })
      ),
      v.maxLength(3)
    )
  ),
});

export type SettingsFormValues = InferInput<typeof SettingsSchema>;

export default function SettingsForm(props: {
  class?: string | undefined;
  defaultValue?: SettingsFormValues;
  onSubmit: (value: SettingsFormValues) => void;
  uid: string;
}) {
  const [settingsForm, { Form, Field, FieldArray }] =
    createForm<SettingsFormValues>({
      validate: valiForm(SettingsSchema),
      initialValues: props.defaultValue ?? {
        accessControlAllowOrigin: [],
        webhooks: [],
      },
    });
  const apiToken = () => {
    let payload: Partial<{ userId: string; expiresAt: number }> = {
      userId: props.uid,
    };
    const expiresAt = getValue(settingsForm, "apiToken.expiresAt");
    if (expiresAt) payload.expiresAt = new Date(expiresAt).getTime();
    const token = getValue(settingsForm, "apiToken.token") ?? "";
    return `Bearer ${token ? jwtSign(payload, token) : ""}`;
  };
  return (
    <Form class={cn("grid gap-6", props.class)} onSubmit={props.onSubmit}>
      <Field name="apiToken.token" type="string">
        {(field, props) => (
          <FieldSet
            label="Token"
            description="Required. Please enter an alphanumeric string which only includes A-B, a-b, 0-9. The token is required to call the generating file API to prevent your template from being abused. Please keep the token between 50 and 150 characters."
            invalid={Boolean(field.active && field.error)}
            error={field.active ? field.error : undefined}
          >
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
                    settingsForm,
                    field.name,
                    genRandAlphanumericStr(100)
                  )
                }
              >
                Generate Token
              </Button>
            </div>
          </FieldSet>
        )}
      </Field>
      <Field name="apiToken.expiresAt" type="string">
        {(field, props) => (
          <FieldSet
            label="Expires At"
            description="If you don't want the token to expire, leave it blank."
            invalid={Boolean(field.active && field.error)}
            error={field.active ? field.error : undefined}
          >
            <TextFieldInput
              {...props}
              value={field.value}
              class="w-auto"
              type="datetime-local"
            />
          </FieldSet>
        )}
      </Field>
      <FieldSet
        label="Authorization"
        description="Please carry this header and its value with your file-generating request"
      >
        <div class="flex space-x-2">
          <TextFieldInput
            class="w-full"
            type="text"
            disabled
            value={apiToken()}
          />
          <Tooltip>
            <TooltipTrigger
              class="shrink-0"
              as={Button<"button">}
              variant="secondary"
              onClick={() => navigator.clipboard.writeText(apiToken() ?? "")}
            >
              <IconCopy />
            </TooltipTrigger>
            <TooltipContent>
              <p>Copied!</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </FieldSet>
      <Separator />
      <h3>Access-Control-Allow-Origin</h3>
      <p>
        Please enter a formatted origin that only includes protocol and domain
        without path, ex: https://example.com
      </p>
      <FieldArray name="accessControlAllowOrigin">
        {(fieldArray) => (
          <div class="flex flex-col gap-2 md:w-[50%]">
            <For each={fieldArray.items}>
              {(_, index) => (
                <Field name={`accessControlAllowOrigin.${index()}`}>
                  {(field, props) => (
                    <FieldSet
                      invalid={Boolean(field.active && field.error)}
                      error={field.active ? field.error : undefined}
                    >
                      <div class="flex gap-2 justify-between">
                        <TextFieldInput
                          {...props}
                          value={field.value}
                          type="text"
                          class="flex-auto"
                        />
                        <Button
                          variant="ghost"
                          class="text-destructive hover:text-destructive/90"
                          onClick={() =>
                            remove(settingsForm, "accessControlAllowOrigin", {
                              at: index(),
                            })
                          }
                        >
                          <IconX />
                        </Button>
                      </div>
                    </FieldSet>
                  )}
                </Field>
              )}
            </For>
            <Button
              variant="outline"
              onClick={() =>
                insert(settingsForm, "accessControlAllowOrigin", { value: "" })
              }
            >
              +
            </Button>
          </div>
        )}
      </FieldArray>
      <Separator />
      <h3>Webhooks</h3>
      <p>
        Please enter a formatted url that includes protocol, domain and
        path(optional), ex: https://example.com/path"
      </p>
      <FieldArray name="webhooks">
        {(fieldArray) => (
          <div class="flex flex-col gap-2 md:w-[50%]">
            <For each={fieldArray.items}>
              {(_, index) => (
                <div class="space-y-2">
                  <Field name={`webhooks.${index()}.type`}>
                    {(field) => (
                      <FieldSet
                        label="Type"
                        invalid={Boolean(field.active && field.error)}
                        error={field.active ? field.error : undefined}
                      >
                        <div class="flex justify-between">
                          <WebhookTypeSelect
                            value={field.value}
                            onChange={(value) =>
                              setValue(settingsForm, field.name, value)
                            }
                          />
                          <WebhookDeleteDialog
                            as={Button<"button">}
                            variant="destructive"
                            onDelete={() =>
                              remove(settingsForm, "webhooks", { at: index() })
                            }
                          >
                            Delete
                          </WebhookDeleteDialog>
                        </div>
                      </FieldSet>
                    )}
                  </Field>
                  <Field name={`webhooks.${index()}.url`}>
                    {(field, props) => (
                      <FieldSet
                        label="URL"
                        invalid={Boolean(field.active && field.error)}
                        error={field.active ? field.error : undefined}
                      >
                        <TextFieldInput
                          {...props}
                          value={field.value}
                          type="text"
                          class="flex-auto"
                        />
                      </FieldSet>
                    )}
                  </Field>
                  <Field name={`webhooks.${index()}.retryLimit`} type="number">
                    {(field, props) => (
                      <FieldSet
                        label="Retry Times"
                        invalid={Boolean(field.active && field.error)}
                        error={field.active ? field.error : undefined}
                      >
                        <TextFieldInput
                          {...props}
                          value={field.value}
                          type="number"
                          class="flex-auto"
                          max="5"
                          min="1"
                        />
                      </FieldSet>
                    )}
                  </Field>
                  <Separator />
                </div>
              )}
            </For>
            <Button
              variant="outline"
              onClick={() =>
                insert(settingsForm, "webhooks", {
                  value: {
                    type: WebhookType.FINISHED,
                    url: "",
                    retryLimit: 1,
                  },
                })
              }
            >
              +
            </Button>
          </div>
        )}
      </FieldArray>
      <div>
        <Button type="submit" disabled={settingsForm.submitting}>
          {settingsForm.submitting && (
            <IconLoader class="mr-2 size-4 animate-spin" />
          )}
          Submit
        </Button>
      </div>
    </Form>
  );
}
