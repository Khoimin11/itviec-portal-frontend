import { reportApiError } from "~/api/reportApiError";
import { useState } from "react";
import { ApiError } from "~/api/client";
import validationPassword from "~/constants/validationPassword";
import { Link, useNavigate } from "react-router";
import { Circle, Eye, EyeOff } from "feather-icons-react";
import {
  AlreadyAccount,
  AuthenticationError,
  RegisterAgreement,
  RegisterButton,
  RegisterGoogle,
  RegisterGroup,
  RegisterMain,
  RegisterPasswordInput,
  RegisterWrapper,
  UserRegister,
} from "./styled";
import { useTranslation } from "react-i18next";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useValidation from "~/hooks/useValidation";
import showToast from "~/utils/showToast";
import authService from "~/services/authService";
import { schema } from "./schema";
import { GoogleLogin } from "@react-oauth/google";
import { useUserStore } from "~/stores/userStore";

const Register = () => {
  const navigate = useNavigate();
  const [agreementGoogle, setAgreementGoogle] = useState(false);
  const { login } = useUserStore();
  const [togglePassword, setTogglePassword] = useState(false);

  const { t, i18n } = useTranslation(["auth"]);
  const language = i18n.language;

  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
    setError,
    watch,
  } = useForm<IRegister>({
    defaultValues: {
      email: "",
      username: "",
      password: "",
      termsAccepted: false,
    },
    resolver: zodResolver(schema(t)),
    mode: "onTouched",
  });
  const onSubmit: SubmitHandler<IRegister> = async (data) => {
    try {
      await authService.register(data);
      showToast("success", t("Registration.success"));
      navigate("/login");
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        const fields: (keyof IRegister)[] = ["username", "email", "password", "termsAccepted"];
        let focused = false;
        for (const field of fields) {
          const message = error.errors[field]?.[0];
          if (message) {
            setError(field, { type: "server", message }, { shouldFocus: !focused });
            focused = true;
          }
        }
        if (focused) return;
      }
      reportApiError(error);
    }
  };

  const password = watch("password");
  const agreementEmail = watch("termsAccepted");
  const passwordChecks = validationPassword(password);

  const renderPasswordCheck = (isValid: boolean | null, message: string) => {
    if (!password && !errors.password) isValid = null;
    const color =
      isValid === null ? undefined : isValid ? "#0ab305" : "#f60d00";
    const textClass =
      isValid === true ? "success" : isValid === false ? "error" : "";

    return (
      <div className="password-check">
        {isValid === null ? (
          <Circle color={color} />
        ) : (
          <Circle color={color} fill={color} />
        )}
        <div className={`text-verify ${textClass}`}>{message}</div>
      </div>
    );
  };

  const isValidUsername = useValidation(watch("username"));
  const isValidEmail = useValidation(watch("email"));
  const isValidPassword = Object.values(passwordChecks).every(Boolean) ? "success" : "";

  return (
    <RegisterWrapper>
      <UserRegister>
        <h3>
          <span>{t("Welcome to")}</span>
          <img src="/assets/images/logo_black_text.png" alt="logo" />
        </h3>
        <RegisterMain>
          <h1>{t("Sign up")}</h1>
          <RegisterAgreement $google htmlFor="agreement-google">
            <input
              type="checkbox"
              id="agreement-google"
              onChange={() => setAgreementGoogle((prev) => !prev)}
            />
            <span></span>
            <div>
              {t("By signing up with Google, I agree to ITviec")}{" "}
              <span className="register-rules">{t("Terms & Conditions")}</span>{" "}
              {t("and")}{" "}
              <span className="register-rules">{t("Privacy Policy")}</span>{" "}
              {t("in relation to your privacy information.")}
            </div>
          </RegisterAgreement>
          <RegisterGoogle className={!agreementGoogle ? "disable" : ""}>
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                const credential = credentialResponse.credential + "";
                const response = await authService.loginGoogle(credential).catch(reportApiError);
                if (!response) return;
                if (response.isSuccess && response.data) {
                  localStorage.setItem(
                    "access_token",
                    response.data.accessToken as string
                  );
                  login(response.data.user);
                  navigate("/");
                  showToast(
                    "success",
                    "Successfully authenticated from Google account."
                  );
                }
              }}
              onError={() => {
                showToast("error", "Đăng nhập bằng google thất bại");
              }}
              text="signup_with"
            />
          </RegisterGoogle>
          <div className="register-separator">
            <span>{t("or")}</span>
          </div>
          <form noValidate onSubmit={handleSubmit(onSubmit)}>
            <RegisterGroup>
              <label htmlFor="username">
                <span>{t("Your Name")} </span>
                <abbr>*</abbr>
              </label>
              <input
                type="text"
                id="username"
                autoComplete="name"
                placeholder={t("Enter your Name")}
                {...register("username")}
                className={errors.username?.message ? "error" : isValidUsername}
              />
              <AuthenticationError>
                {errors.username?.message}
              </AuthenticationError>
            </RegisterGroup>
            <RegisterGroup>
              <label htmlFor="email">
                <span>{t("Email")}</span>
                <abbr>*</abbr>
              </label>
              <input
                type="email"
                id="email"
                autoComplete="email"
                placeholder={t("Enter your Email")}
                {...register("email")}
                className={errors.email?.message ? "error" : isValidEmail}
              />
              <AuthenticationError>{errors.email?.message}</AuthenticationError>
            </RegisterGroup>
            <RegisterGroup>
              <label htmlFor="password">
                <span>{t("Password")}</span>
                <abbr>*</abbr>
              </label>
              <RegisterPasswordInput>
                <div className="password-group">
                  <input
                    type={togglePassword ? "text" : "password"}
                    id="password"
                    autoComplete="new-password"
                    placeholder={t("Enter password")}
                    {...register("password")}
                    className={
                      errors.password?.message ? "error" : isValidPassword
                    }
                  />
                  {togglePassword ? (
                    <Eye onClick={() => setTogglePassword(false)} />
                  ) : (
                    <EyeOff onClick={() => setTogglePassword(true)} />
                  )}
                </div>
                <AuthenticationError>{errors.password?.message}</AuthenticationError>
                <div className="password-verify">
                  {renderPasswordCheck(
                    passwordChecks.has12Chars,
                    t("Password Verify.At least 12 characters")
                  )}
                  {renderPasswordCheck(
                    passwordChecks.hasSymbol,
                    t("Password Verify.At least 1 symbol (! @ # $ ...)")
                  )}
                  {renderPasswordCheck(
                    passwordChecks.hasNumber,
                    t("Password Verify.At least 1 number")
                  )}
                  {renderPasswordCheck(
                    passwordChecks.hasUppercase,
                    t("Password Verify.At least 1 UPPERCASE letter")
                  )}
                  {renderPasswordCheck(
                    passwordChecks.hasLowercase,
                    t("Password Verify.At least 1 lowercase letter")
                  )}
                </div>
              </RegisterPasswordInput>
            </RegisterGroup>
            <RegisterAgreement htmlFor="agreement-email">
              <input
                type="checkbox"
                id="agreement-email"
                {...register("termsAccepted")}
              />
              <span></span>
              <div>
                {t("I have read and agree to ITviec")}{" "}
                <span className="register-rules">
                  {t("Terms & Conditions")}
                </span>{" "}
                {t("and")}{" "}
                <span className="register-rules">{t("Privacy Policy")}</span>
                {language !== "en"
                  ? " " + t("in relation to your privacy information.")
                  : "."}
              </div>
            </RegisterAgreement>
            <AuthenticationError>{errors.termsAccepted?.message}</AuthenticationError>
            <RegisterButton
              className={agreementEmail ? "active" : ""}
              disabled={!agreementEmail || isSubmitting}
              type="submit">
              {isSubmitting ? t("Registration.submitting") : t("Sign Up with Email")}
            </RegisterButton>
          </form>
          <AlreadyAccount>
            {t("Already have an account?")}{" "}
            <Link to="/login">{t("Sign In Now!")}</Link>
          </AlreadyAccount>
        </RegisterMain>
      </UserRegister>
    </RegisterWrapper>
  );
};

export default Register;
