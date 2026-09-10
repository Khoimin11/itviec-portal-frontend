import type { TFunction } from "i18next";
import { z } from "zod";

export const schema = (t: TFunction) =>
  z.object({
    username: z.string().trim()
      .min(1, t("Can't be blank"))
      .max(255, t("Registration.nameTooLong")),
    email: z.string().trim().toLowerCase()
      .min(1, t("Can't be blank"))
      .email(t("Please check your email"))
      .max(255, t("Registration.emailTooLong")),
    password: z.string()
      .min(12, t("Password Verify.At least 12 characters"))
      .regex(/[^a-zA-Z0-9\s]/u, t("Password Verify.At least 1 symbol (! @ # $ ...)"))
      .regex(/[0-9]/, t("Password Verify.At least 1 number"))
      .regex(/[A-Z]/, t("Password Verify.At least 1 UPPERCASE letter"))
      .regex(/[a-z]/, t("Password Verify.At least 1 lowercase letter"))
      .refine((value) => new TextEncoder().encode(value).length <= 72, t("Registration.passwordTooLong")),
    termsAccepted: z.boolean().refine(Boolean, t("Registration.termsRequired")),
  });
