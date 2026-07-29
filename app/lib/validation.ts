// Shared validation rules, used by the login page and change-password API.

export const IUT_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@iut-dhaka\.edu$/;

export const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

export function isIutEmail(email: string): boolean {
  return IUT_EMAIL_REGEX.test(email);
}

export function isStrongPassword(password: string): boolean {
  return STRONG_PASSWORD_REGEX.test(password);
}
