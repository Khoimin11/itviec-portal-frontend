import api from "~/api";

export interface LoginResponse {
  accessToken: string;
  user: User;
}

const authService = {
  login: (body: ILogin): Promise<IResponse<LoginResponse>> => {
    return api.post("/auth/login", body);
  },
  register: (body: IRegister): Promise<IResponse<null>> => {
    return api.post("/auth/register", body);
  },
  registerCompany: (body: RegisterEmployer): Promise<IResponse<null>> => {
    return api.post("/auth/register-company", body);
  },
  account: (): Promise<IResponse<User>> => {
    return api.get("/auth/account");
  },
  loginGoogle: (
    credential: string
  ): Promise<IResponse<{ accessToken: string; user: User }>> => {
    return api.post("/auth/login-google", { token: credential });
  },
  logout: (): Promise<IResponse<null>> => {
    return api.post("/auth/logout");
  },
  forgotPassword: (
    email: string,
    isCompany?: boolean
  ): Promise<IResponse<null>> => {
    return api.post("/auth/forgot-password", {
      email,
      isCompany,
    });
  },
  resetPassword: (
    email: string,
    password: string
  ): Promise<IResponse<null>> => {
    return api.post("/auth/reset-password", {
      email,
      password,
    });
  },
  changePassword: (body: IChangePassword): Promise<IResponse<boolean>> => {
    return api.post("/auth/change-password", body);
  },
  createDeleteCode: (): Promise<IResponse<boolean>> => {
    return api.get("/auth/delete-code");
  },
  deleteAccount: (code: string): Promise<IResponse<boolean>> => {
    return api.post("/auth/delete-account", { code });
  },
};

export default authService;
