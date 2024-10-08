import type { SubmitHandler } from "@modular-forms/solid";
import { createForm, valiForm } from "@modular-forms/solid";
import { TextField, TextFieldInput } from "~/components/ui/text-field";
import type { InferInput } from "valibot";
import { object, pipe, string, nonEmpty } from "valibot";
import { cn } from "~/lib/utils";

const SearchSchema = object({
  search: pipe(string(), nonEmpty("Please enter your keywords.")),
});
type SearchForm = InferInput<typeof SearchSchema>;

export function SearchBar(props: {
  class?: string | undefined;
  placeholder: string;
  onSearch: SubmitHandler<SearchForm>;
}) {
  const [, { Form, Field }] = createForm<SearchForm>({
    validate: valiForm(SearchSchema),
  });
  return (
    <Form class={cn(props.class)} onSubmit={props.onSearch}>
      <Field name="search">
        {(_, _props) => (
          <TextField class="flex-auto">
            <TextFieldInput
              type="search"
              placeholder={props.placeholder}
              {..._props}
            />
          </TextField>
        )}
      </Field>
    </Form>
  );
}
