import { expect, test } from "@playwright/test";

test.describe("投稿画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/compose");
    await expect(page.locator("#post-body")).toBeVisible();
    await expect(page.locator(".send-button")).toBeEnabled();
  });

  test("投稿入力欄と感情選択を表示する", async ({ page }) => {
    await expect(page.locator("#post-body")).toHaveAttribute("maxlength", "30");
    await expect(page.locator('input[name="emotion"]')).toHaveCount(4);
    await expect(page.locator('input[name="emotion"][value="neutral"]')).toBeChecked();
    await expect(page.locator(".character-count")).toHaveText("0/30");
  });

  test("空の投稿を送信できない", async ({ page }) => {
    await page.locator(".send-button").click();

    await expect(page.locator(".status--error")).toBeVisible();
    await expect(page).toHaveURL(/\/compose$/);
  });

  test("空白だけの投稿を送信できない", async ({ page }) => {
    await page.locator("#post-body").fill("   ");
    await page.locator(".send-button").click();

    await expect(page.locator(".status--error")).toBeVisible();
    await expect(page).toHaveURL(/\/compose$/);
  });

  test("投稿本文を30文字までに制限する", async ({ page }) => {
    await page.locator("#post-body").fill("あ".repeat(31));

    await expect(page.locator("#post-body")).toHaveValue("あ".repeat(30));
    await expect(page.locator(".character-count")).toHaveText("30/30");
  });

  test("投稿の感情を変更できる", async ({ page }) => {
    const positive = page.locator('input[name="emotion"][value="positive"]');

    await positive.check();

    await expect(positive).toBeChecked();
    await expect(page.locator('input[name="emotion"][value="neutral"]')).not.toBeChecked();
  });

  test("入力した内容を投稿してホームに表示できる", async ({ page }) => {
    const body = `E2E投稿${Date.now()}`.slice(0, 30);

    await page.locator("#post-body").fill(body);
    await page.locator('input[name="emotion"][value="positive"]').check();
    await page.locator(".send-button").click();

    await expect(page).toHaveURL(/\/home$/);
    await expect(page.locator(".scene-post").filter({ hasText: body })).toBeVisible();
  });
});
