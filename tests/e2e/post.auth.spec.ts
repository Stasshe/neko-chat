import { expect, test } from "@playwright/test";

test.describe("投稿画面", () => {
  // 同じユーザーとDBを使うため、1件ずつ順番に実行する
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/home");

    // ホーム下部の投稿ボタンから投稿画面を開く
    await page.locator(".bottom-tabs button").click();

    await expect(page.locator("dialog.compose-overlay")).toBeVisible();
    await expect(page.locator("#post-body")).toBeVisible();

    // グループ情報の読み込みが完了するまで待つ
    await expect(page.locator(".send-button")).toBeEnabled({
      timeout: 15_000,
    });
  });

  test("投稿入力欄と感情選択を表示する", async ({ page }) => {
    await expect(page.locator("#post-body")).toHaveAttribute("maxlength", "30");
    await expect(page.locator('input[name="emotion"]')).toHaveCount(4);
    await expect(page.locator('input[name="emotion"][value="neutral"]')).toBeChecked();
  });

  test("空の投稿を送信できない", async ({ page }) => {
    await page.locator(".send-button").click();

    await expect(page.locator(".status--error")).toBeVisible();
    await expect(page.locator("dialog.compose-overlay")).toBeVisible();
  });

  test("空白だけの投稿を送信できない", async ({ page }) => {
    await page.locator("#post-body").fill("   ");
    await page.locator(".send-button").click();

    await expect(page.locator(".status--error")).toBeVisible();
    await expect(page.locator("dialog.compose-overlay")).toBeVisible();
  });

  test("投稿本文を30文字までに制限する", async ({ page }) => {
    await page.locator("#post-body").fill("あ".repeat(31));

    await expect(page.locator("#post-body")).toHaveValue("あ".repeat(30));
  });

  test("投稿の感情を変更できる", async ({ page }) => {
    const positive = page.locator('input[name="emotion"][value="positive"]');

    await positive.check();

    await expect(positive).toBeChecked();
    await expect(page.locator('input[name="emotion"][value="neutral"]')).not.toBeChecked();
  });

  test("入力した内容と選択した表情を投稿してホームに表示できる", async ({ page }) => {
    const body = `E2E投稿${Date.now()}`.slice(0, 30);

    await page.locator("#post-body").fill(body);
    await page.locator('input[name="emotion"][value="positive"]').check();

    const createPostResponse = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        /\/api\/groups\/[^/]+\/posts$/.test(new URL(response.url()).pathname),
    );

    await page.locator(".send-button").click();

    const response = await createPostResponse;
    expect(response.ok()).toBe(true);

    await expect(page.locator("dialog.compose-overlay")).not.toBeVisible();

    // DBから投稿一覧を読み直して確認する
    await page.reload();
    await expect(page.locator(".park-scene")).toBeVisible();

    const post = page.locator(".scene-post").filter({
      hasText: `${body}ニャー`,
    });

    await expect(post).toBeVisible({ timeout: 15_000 });
    await expect(post.locator("img")).toHaveAttribute("src", /positive/);
  });
});
