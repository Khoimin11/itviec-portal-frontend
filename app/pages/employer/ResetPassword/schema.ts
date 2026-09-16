import type { TFunction } from "i18next";
import { z } from "zod";

export const schema = (t: TFunction) => {
  return z
    .object({
      newPassword: z
        .string()
        .nonempty({ message: t("Can't be blank") })
        .min(12, t("Minimum 12 characters"))
        .regex(
          /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!@#$%^&*()_+~`|}{[\]\\:;?><,./-=]).{12,}$/,
          t(
            "Password must contain at least 12 characters. Combination of symbols, numbers, uppercase letters, lowercase letters."
          )
        )
        .refine(value => new TextEncoder().encode(value).length <= 72, t("Mật khẩu không được vượt quá 72 byte.")),
      confirmPassword: z
        .string()
        .nonempty({ message: t("Can't be blank") })
        .min(12, t("Minimum 12 characters")),
    })
    .superRefine(({ confirmPassword, newPassword }, ctx) => {
      if (confirmPassword !== newPassword) {
        ctx.addIssue({
          code: "custom",
          message: t("Confirm password is different from New password"),
          path: ["confirmPassword"],
        });
      }
    });
};
