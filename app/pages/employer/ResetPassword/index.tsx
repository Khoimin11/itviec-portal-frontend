import { reportApiError } from "~/api/reportApiError";
import { NoteAccount, SignInForm } from "./styled";
import Logo from "/assets/images/logo_black_text.png";
import InputFloating from "~/components/InputFloating";
import { useTranslation } from "react-i18next";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "~/api/client";
import { Navigate, useNavigate, useSearchParams } from "react-router";
import showToast from "~/utils/showToast";
import authService from "~/services/authService";
import useValidation from "~/hooks/useValidation";
import { schema } from "./schema";

const ResetPassword = () => {
  const { t } = useTranslation(["auth"]);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const emailParams = searchParams.get("email");
  const emailStorage = localStorage.getItem("email-company");

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    watch,
    setValue,
    setError,
  } = useForm<IResetPassword>({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
    resolver: zodResolver(schema(t)),
    mode: "onTouched",
  });

  const onSubmit: SubmitHandler<IResetPassword> = async (
    data: IResetPassword
  ) => {
    if (!emailParams) return;
    try {
      await authService.resetPassword(emailParams, data.newPassword);
      showToast("success", t("Đổi mật khẩu thành công"));
      localStorage.removeItem("email-company");
      navigate("/employer/login", { replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        const passwordError = error.errors.password?.[0];
        if (passwordError) {
          setError("newPassword", { type: "server", message: passwordError });
          return;
        }
      }
      reportApiError(error);
    }
  };

  const isValidNewPassword = useValidation(watch("newPassword"));
  const isValidConfirmPassword = useValidation(watch("confirmPassword"));

  if (!emailParams || emailParams !== emailStorage) {
    return <Navigate to="/employer" replace />;
  }

  return (
    <SignInForm>
      <div className="logo">
        <img src={Logo} alt="logo" />
        <h3>CUSTOMER ADMIN SITE</h3>
      </div>
      <h1>{t("Reset Password")}</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <InputFloating
            name="newPassword"
            type="password"
            value={watch("newPassword")}
            label={t("New Password")}
            required={true}
            className={
              errors.newPassword?.message ? "error" : isValidNewPassword
            }
            error={errors.newPassword?.message}
            onSetValue={(value: string) => setValue("newPassword", value)}
          />
        </div>
        <div className="form-group">
          <InputFloating
            name="confirmPassword"
            type="password"
            value={watch("confirmPassword")}
            label={t("Confirm Password")}
            required={true}
            className={
              errors.confirmPassword?.message ? "error" : isValidConfirmPassword
            }
            error={errors.confirmPassword?.message}
            onSetValue={(value: string) => setValue("confirmPassword", value)}
          />
        </div>
        <NoteAccount>
          <strong>{t("Note")}:</strong>
          <p>
            {t(
              "Password must contain at least 12 characters. Combination of symbols, numbers, uppercase letters, lowercase letters."
            )}
          </p>
        </NoteAccount>
        <div className="form-submit">
          <button disabled={isSubmitting}>{t("Update new Password")}</button>
        </div>
      </form>
    </SignInForm>
  );
};

export default ResetPassword;
