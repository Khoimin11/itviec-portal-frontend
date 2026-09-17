import type { TFunction } from "i18next";
import { z } from "zod";
import type { CVSelectionStatus } from ".";

const MAX_FILE_SIZE = 3 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const cvSchema = (t: TFunction<["apply"], undefined>) =>
  z.custom<File>((file) => typeof File !== "undefined" && file instanceof File, {
    message: t("This field is required."),
  }).superRefine((file, ctx) => {
    if (!(typeof File !== "undefined" && file instanceof File)) return;
    if (!/\.(doc|docx|pdf)$/i.test(file.name) || (file.type && !ACCEPTED_FILE_TYPES.includes(file.type))) {
      ctx.addIssue({ code: "custom", message: t("Oops! Please attach a .doc .docx .pdf file") });
    }
    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      ctx.addIssue({ code: "custom", message: file.size === 0 ? "File CV không được rỗng." : t("Use a maximum file size of 3MB.") });
    }
  });

export const schema = (
  t: TFunction<["apply"], undefined>,
  selectedCV: CVSelectionStatus,
  selectedLocation: boolean
) => {
  return z.object({
    fullName: z.string().trim().max(255).nonempty({ message: t("This field is required.") }),
    email: z.string().optional(),
    phoneNumber: z
      .string()
      .nonempty({ message: t("This field is required.") })
      .regex(/^(0[1-9][0-9]{8,9})$/, {
        message: t("Please enter a valid phone number", { ns: "auth" }),
      }),
    coverLetter: z.string().max(500).optional(),
    cv: selectedCV === "SELECTED" ? z.any().optional() : cvSchema(t),
    location: !selectedLocation
      ? z.string().optional()
      : z.string().nonempty({ message: t("This field is required.") }),
  });
};
