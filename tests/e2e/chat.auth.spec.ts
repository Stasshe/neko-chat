import { expect, test } from "@playwright/test";

test.describe("チャット画面", () => {
  // 同じユーザーとDBを使うため、1件ずつ順番に実行する
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/chat");

    const input = page.locator("#chat-message");

    await expect(input).toBeVisible();
    await expect(input).toBeEnabled({
      timeout: 15_000,
    });
  });

  test("メッセージ入力欄と送信ボタンを表示する", async ({ page }) => {
    const input = page.locator("#chat-message");
    const form = page.locator("form").filter({ has: input });
    const sendButton = form.locator('button[type="submit"]');

    await expect(input).toHaveAttribute("maxlength", "30");
    await expect(sendButton).toBeVisible();
    await expect(sendButton).toBeDisabled();
  });

  test("空白だけでは送信ボタンが有効にならない", async ({ page }) => {
    const input = page.locator("#chat-message");
    const form = page.locator("form").filter({ has: input });
    const sendButton = form.locator('button[type="submit"]');

    await input.fill("   ");

    await expect(sendButton).toBeDisabled();
  });

  test("メッセージを30文字までに制限する", async ({ page }) => {
    const input = page.locator("#chat-message");
    const form = page.locator("form").filter({ has: input });
    const sendButton = form.locator('button[type="submit"]');

    await input.fill("あ".repeat(31));

    await expect(input).toHaveValue("あ".repeat(30));
    await expect(sendButton).toBeEnabled();
  });

  test("入力したメッセージを送信してチャットに表示できる", async ({ page }) => {
    const input = page.locator("#chat-message");
    const form = page.locator("form").filter({ has: input });
    const sendButton = form.locator('button[type="submit"]');
    const message = `E2Eチャット${Date.now()}`.slice(0, 30);

    await input.fill(message);
    await expect(sendButton).toBeEnabled();
    await sendButton.click();

    await expect(input).toHaveValue("");
    await expect(page.getByText(message)).toBeVisible();
  });
});
