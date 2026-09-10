import assert from "node:assert/strict";
import test from "node:test";
import { schema } from "../app/pages/applicant/Register/schema.ts";
import validationPassword from "../app/constants/validationPassword.ts";

const registrationSchema = schema((key) => key);
const valid = {
  username: "Nguyễn Văn An",
  email: "candidate@example.com",
  password: "StrongPassword123!",
  termsAccepted: true,
};

test("normalizes name and email, preserving password", () => {
  const result = registrationSchema.parse({
    ...valid, username: "  Nguyễn Văn An  ", email: " Candidate@Example.com ",
  });
  assert.equal(result.username, valid.username);
  assert.equal(result.email, valid.email);
  assert.equal(result.password, valid.password);
});

test("requires name, valid email, password strength and consent", () => {
  const invalid = [
    ["username", "   "], ["email", "invalid"],
    ["password", "Short123!"], ["password", "lowercase123!"],
    ["password", "UPPERCASE123!"], ["password", "PasswordOnly!"],
    ["password", "PasswordOnly123"], ["termsAccepted", false],
  ];
  for (const [field, value] of invalid) {
    const result = registrationSchema.safeParse({ ...valid, [field]: value });
    assert.equal(result.success, false, field);
    assert.ok(result.error.issues.some((issue) => issue.path[0] === field));
  }
});

test("enforces bcrypt byte limit for Unicode passwords", () => {
  assert.equal(registrationSchema.safeParse({
    ...valid, password: "Aa1!" + "é".repeat(35),
  }).success, false);
  assert.equal(registrationSchema.safeParse({
    ...valid, password: "Aa1!" + "é".repeat(34),
  }).success, true);
});

test("password checklist agrees with schema complexity rules", () => {
  for (const password of ["StrongPassword123!", 'StrongPassword123"', "Short123!", "PasswordOnly123"]) {
    const checks = Object.values(validationPassword(password)).every(Boolean);
    assert.equal(registrationSchema.safeParse({ ...valid, password }).success, checks);
  }
});
