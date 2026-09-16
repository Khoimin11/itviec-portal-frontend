import { ApiError } from "~/api/client";
import { reportApiError } from "~/api/reportApiError";
import companyService from "~/services/companyService";
import { useCompanyStore } from "~/stores/companyStore";
import showToast from "~/utils/showToast";
import React, { useEffect, useMemo, useState } from "react";
import {
  CompanyInfoContainer,
  CompanyInfoMain,
  CompanyInfoSide,
  CompanyInfoWrapper,
} from "./styled";
import { useTranslation } from "react-i18next";
import { useCompanyQuery } from "~/hooks/useCompanyQuery";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputFloating from "~/components/InputFloating";
import SelectFloating from "~/components/SelectFloating";
import cities from "~/constants/cities";
import RichTextEditor from "~/components/RichTextEditor";
import useValidation from "~/hooks/useValidation";
import { keepPreviousData, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import skillService from "~/services/skillService";
import useDebounce from "~/hooks/useDebounce";
import InputSearch from "~/components/InputSearch";
import companySizes from "~/constants/companySizes";
import companyTypes from "~/constants/companyTypes";
import workingDays from "~/constants/workingDays";
import overtimes from "~/constants/overtimePolicy";
import countries from "~/constants/countries";
import { useSkillStore } from "~/stores/skillStore";
import { useUserStore } from "~/stores/userStore";
import Loading from "~/components/Loading";
import { Upload } from "feather-icons-react";
import { schema } from "./schema";
import ChangePassword from "./ChangePassword";
import { useIndustriesQuery } from "~/hooks/useIndustriesQuery";

const MAX_SKILLS = 10;

const CompanyProfile = () => {
  const { t, i18n } = useTranslation(["search"]);
  const [previewLogo, setPreviewLogo] = useState("");
  const queryClient = useQueryClient();
  const { updateCompanyInfo } = useUserStore();
  const { handleSaveCompany } = useCompanyStore();
  const [overview, setOverview] = useState("");
  const [perks, setPerks] = useState("");

  const { selectedSkillIds, handleSelectedSkillIds, saveSelectedSkillIds } =
    useSkillStore();
  const { id: userId, email, phoneNumber, username } = useUserStore((s) => s.user);
  const { data: profile, isPending: isLoading, isError, error, refetch } = useCompanyQuery(userId, true);
  const company = profile ?? ({} as Company);

  const {
    register,
    formState: { errors, submitCount },
    getValues,
    handleSubmit,
    setError,
    setValue,
    reset,
    watch,
  } = useForm<Company>({
    defaultValues: {},
    resolver: zodResolver(schema(t)),
    mode: "onTouched",
  });

  useEffect(() => {
    if (profile) {
      reset({
        username: company.username || "",
        email: company.email || "",
        phoneNumber: company.phoneNumber || "",
        tagline: company.tagline || "",
        position: company.position || "",
        companyType: company.companyType || "",
        industryId: company.industryId ? String(company.industryId) : "",
        companySize: company.companySize || "",
        country: company.country || "",
        workingDay: company.workingDay || "",
        overtimePolicy: company.overtimePolicy || "",
        companyName: company.companyName || "",
        location: company.location || "",
        website: company.website || "",
        overview: company.overview || "",
        perks: company.perks || "",
        skillIds: "",
        logo: company.logo || "",
        id: company.id || 0,
      });
      setPreviewLogo("");
      setOverview(company.overview || "");
      setPerks(company.perks || "");
      saveSelectedSkillIds(company.skills?.map(skill => skill.id) ?? []);
    }
  }, [profile, reset, saveSelectedSkillIds]);


  useEffect(() => {
    return () => { if (previewLogo) URL.revokeObjectURL(previewLogo); };
  }, [previewLogo]);

  const updateCompanyMutation = useMutation({
    mutationFn: (body: FormData) => companyService.update({ body }),
    onSuccess: ({ data }) => {
      updateCompanyInfo({ username: data.username, email: data.email, phoneNumber: data.phoneNumber });
      handleSaveCompany(data);
      queryClient.setQueryData(["company-profile", userId], { isSuccess: true, message: "", data });
      showToast("success", "Cập nhật hồ sơ thành công");
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 422) {
        const fields: (keyof Company)[] = ["username", "position", "email", "phoneNumber", "companyName", "location", "website", "tagline", "companyType", "industryId", "companySize", "country", "workingDay", "overtimePolicy", "overview", "perks", "skillIds", "logo"];
        for (const field of fields) {
          const message = error.errors[field]?.[0];
          if (message) setError(field, { type: "server", message });
        }
      }
      reportApiError(error);
    },
  });

  const onSubmit = (data: Company) => {
    if (!profile || updateCompanyMutation.isPending) return;
    const formData = new FormData();
    Object.entries({ ...data, overview, perks }).forEach(([key, value]) => {
      if (key === "skillIds" || key === "id") return;
      if (key === "logo") {
        if (value instanceof File) formData.append("logo", value);
      } else {
        formData.append(key, String(value ?? ""));
      }
    });
    if (selectedSkillIds.length) {
      selectedSkillIds.forEach(id => formData.append("skillIds[]", String(id)));
    } else {
      formData.append("skillIds", "");
    }
    updateCompanyMutation.mutate(formData);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 2 * 1024 * 1024) {
      showToast("error", "Logo phải là ảnh JPG, PNG hoặc WebP, tối đa 2 MB.");
      event.target.value = "";
      return;
    }
    setPreviewLogo(URL.createObjectURL(file));
    setValue("logo", file);
  };

  const isValidUsername = useValidation(watch("username"), username);
  const isValidPosition = useValidation(watch("position"), company?.position);
  const isValidEmail = useValidation(watch("email"), email);
  const isValidPhoneNumber = useValidation(watch("phoneNumber"), phoneNumber);
  const isValidCompanyType = useValidation(
    watch("companyType"),
    `${company.companyType}`
  );
  const isValidIndustryId = useValidation(watch("industryId") + "");
  const isValidCompanySize = useValidation(
    watch("companySize") + "",
    `${company.companySize}`
  );
  const isValidCountry = useValidation(
    watch("country") + "",
    `${company.country}`
  );
  const isValidWorkingDay = useValidation(
    watch("workingDay") + "",
    `${company.workingDay}`
  );
  const isValidOvertimePolicy = useValidation(
    watch("overtimePolicy") + "",
    `${company.overtimePolicy}`
  );
  const isValidCompanyName = useValidation(
    watch("companyName"),
    company?.companyName
  );

  const isValidLocation = useValidation(
    watch("location"),
    `${company?.location}`
  );
  const companyWebsiteValue = useValidation(
    watch("website"),
    `${company?.website}`
  );
  const isValidWebsite = useMemo(() => {
    return submitCount > 0 && !companyWebsiteValue
      ? "success"
      : errors.website?.message
      ? "error"
      : "";
  }, [companyWebsiteValue, submitCount]);

  const { data: industries } = useIndustriesQuery("", i18n.language);

  const skillIdsDebounce = useDebounce(watch("skillIds") + "", 1000);

  const { data: skills, isPending } = useQuery({
    queryKey: ["skills", skillIdsDebounce],
    queryFn: () => skillService.getAll({ name: skillIdsDebounce }),
    select: ({ data }) =>
      data.map((item) => ({ value: item.id, label: item.name })),
    placeholderData: keepPreviousData,
  });

  if (isError) return <CompanyInfoWrapper><p>{error instanceof Error ? error.message : "Không tải được hồ sơ công ty."}</p><button onClick={() => refetch()}>Thử lại</button></CompanyInfoWrapper>;

  return (
    <CompanyInfoWrapper>
      {(isLoading || updateCompanyMutation.isPending) && <Loading />}
      <div className="heading">
        <h2>{t("Company Profile", { ns: "header" })}</h2>
      </div>
      <CompanyInfoContainer>
        <CompanyInfoMain>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group input-row">
              <InputFloating
                name="username"
                label={t("Full name", { ns: "auth" })}
                value={watch("username")}
                required={true}
                error={errors.username && t(errors.username.message + "")}
                className={errors.username?.message ? "error" : isValidUsername}
                onSetValue={(value: string) => setValue("username", value)}
              />
              <InputFloating
                name="position"
                label={t("Work title", { ns: "auth" })}
                value={watch("position")}
                required={true}
                error={errors.position && t(errors.position?.message + "")}
                className={errors.position?.message ? "error" : isValidPosition}
                onSetValue={(value: string) => setValue("position", value)}
              />
            </div>
            <div className="form-group input-row">
              <InputFloating
                name="email"
                value={watch("email")}
                type="email"
                disabled={true}
                label={t("Work email", { ns: "auth" })}
                required={true}
                error={errors.email && t(errors.email?.message + "")}
                className={errors.email?.message ? "error" : isValidEmail}
                onSetValue={(value: string) => setValue("email", value)}
              />
              <InputFloating
                name="phoneNumber"
                value={watch("phoneNumber")}
                label={t("Phone number", { ns: "auth" })}
                required={true}
                error={
                  errors.phoneNumber && t(errors.phoneNumber?.message + "")
                }
                className={
                  errors.phoneNumber?.message ? "error" : isValidPhoneNumber
                }
                onSetValue={(value: string) => setValue("phoneNumber", value)}
              />
            </div>
            <div className="form-group">
              <InputFloating
                name="companyName"
                value={watch("companyName")}
                label={t("Company name", { ns: "auth" })}
                required={true}
                error={
                  errors.companyName && t(errors.companyName?.message + "")
                }
                className={
                  errors.companyName?.message ? "error" : isValidCompanyName
                }
                onSetValue={(value: string) => setValue("companyName", value)}
              />
            </div>
            <div className="form-group">
              <SelectFloating
                name="location"
                register={register}
                label={t("Company location", { ns: "auth" })}
                required={true}
                error={errors.location && t(errors.location?.message + "")}
                className={errors.location?.message ? "error" : isValidLocation}
                options={cities}
                onSetValue={(value) => setValue("location", value)}
                defaultValue={
                  watch("location")
                    ? { value: watch("location"), label: watch("location") }
                    : undefined
                }
              />
            </div>
            <div className="form-group set-mb">
              <InputFloating
                name="website"
                value={watch("website")}
                label="Địa chỉ website"
                required={false}
                error={errors.website && t(errors.website?.message + "")}
                className={isValidWebsite}
                onSetValue={(value: string) => setValue("website", value)}
              />
              <div className="helper-text">
                {t("URL includes a protocol (https), e.g: https://itviec.com", {
                  ns: "auth",
                })}
              </div>
            </div>
            <h3>{t("General information")}</h3>
            <div className="form-group">
              <InputFloating
                name="tagline"
                value={watch("tagline")}
                label={t("Tag line", { ns: "auth" })}
                required={false}
                onSetValue={(value: string) => setValue("tagline", value)}
              />
            </div>
            <div className="form-group input-row">
              <SelectFloating
                name="companyType"
                register={register}
                label={t("Introduce.Company type")}
                required={true}
                error={errors.companyType && t(errors.companyType.message + "")}
                className={
                  errors.companyType?.message ? "error" : isValidCompanyType
                }
                options={companyTypes}
                onSetValue={(value) => setValue("companyType", value)}
                defaultValue={
                  watch("companyType")
                    ? {
                        value: watch("companyType"),
                        label: watch("companyType"),
                      }
                    : undefined
                }
              />
              <SelectFloating
                name="industryId"
                register={register}
                label={t("Introduce.Company industry")}
                required={true}
                error={errors.industryId && t(errors.industryId.message + "")}
                className={
                  errors.industryId?.message ? "error" : isValidIndustryId
                }
                options={industries ?? []}
                onSetValue={(value) => setValue("industryId", value)}
                defaultValue={
                  watch("industryId")
                    ? {
                        value: company?.industry?.id + "",
                        label:
                          i18n.language === "en"
                            ? company?.industry?.name_en + ""
                            : company?.industry?.name_vi + "",
                      }
                    : undefined
                }
              />
            </div>
            <div className="form-group input-row">
              <SelectFloating
                name="companySize"
                register={register}
                label={t("Introduce.Company size")}
                required={true}
                error={errors.companySize && t(errors.companySize.message + "")}
                className={
                  errors.companySize?.message ? "error" : isValidCompanySize
                }
                options={companySizes}
                onSetValue={(value) => setValue("companySize", value)}
                defaultValue={
                  watch("companySize")
                    ? {
                        value: watch("companySize"),
                        label: watch("companySize"),
                      }
                    : undefined
                }
              />
              <SelectFloating
                name="country"
                register={register}
                label={t("Introduce.Country")}
                required={true}
                error={errors.country && t(errors.country.message + "")}
                className={errors.country?.message ? "error" : isValidCountry}
                options={countries}
                onSetValue={(value) => setValue("country", value)}
                defaultValue={
                  watch("country")
                    ? {
                        value: watch("country"),
                        label: watch("country"),
                      }
                    : undefined
                }
              />
            </div>
            <div className="form-group input-row">
              <SelectFloating
                name="workingDay"
                register={register}
                label={t("Introduce.Working days")}
                required={true}
                error={errors.workingDay && t(errors.workingDay.message + "")}
                className={
                  errors.workingDay?.message ? "error" : isValidWorkingDay
                }
                options={workingDays}
                onSetValue={(value) => setValue("workingDay", value)}
                defaultValue={
                  watch("workingDay")
                    ? {
                        value: watch("workingDay"),
                        label: watch("workingDay"),
                      }
                    : undefined
                }
              />
              <SelectFloating
                name="overtimePolicy"
                register={register}
                label={t("Introduce.Overtime policy")}
                required={true}
                error={
                  errors.overtimePolicy && t(errors.overtimePolicy.message + "")
                }
                className={
                  errors.overtimePolicy?.message
                    ? "error"
                    : isValidOvertimePolicy
                }
                options={overtimes}
                onSetValue={(value) => setValue("overtimePolicy", value)}
                defaultValue={
                  watch("overtimePolicy")
                    ? {
                        value: watch("overtimePolicy"),
                        label: watch("overtimePolicy"),
                      }
                    : undefined
                }
              />
            </div>
            <h3>{t("Company overview")}</h3>
            <div className="form-group">
              <RichTextEditor
                content={overview}
                setContent={setOverview}
              />
            </div>
            <h3 style={{ marginTop: "1.6rem" }}>{t("Our key skills")}</h3>
            <div className="form-group skills">
              <div className="form-select">
                <InputSearch
                  name="skillIds"
                  register={register}
                  options={skills ?? []}
                  max={MAX_SKILLS}
                  isPending={isPending}
                  placeholder={t("Search skills", { ns: "profile" })}
                  selectedIds={selectedSkillIds}
                  handleSelectedIds={handleSelectedSkillIds}
                />
                <div
                  className={`counter ${
                    selectedSkillIds.length === MAX_SKILLS && "error"
                  }`}>
                  {selectedSkillIds.length}/{MAX_SKILLS} {t("skills")}
                </div>
              </div>
            </div>
            <h3 style={{ marginTop: "1.6rem" }}>
              {t("Why you'll love working here")}
            </h3>
            <div className="form-group" style={{ marginBottom: "2.4rem" }}>
              <RichTextEditor
                content={perks}
                setContent={setPerks}
              />
            </div>
            <div className="form-submit">
              <button type="submit" disabled={updateCompanyMutation.isPending}>
                {t("Update Profile")}
              </button>
            </div>
          </form>
        </CompanyInfoMain>
        <CompanyInfoSide>
          <div className="logo">
            <figure>
              <img
                src={
                  watch("id") && watch("logo")
                    ? previewLogo || getValues("logo") + ""
                    : previewLogo || "/assets/svg/avatar-default.svg"
                }
                alt="company logo"
              />
            </figure>
          </div>
          <div className="upload-file">
            <label htmlFor="logo">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                id="logo"
                name="logo"
                hidden
                onChange={handleFileChange}
                disabled={updateCompanyMutation.isPending}
              />
              <Upload />
              <div className="selected-file">{t("Upload Logo")}</div>
            </label>
          </div>
          <ChangePassword />
        </CompanyInfoSide>
      </CompanyInfoContainer>
    </CompanyInfoWrapper>
  );
};

export default CompanyProfile;
