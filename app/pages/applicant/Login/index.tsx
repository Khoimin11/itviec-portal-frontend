import { reportApiError } from "~/api/reportApiError";
import {
  LoginContainer,
  LoginFeature,
  LoginFeatureItem,
  LoginFeatureList,
  LoginSubmit,
  LoginMain,
  LoginRegister,
  LoginWrapper,
  UserLogin,
  LoginGoogle,
} from "./styled";
import LOGO_BLACK_TEXT from "/assets/images/logo_black_text.png";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import InputBase from "~/components/InputBase";
import authService from "~/services/authService";
import { ApiError } from "~/api/client";
import { useUserStore } from "~/stores/userStore";
import showToast from "~/utils/showToast";
import useValidation from "~/hooks/useValidation";
import { GoogleLogin } from "@react-oauth/google";
import { Check } from "feather-icons-react";
import { schema } from "./schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const ROLLBACK_ROUTES = ["apply", "review", "company", "job"];

const Login = () => {
  const { t } = useTranslation(["auth"]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    setError,
    watch,
  } = useForm<ILogin>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(schema(t)),
    mode: "onTouched",
  });

  const { login } = useUserStore();
  const [searchParams] = useSearchParams();

  const loginMutation = useMutation({
    mutationFn: (body: ILogin) => authService.login(body),

    onSuccess: (response) => {
      const data = response.data;
      localStorage.setItem("access_token", data.accessToken);
      queryClient.removeQueries();
      login(data.user);
      const target = ROLLBACK_ROUTES.find((key) => searchParams.get(key));
      const redirectUrl = target
        ? `/${target}/${searchParams.get(target)}`
        : "/";

      showToast("success", t("Successfully authenticated from Email account."));
      navigate(redirectUrl);
      reset();
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 422) {
        const fields: (keyof ILogin)[] = ["email", "password"];
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
    },
  });

  const onSubmit: SubmitHandler<ILogin> = async (data: ILogin) => {
    if (!loginMutation.isPending) loginMutation.mutate(data);
  };

  const isValidEmail = useValidation(watch("email"));
  const isValidPassword = useValidation(watch("password"));

  return (
    <LoginWrapper>
      <UserLogin>
        <h3>
          <span>{t("Welcome to")}</span>
          <img src={LOGO_BLACK_TEXT} alt="logo-black-text" />
        </h3>
        <LoginContainer>
          <LoginMain>
            <div className="Login-message">
              {t("By signing in, you agree to ITviec")}{" "}
              <span className="Login-rules">{t("Terms & Conditions")}</span>{" "}
              {t("and")}{" "}
              <span className="Login-rules">{t("Privacy Policy")}</span>{" "}
              {t("in relation to your privacy information.")}
            </div>
            <LoginGoogle>
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
                    const target = ROLLBACK_ROUTES.find((key) =>
                      searchParams.get(key)
                    );
                    const redirectUrl = target
                      ? `/${target}/${searchParams.get(target)}`
                      : "/";
                    showToast(
                      "success",
                      "Successfully authenticated from Google account."
                    );

                    setTimeout(() => {
                      window.location.href = redirectUrl;
                    }, 2000);
                  }
                }}
                onError={() => {
                  showToast("error", "Đăng nhập bằng google thất bại");
                }}
                text="signin_with"
              />
            </LoginGoogle>
            <div className="Login-separator">
              <span>{t("or")}</span>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <InputBase
                type="email"
                name="email"
                label={t("Email")}
                placeholder={t("Email")}
                required={true}
                register={register}
                className={errors.email?.message ? "error" : isValidEmail}
                error={errors.email?.message}
              />
              <InputBase
                type="password"
                name="password"
                label={t("Password")}
                placeholder={t("Password")}
                required={true}
                register={register}
                className={errors.password?.message ? "error" : isValidPassword}
                error={errors.password?.message}
                isForgot={true}
              />
              <LoginSubmit type="submit" disabled={loginMutation.isPending}>
                {loginMutation.isPending
                  ? t("Signing in...")
                  : t("Sign In with Email")}
              </LoginSubmit>
            </form>
            <LoginRegister>
              {t("Do not have an account?")}{" "}
              <Link to="/register">{t("Sign up now!")}</Link>
            </LoginRegister>
          </LoginMain>
          <LoginFeature>
            <h2>
              {t(
                "Sign in to get instant access to thousands of reviews and salary information"
              )}
            </h2>
            <LoginFeatureList>
              <LoginFeatureItem>
                <Check />
                <p>
                  {t(
                    "View salary to help you negotiate your offer or pay rise"
                  )}
                </p>
              </LoginFeatureItem>
              <LoginFeatureItem>
                <Check />
                <p>
                  {t(
                    "Find out about benefits, interview, company culture via reviews"
                  )}
                </p>
              </LoginFeatureItem>
              <LoginFeatureItem>
                <Check />
                <p>{t("Easy apply with only 1 click")}</p>
              </LoginFeatureItem>
              <LoginFeatureItem>
                <Check />
                <p>{t("Manage your own profile & privacy")}</p>
              </LoginFeatureItem>
            </LoginFeatureList>
          </LoginFeature>
        </LoginContainer>
      </UserLogin>
    </LoginWrapper>
  );
};

export default Login;
