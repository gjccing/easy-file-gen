import type { InferInput } from "@valibot/valibot";
import {
  email,
  object,
  pipe,
  string,
  nonEmpty,
  minLength,
  maxLength,
  regex,
} from "@valibot/valibot";

export const AuthSchema = object({
  email: pipe(
    string(),
    nonEmpty("Please enter your email."),
    email("The email is badly formatted.")
  ),
  password: pipe(
    string(),
    minLength(8, "Your password is too short."),
    maxLength(30, "Your password is too long."),
    regex(/[a-z]/, "Your password must contain a lowercase letter."),
    regex(/[A-Z]/, "Your password must contain a uppercase letter."),
    regex(/[0-9]/, "Your password must contain a number.")
  ),
});
export type AuthForm = InferInput<typeof AuthSchema>;
