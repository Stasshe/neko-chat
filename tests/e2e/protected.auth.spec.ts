import { expect, test } from "@playwright/test";

test.describe("ログイン済みユーザー", () => {
  test("保存したログイン状態でホーム画面を開ける", async ({ page }) => {
    await page.goto("/home");

    await expect(page).toHaveURL(/\/home$/);
    await expect(page.locator("main")).toBeVisible();
  });
});
