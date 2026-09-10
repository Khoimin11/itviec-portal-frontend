const validationPassword = (password: string): IValidationPassword => ({
  has12Chars: password.length >= 12,
  hasSymbol: /[^a-zA-Z0-9\s]/u.test(password),
  hasNumber: /[0-9]/.test(password),
  hasUppercase: /[A-Z]/.test(password),
  hasLowercase: /[a-z]/.test(password),
});

export default validationPassword;
