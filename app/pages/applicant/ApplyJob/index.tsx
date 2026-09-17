import applicationService from "~/services/applicationService";
import { reportApiError } from "~/api/reportApiError";
import Loading from "~/components/Loading";
import LOGO from "/assets/images/logo.png";
import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import Modal from "react-modal";
import {
  ApplyJobBox,
  ApplyJobBranding,
  ApplyJobContainer,
  ApplyJobFile,
  ApplyJobForm,
  ApplyJobGroup,
  ApplyJobLetter,
  ApplyJobSubmit,
  ApplyJobWrapper,
  customStyles,
  ModalForm,
  SkeletonWrapper,
} from "./styled";
import InputFloating from "~/components/InputFloating";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputSelectFloating from "~/components/InputSelectFloating";
import cities from "~/constants/cities";
import authService from "~/services/authService";
import { ApiError } from "~/api/client";
import SwitchLanguage from "~/components/SwitchLanguage";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useUserStore } from "~/stores/userStore";
import "react-toastify/dist/ReactToastify.css";
import Skeleton from "react-loading-skeleton";
import { useJobQuery } from "~/hooks/useJobQuery";
import { useLocationStore } from "~/stores/locationStore";
import { schema, cvSchema } from "./schema";
import { ChevronLeft, Upload, X } from "feather-icons-react";
import { useTranslation } from "react-i18next";
import useValidation from "~/hooks/useValidation";

export type CVSelectionStatus = "SELECTED" | "NOT_SELECTED" | "UNSET";

const ApplyJob = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [filename, setFilename] = useState<string>("");
  const [selectedCV, setSelectedCV] = useState<CVSelectionStatus>("UNSET");
  const { t, i18n } = useTranslation(["apply"]);
  const language = i18n.language;
  const navigate = useNavigate();
  const { slug } = useParams();
  const {
    locationsTmp,
    handleAddLocation,
    handleRemoveLocation,
    handleAddLocations,
  } = useLocationStore();

  const {
    id: userId,
    username,
    phoneNumber,
    email,
  } = useUserStore((s) => s.user);

  function openModal() {
    if (!applyMutation.isPending) setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  const { data: job, isPending: jobPending, isError: jobError, error: jobFailure, refetch: refetchJob } = useJobQuery(slug || "");
  const { data: account, isPending: accountPending, isError: accountError, error: accountFailure, refetch: refetchAccount } = useQuery({
    queryKey: ["application-account", userId],
    queryFn: () => authService.account(),
    select: ({ data }) => data,
    retry: false,
  });

  useEffect(() => {
    if (accountFailure instanceof ApiError && accountFailure.status === 401) {
      navigate("/login?apply=" + encodeURIComponent(slug || ""), { replace: true });
    }
  }, [accountFailure, slug, navigate]);

  useEffect(() => {
    handleAddLocations([]);
    return () => handleAddLocations([]);
  }, [slug, handleAddLocations]);

  const schemaResolver = schema(t, selectedCV, locationsTmp.length === 0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    setError,
    clearErrors,
  } = useForm<Application>({
    defaultValues: {
      fullName: username || "",
      email: email || "",
      phoneNumber: phoneNumber || "",
      coverLetter: "",
      cv: "",
      location: "",
    },
    resolver: zodResolver(schemaResolver),
    mode: "onTouched",
  });

  useEffect(() => {
    if (account) {
      setValue("fullName", account.username || "");
      setValue("email", account.email || "");
      setValue("phoneNumber", account.phoneNumber || "");
    }
  }, [account, setValue]);


  const applyMutation = useMutation({
    mutationFn: (body: FormData) => applicationService.create({ slug: slug || "", body }),
    onSuccess: ({ data }) => {
      navigate("/apply/success/" + slug, {
        replace: true,
        state: { applicationId: data.id, jobId: data.jobId },
      });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 422) {
        const fields: (keyof Application)[] = ["fullName", "phoneNumber", "coverLetter", "cv"];
        for (const field of fields) {
          const message = error.errors[field]?.[0];
          if (message) setError(field, { type: "server", message });
        }
        const locationError = Object.entries(error.errors).find(([key]) => key === "locations" || key.startsWith("locations."));
        if (locationError) setError("location", { type: "server", message: locationError[1][0] });
      }
      reportApiError(error);
    },
  });

  const onSubmit = (data: Application) => {
    if (applyMutation.isPending) return;
    if (!locationsTmp.length) {
      setError("location", { type: "manual", message: "Vui lòng chọn địa điểm làm việc." });
      return;
    }
    const file = cvSchema(t).safeParse(data.cv);
    if (!file.success) {
      setError("cv", { type: "manual", message: file.error.issues[0].message });
      return;
    }
    const body = new FormData();
    body.append("fullName", data.fullName);
    body.append("phoneNumber", data.phoneNumber);
    body.append("coverLetter", data.coverLetter || "");
    body.append("cv", file.data);
    locationsTmp.forEach(location => body.append("locations[]", String(location.value)));
    applyMutation.mutate(body);
  };

  const isValidFullName = useValidation(watch("fullName"), username);
  const isValidPhoneNumber = useValidation(watch("phoneNumber"), phoneNumber);
  const isValidCoverLetter = useValidation(
    watch("coverLetter"),
    ""
  );

  const provinceOptions = cities.map((city) => ({ value: city.value, label: t(city.label, { ns: "option" }) }))
    .filter((city) => !locationsTmp.some((item) => item.value === city.value))
    .filter((city) => city.label.toLocaleLowerCase().includes((watch("location") || "").toLocaleLowerCase()));

  const handleGetFileCV = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.target.files && e.target.files.length > 0) {
      if (applyMutation.isPending) return;
      const file = e.target.files[0];
      const result = cvSchema(t).safeParse(file);
      if (!result.success) {
        setError("cv", { type: "manual", message: result.error.issues[0].message });
        e.target.value = "";
        return;
      }
      clearErrors("cv");
      setSelectedCV("NOT_SELECTED");
      setFilename(file.name);
      setValue("cv", file, { shouldDirty: true });
      e.target.value = "";
    }
  };

  if (jobError || accountError) return <ApplyJobWrapper><ApplyJobContainer><p>{jobFailure instanceof ApiError && jobFailure.status === 404 ? "Không tìm thấy việc làm." : "Không tải được thông tin ứng tuyển."}</p><button type="button" onClick={() => { void refetchJob(); void refetchAccount(); }}>Thử lại</button></ApplyJobContainer></ApplyJobWrapper>;
  if (account && account.role !== "APPLICANT") return <ApplyJobWrapper><ApplyJobContainer><p>Chỉ ứng viên mới có thể ứng tuyển.</p><Link to={"/job/" + slug}>Quay lại việc làm</Link></ApplyJobContainer></ApplyJobWrapper>;

  return (
    <ApplyJobWrapper>
      {applyMutation.isPending && <Loading />}
      {accountPending || jobPending || !job ? (
        <SkeletonWrapper>
          <Skeleton style={{ height: "100vh" }} borderRadius={8} />
        </SkeletonWrapper>
      ) : (
        <ApplyJobContainer>
          <ApplyJobBranding>
            <button className="back" onClick={openModal}>
              <ChevronLeft />
              <span>{t("Back")}</span>
            </button>
            <img src={LOGO} alt="logo itviec" />
            <SwitchLanguage />
          </ApplyJobBranding>
          <ApplyJobBox>
            <h2>{job.title}</h2>
            <ApplyJobForm onSubmit={handleSubmit(onSubmit)}>
              <h3>
                {t("Your CV")} <abbr>*</abbr>
              </h3>
              <ApplyJobFile
                htmlFor="my-cv"
                className={
                  selectedCV === "NOT_SELECTED" ? `active` : selectedCV
                }
                onClick={() => setSelectedCV("NOT_SELECTED")}>
                <input
                  type="radio"
                  id="my-cv"
                  name="selected-cv"
                  checked={selectedCV === "NOT_SELECTED"}
                  onChange={() => {}}
                />
                <span></span>
                <div className={`upload-cv`}>
                  <span>{t("Upload a new CV")}</span>
                  <br />
                  <div className="upload-file">
                    <label htmlFor="cv">
                      <input
                        type="file"
                        id="cv"
                        name="cv"
                        disabled={applyMutation.isPending}
                        hidden
                        onChange={handleGetFileCV}
                        accept=".doc, .docx, .pdf"
                      />
                      <Upload />
                      <div className="selected-file">{t("Choose file")}</div>
                    </label>
                    <div className="file-name">
                      {filename ? filename : t("No file chosen")}
                    </div>
                  </div>
                  {errors.cv && (
                    <p className="file-error">{errors.cv.message}</p>
                  )}
                  <p className="file-alert">
                    {t(
                      "Please upload a .doc, .docx, or .pdf file, maximum 3MB and no password protection"
                    )}
                  </p>
                </div>
              </ApplyJobFile>
              <ApplyJobGroup>
                <h3>{t("Personal information")}</h3>
                <InputFloating
                  name="fullName"
                  label={t("Full name", { ns: "auth" })}
                  required={true}
                  value={watch("fullName")}
                  error={errors.fullName && t(errors.fullName.message + "")}
                  className={
                    errors.fullName?.message ? "error" : isValidFullName
                  }
                  onSetValue={(value: string) => setValue("fullName", value)}
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
                <InputSelectFloating
                  name="location"
                  label={t("Preferred work location")}
                  register={register}
                  required={true}
                  options={provinceOptions}
                  maxLengh={3}
                  field={t("locations")}
                  value={watch("location") + ""}
                  selectedOptions={locationsTmp}
                  onAddOption={handleAddLocation}
                  onRemoveOption={handleRemoveLocation}
                  error={errors.location?.message}
                  onReset={() => setValue("location", "")}
                  isPending={false}
                />
              </ApplyJobGroup>
              <ApplyJobLetter>
                <h3>
                  {t("Cover Letter")} <span>({t("Optional")})</span>
                </h3>
                <p className="advantages">
                  {t(
                    "What skills, work projects or achievements make you a strong candidate?"
                  )}
                </p>
                <textarea
                  id="coverLetter"
                  {...register("coverLetter")}
                  maxLength={500}
                  className={isValidCoverLetter}
                  placeholder={t(
                    "Details and specific examples will make your application stronger..."
                  )}></textarea>
                <p className="characters">
                  {language === "en" ? (
                    <>
                      <span>{500 - Number(watch("coverLetter")?.length)}</span>{" "}
                      of 500 characters remaining
                    </>
                  ) : (
                    <>
                      Còn lại{" "}
                      <span>{500 - Number(watch("coverLetter")?.length)}</span>{" "}
                      trong tổng số 500 ký tự
                    </>
                  )}
                </p>
                {errors.coverLetter && <p role="alert">{errors.coverLetter.message}</p>}
              </ApplyJobLetter>
              <ApplyJobSubmit type="submit" disabled={applyMutation.isPending}>{t("Send my CV")}</ApplyJobSubmit>
            </ApplyJobForm>
          </ApplyJobBox>
        </ApplyJobContainer>
      )}
      <Modal
        isOpen={isOpen}
        onRequestClose={closeModal}
        style={customStyles}
        ariaHideApp={false}>
        <ModalForm>
          <div className="form-group">
            <h2>{t("Quit applying")}</h2>
            <X onClick={closeModal} />
          </div>
          <p>
            {t(
              "Changes you made so far will not be saved. Are you sure you want to quit this page?"
            )}
          </p>
          <div className="button-group">
            <button onClick={closeModal}>{t("Continue applying")}</button>
            <button onClick={() => navigate(`/job/${job?.slug}`)}>
              {t("Confirm")}
            </button>
          </div>
        </ModalForm>
      </Modal>
      <ToastContainer />
    </ApplyJobWrapper>
  );
};

export default ApplyJob;
