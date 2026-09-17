import type { TFunction } from "i18next";
import { z } from "zod";

export const schema = (
  t: TFunction<["profile"], undefined>,
  selectedSkill: boolean
) => {
  return z.object({
    title: z.string().trim().max(255).nonempty({ message: t("Please enter your title") }),
    level: z.string().nonempty({ message: t("Please select your job level.") }),
    label: z.string().optional(),
    location: z.string().nonempty({ message: t("Please enter your job city") }),
    address: z.string().optional(),
    skill: !selectedSkill
      ? z.string().optional()
      : z.string().nonempty({ message: t("This field is your job skill") }),
    workingModel: z
      .string()
      .nonempty({ message: t("Please select your working model.") }),
    minSalary: z.string().nonempty({ message: t("Please enter min salary.") }),
    maxSalary: z.string().nonempty({ message: t("Please enter max salary.") }),
    startDate: z.string().nonempty({ message: t("Please choose a time") }),
    endDate: z.string().nonempty({ message: t("Please choose a time") }),
    currencySalary: z.string().default("VND"),
  }).superRefine((data, ctx) => {
    if (!/^\d+(\.\d{1,2})?$/.test(data.minSalary)) {
      ctx.addIssue({ code: "custom", path: ["minSalary"], message: "Mức lương không hợp lệ." });
    }
    if (!/^\d+(\.\d{1,2})?$/.test(data.maxSalary) || Number(data.maxSalary) < Number(data.minSalary)) {
      ctx.addIssue({ code: "custom", path: ["maxSalary"], message: "Lương tối đa phải lớn hơn hoặc bằng lương tối thiểu." });
    }
    if (data.startDate && data.endDate && data.endDate < data.startDate) {
      ctx.addIssue({ code: "custom", path: ["endDate"], message: "Ngày kết thúc phải từ ngày bắt đầu trở đi." });
    }
  });
};
