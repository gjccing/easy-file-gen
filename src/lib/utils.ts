import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import jwtSign from "jwt-encode";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const firestoreAutoId = (): string => {
  const CHARS =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let autoId = "";

  for (let i = 0; i < 20; i++) {
    autoId += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return autoId;
};

export const makeAPIToken = (
  userId: string = "",
  token: string = "",
  expiresAt?: string | Date
) => {
  let payload: Partial<{ userId: string; expiresAt: number }> = { userId };
  if (expiresAt instanceof Date) payload.expiresAt = expiresAt.getTime();
  else if (typeof expiresAt === "string")
    payload.expiresAt = new Date(expiresAt).getTime();
  return `Bearer ${token ? jwtSign(payload, token) : ""}`;
};
