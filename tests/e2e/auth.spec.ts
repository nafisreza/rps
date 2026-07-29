import { test, expect, Page } from "@playwright/test";

const ADMIN_EMAIL = "admin@iut-dhaka.edu";
const ADMIN_PASSWORD = "admin123";
const STUDENT_EMAIL = "nafisreza@iut-dhaka.edu";
const STUDENT_PASSWORD = "Nafis*123";

async function fillLogin(page: Page, email: string, password: string) {
  await page.goto("/");
  await page.getByPlaceholder("Enter your email").fill(email);
  await page.getByPlaceholder("Enter your password").fill(password);
  await page.getByRole("button", { name: "Login" }).click();
}

test("TC-28: login page renders branding and the login form", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "IUT Result Processing System" })
  ).toBeVisible();
  await expect(page.getByPlaceholder("Enter your email")).toBeVisible();
  await expect(page.getByPlaceholder("Enter your password")).toBeVisible();
  await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Forgot password?" })).toBeVisible();
});

test("TC-29: login with a non-IUT email is rejected client-side", async ({ page }) => {
  await fillLogin(page, "someone@gmail.com", "whatever123");
  await expect(page.getByText("Please enter your IUT email.")).toBeVisible();
  await expect(page).toHaveURL("/");
  // the form clears itself after the rejection
  await expect(page.getByPlaceholder("Enter your email")).toHaveValue("");
});

test("TC-30: login with invalid credentials shows an error toast", async ({ page }) => {
  await fillLogin(page, ADMIN_EMAIL, "wrong-password");
  await expect(page.getByText("Incorrect email or password")).toBeVisible();
  await expect(page).toHaveURL("/");
});

test("TC-31: admin login redirects to the admin dashboard", async ({ page }) => {
  await fillLogin(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  await page.waitForURL("**/admin", { timeout: 30_000 });
  expect(new URL(page.url()).pathname).toBe("/admin");
});

test("TC-32: unauthenticated access to the admin area redirects to login", async ({ page }) => {
  await page.goto("/admin");
  await page.waitForURL((url) => url.pathname === "/", { timeout: 30_000 });
  await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
});

test("TC-33: first-login student is forced to the change-password page", async ({ page }) => {
  await fillLogin(page, STUDENT_EMAIL, STUDENT_PASSWORD);
  await page.waitForURL("**/auth/change-password", { timeout: 30_000 });
  expect(new URL(page.url()).pathname).toBe("/auth/change-password");
});
