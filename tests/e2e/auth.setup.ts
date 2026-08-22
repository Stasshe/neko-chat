import { expect, test as setup } from "@playwright/test";

const authFile = "playwright/.auth/user.json";

setup("投稿可能なテストユーザーを準備する", async ({ page }) => {
  const email = `e2e-${Date.now()}@example.com`;
  const password = "e2e-password";
  const username = "E2Eねこ";

  // アカウントを作成する
  await page.goto("/");
  await page.locator('form button[type="button"]').click();
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  const signupResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/auth/v1/signup") && response.request().method() === "POST",
  );

  await page.locator('form button[type="submit"]').click();

  const signupResponse = await signupResponsePromise;
  expect(signupResponse.ok()).toBe(true);

  // 登録成功後にホーム画面へ移動することも確認する
  await expect(page).toHaveURL(/\/home$/);

  await page.goto("/onboarding/profile");
  await page.locator("#username").fill(username);
  await page.locator('form button[type="submit"]').click();
  await expect(page).toHaveURL(/\/onboarding\/mode$/);

  // 一人モードのグループを作成する
  await page.locator(".mode-list button").first().click();
  await expect(page).toHaveURL(/\/onboarding\/cat$/);

  // 猫の種類を選択する
  await page.locator(".cat-grid button").nth(2).click();
  await page.locator(".primary-button").click();
  await expect(page).toHaveURL(/\/home$/);

  // 操作説明がE2Eテストを邪魔しないようにする
  await page.evaluate(() => {
    window.localStorage.setItem("neko-chat.tour-stage", "done");
  });

  // ログイン状態とlocalStorageを保存する
  await page.context().storageState({ path: authFile });
});
