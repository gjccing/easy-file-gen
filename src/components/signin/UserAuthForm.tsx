import type { SubmitHandler } from "@modular-forms/solid";
import { createForm, valiForm } from "@modular-forms/solid";
import { useNavigate } from "@solidjs/router";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "~/lib/firebase";

import {
  IconBrandGithub,
  IconBrandGoogle,
  IconLoader,
} from "~/components/icons";
import { Button } from "~/components/ui/button";
import { Grid } from "~/components/ui/grid";
import {
  TextField,
  TextFieldInput,
  TextFieldErrorMessage,
  TextFieldLabel,
} from "~/components/ui/text-field";

import { AuthSchema } from "./validations/auth";
import type { AuthForm } from "./validations/auth";

export function UserAuthForm() {
  const [authForm, { Form, Field }] = createForm<AuthForm>({
    validate: valiForm(AuthSchema),
  });

  const navigate = useNavigate();
  const handleSubmit: SubmitHandler<AuthForm> = async (values) => {
    await createUserWithEmailAndPassword(auth, values.email, values.password);
    navigate("/template");
  };

  const OAuthHandlerFactory = (providerName: string) => {
    const providerNameLC = providerName.toLowerCase();
    const provider =
      providerNameLC === "google"
        ? GoogleAuthProvider
        : providerNameLC === "github"
        ? GithubAuthProvider
        : undefined;
    return async () => {
      if (provider) {
        await signInWithPopup(auth, new provider());
        navigate("/template");
      }
    };
  };

  return (
    <div class="relative grid gap-6">
      <Form onSubmit={handleSubmit}>
        <Grid class="gap-4">
          <Field name="email">
            {(field, props) => (
              <TextField
                class="grid gap-2"
                validationState={
                  field.dirty && field.error ? "invalid" : "valid"
                }
              >
                <TextFieldLabel class="sr-only">Email</TextFieldLabel>
                <TextFieldInput
                  classList={{
                    "border-destructive": field.dirty && field.error,
                  }}
                  {...props}
                  type="email"
                  placeholder="me@email.com"
                />
                <TextFieldErrorMessage class="text-destructive">
                  {field.error}
                </TextFieldErrorMessage>
              </TextField>
            )}
          </Field>
          <Field name="password">
            {(field, props) => (
              <TextField
                class="grid gap-2"
                validationState={
                  field.dirty && field.error ? "invalid" : "valid"
                }
              >
                <TextFieldLabel class="sr-only">Email</TextFieldLabel>
                <TextFieldInput
                  classList={{
                    "border-destructive": field.dirty && field.error,
                  }}
                  {...props}
                  type="password"
                  placeholder="my*password*"
                />
                <TextFieldErrorMessage class="text-destructive">
                  {field.error}
                </TextFieldErrorMessage>
              </TextField>
            )}
          </Field>
          <Button type="submit" disabled={authForm.submitting}>
            {authForm.submitting && (
              <IconLoader class="mr-2 size-4 animate-spin" />
            )}
            Login
          </Button>
        </Grid>
      </Form>
      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <span class="w-full border-t" />
        </div>
        <div class="relative flex justify-center text-xs uppercase">
          <span class="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button
        variant="outline"
        type="button"
        disabled={authForm.submitting}
        onClick={OAuthHandlerFactory("Google")}
      >
        <IconBrandGoogle class="mr-2 size-4" /> Google
      </Button>
      <Button
        variant="outline"
        type="button"
        disabled={authForm.submitting}
        onClick={OAuthHandlerFactory("Github")}
      >
        <IconBrandGithub class="mr-2 size-4" /> Github
      </Button>
      {authForm.submitting ? (
        <div class="absolute -top-2 -bottom-2 -left-2 -right-2 backdrop-blur-sm flex justify-center items-center">
          <IconLoader class="mr-2 size-4 animate-spin" />
        </div>
      ) : null}
    </div>
  );
}
