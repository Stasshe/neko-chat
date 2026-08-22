import { expect, test } from "@playwright/test";

test.describe("ログイン画面", () => {
  test("メールアドレスとパスワードの入力欄を表示する", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.locator("#email")).toHaveAttribute("type", "email");
    await expect(page.locator("#password")).toHaveAttribute("type", "password");
  });

  test("パスワードには6文字以上を要求する", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("#password")).toHaveAttribute("minlength", "6");
  });

  test("未ログインでホームを開くとログイン画面へ戻る", async ({ page }) => {
    await page.goto("/home");

    await expect(page).toHaveURL("http://localhost:3000/");
    await expect(page.locator("#email")).toBeVisible();
  });

  test("間違った認証情報ではログインできない", async ({ page }) => {
    await page.goto("/");

    await page.locator("#email").fill("unknown@example.com");
    await page.locator("#password").fill("wrong-password");
    await page.locator('form button[type="submit"]').click();

    await expect(page.locator(".text-destructive")).toBeVisible();
    await expect(page).toHaveURL("http://localhost:3000/");
  });
});
