//strong-password rule required by the A2 spec:
//at least 6 characters, >=1 uppercase, >=1 lowercase, >=1 special character.
//should be IN SYNC with the frontend validator (frontend/src/utils/validation.ts).
export const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{6,}$/;

export function isStrongPassword(password: string): boolean {
  return STRONG_PASSWORD_REGEX.test(password);
}

export const PASSWORD_RULE_MESSAGE =
  "Password must be at least 6 characters and include an uppercase letter, a lowercase letter, and a special character.";
