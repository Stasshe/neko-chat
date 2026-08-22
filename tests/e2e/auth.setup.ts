import { expect, test as setup } from "@playwright/test";

const authFile = "playwright/.auth/user.json";

setup("テストユーザーでログインする", async ({ page }) => {
  const email = `e2e-${Date.now()}@example.com`;
  const password = "e2e-password";

  await page.goto("/");

  // ログイン画面から新規登録モードへ切り替える
  await page.locator('form button[type="button"]').click();

  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.locator('form button[type="submit"]').click();

  // 登録とログインが完了すると、トップ画面以外へ移動する
  await expect(page).not.toHaveURL("http://localhost:3000/");

  // ログイン状態を後続のE2Eテストで再利用する
  await page.context().storageState({ path: authFile });
});
