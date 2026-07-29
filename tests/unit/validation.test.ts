import { describe, it, expect } from "vitest";
import { generatePassword } from "../../lib/utils";
import { isIutEmail, isStrongPassword } from "@/lib/validation";

const CHARSET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";

describe("Utilities & validation", () => {
  it("TC-10: generatePassword produces passwords of requested length from the allowed charset", () => {
    expect(generatePassword()).toHaveLength(12);
    expect(generatePassword(20)).toHaveLength(20);
    for (let i = 0; i < 20; i++) {
      const pw = generatePassword(16);
      for (const ch of pw) {
        expect(CHARSET).toContain(ch);
      }
    }
    // vanishingly unlikely to collide if actually random
    expect(generatePassword(16)).not.toBe(generatePassword(16));
  });

  it("TC-11: strong password policy accepts strong passwords and rejects weak ones", () => {
    expect(isStrongPassword("Nafis*123")).toBe(true);
    expect(isStrongPassword("Str0ng!Pass")).toBe(true);

    expect(isStrongPassword("Ab1!x")).toBe(false); // too short
    expect(isStrongPassword("alllower1!")).toBe(false); // no uppercase
    expect(isStrongPassword("ALLUPPER1!")).toBe(false); // no lowercase
    expect(isStrongPassword("NoDigits!!")).toBe(false); // no digit
    expect(isStrongPassword("NoSpecial12")).toBe(false); // no special char
    expect(isStrongPassword("")).toBe(false);
  });

  it("TC-12: IUT email validation accepts only @iut-dhaka.edu addresses", () => {
    expect(isIutEmail("nafisreza@iut-dhaka.edu")).toBe(true);
    expect(isIutEmail("first.last+tag@iut-dhaka.edu")).toBe(true);

    expect(isIutEmail("someone@gmail.com")).toBe(false);
    expect(isIutEmail("someone@iut-dhaka.edu.evil.com")).toBe(false);
    expect(isIutEmail("someone@iutXdhaka.edu")).toBe(false);
    expect(isIutEmail("@iut-dhaka.edu")).toBe(false);
    expect(isIutEmail("")).toBe(false);
  });
});
