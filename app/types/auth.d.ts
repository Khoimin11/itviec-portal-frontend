interface ILogin {
  email: string;
  password: string;
}

interface IRegister extends ILogin {
  termsAccepted: boolean;
  username: string;
}

type TForgotPassword = Pick<IUser, "email">;

interface IResetPassword {
  newPassword: string;
  confirmPassword: string;
}

interface IChangePassword extends IResetPassword {
  currentPassword: string;
}

interface RegisterEmployer {
  username: string;
  email: string;
  phoneNumber: string;
  source?: string;
  position: string;
  companyName: string;
  location: string;
  website: string;
}

interface DeleteAccount {
  code: string;
}
