import { validateEmail, validatePassword } from "@/utils/validation";

describe("validateEmail", () => {
  it("rejects an empty email", () => expect(validateEmail("")).toBeTruthy());
  it("rejects a malformed email", () => expect(validateEmail("not-an-email")).toBeTruthy());
  it("accepts a valid email", () => expect(validateEmail("hirer@vv.com")).toBeNull());
});

describe("validatePassword (strong-password rule)", () => {
  it("rejects too short", () => expect(validatePassword("Aa!")).toBeTruthy());
  it("rejects missing uppercase", () => expect(validatePassword("password!")).toBeTruthy());
  it("rejects missing special char", () => expect(validatePassword("Password1")).toBeTruthy());
  it("accepts a strong password", () => {
    expect(validatePassword("Passw0rd!")).toBeNull();
    expect(validatePassword("Aa!xyz")).toBeNull();
  });
});
