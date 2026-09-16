import { reportApiError } from "~/api/reportApiError";
import { useTranslation } from "react-i18next";
import { SignInForm, ToastMessage } from "./styled";
import Logo from "/assets/images/logo_black_text.png";
import InputFloating from "~/components/InputFloating";
import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router";
import { z } from "zod";
import { ApiError } from "~/api/client";
import { useQueryClient } from "@tanstack/react-query";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import authService from "~/services/authService";
import { useUserStore } from "~/stores/userStore";
import IconToastError from "~/components/Icons/IconToastError";
import { Mail, PhoneCall } from "feather-icons-react";

const Login = () => {
  const { t } = useTranslation(["auth"]);
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { login } = useUserStore((s) => s);

  const schema = z.object({
    email: z.string().trim().toLowerCase().email(t("Please enter a valid email address")).max(255),
    password: z.string().min(1, t("Can't be blank")).refine(
      value => new TextEncoder().encode(value).length <= 72,
      t("Mật khẩu không được vượt quá 72 byte.")
    ),
  });

  const { handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<ILogin>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(schema),
    mode: "onTouched",
  });

  const onSubmit: SubmitHandler<ILogin> = async (data: ILogin) => {
    setShowError(false);
    try {
      const response = await authService.loginCompany(data);
      localStorage.setItem("access_token", response.data.accessToken);
      queryClient.removeQueries();
      login(response.data.user);
      reset();
      navigate("/employer/dashboard", { replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        setShowError(true);
      } else {
        reportApiError(error);
      }
    }
  };

  return (
    <SignInForm>
      <div className="logo">
        <img src={Logo} alt="logo" />
        <h3>CUSTOMER ADMIN SITE</h3>
      </div>
      <h1>{t("Welcome to ITviec Customer")}</h1>
      {showError && (
        <ToastMessage>
          <div className="toast-icon">
            <IconToastError />
          </div>
          <h6 className="toast-message">
            {t("Oops! Wrong username and/or password. Please try again.")}
          </h6>
        </ToastMessage>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <InputFloating
            name="email"
            value={watch("email")}
            type="email"
            label={t("Email")}
            error={errors.email?.message}
            required={false}
            onSetValue={useCallback(
              (value: string) => setValue("email", value),
              []
            )}
          />
        </div>
        <div className="form-group">
          <InputFloating
            name="password"
            type="password"
            value={watch("password")}
            label={t("Password")}
            error={errors.password?.message}
            required={false}
            onSetValue={useCallback(
              (value: string) => setValue("password", value),
              []
            )}
          />
        </div>
        <div className="form-group">
          {/* <RememberMeCheck htmlFor="remember-me-check">
            <input
              type="checkbox"
              id="remember-me-check"
              onChange={() => setIsRememberMe((prev) => !prev)}
            />
            <span>{t("Remember me")}</span>
          </RememberMeCheck> */}
          <div className="account-demo">
            <div className="account">
              <div>Demo: </div>
              <div>
                <div>{t("Email")}: fptsoftware@yopmail.com</div>
                <div>
                  {t("Password")}: {"d<M0~Sj6.bDW"}
                </div>
              </div>
            </div>
          </div>
          <Link to="/employer/forgot-password">{t("Forgot password?")}</Link>
        </div>
        <div className="policy">
          {t("I have read and agree to ITviec")}{" "}
          <Link to={""} className="register-rules">
            {t("Terms & Conditions")}
          </Link>{" "}
          {t("and")}{" "}
          <Link to={""} className="register-rules">
            {t("Privacy Policy")}
          </Link>{" "}
          {t("in relation to your privacy information.")}
        </div>
        <div className="form-submit">
          <button disabled={isSubmitting}>{t("Sign In")}</button>
        </div>
        <hr />
        <div className="contact">
          {t("Don't have a customer account yet? Contact us at:")}
        </div>
        <ul className="contact-list">
          <li>
            <PhoneCall />
            <span>{t("Ho Chi Minh", { ns: "option" })}: (+84) 977 460 519</span>
          </li>
          <li>
            <PhoneCall />
            <span>{t("Ha Noi", { ns: "option" })}: (+84) 983 131 351</span>
          </li>
          <li>
            <Mail />
            <span>Email: love@itviec.com</span>
          </li>
        </ul>
      </form>
    </SignInForm>
  );
};

export default Login;
