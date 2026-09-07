//frontend validators. The password rule MIRRORS backend/src/utils/password.ts -
//keep the two in sync. Used by the sign-in and sign-up forms.
export const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{6,}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_RULE_MESSAGE =
  "Password must be at least 6 characters and include an uppercase letter, a lowercase letter, and a special character.";

export function validateEmail(email: string): string | null {
  if (!email) return "Email is required";
  if (!EMAIL_REGEX.test(email)) return "Please enter a valid email address";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Password is required";
  if (!STRONG_PASSWORD_REGEX.test(password)) return PASSWORD_RULE_MESSAGE;
  return null;
}
