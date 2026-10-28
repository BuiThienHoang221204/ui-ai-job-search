import type { Page } from "@playwright/test";

/**
 * Chờ ảnh tải xong TRƯỚC KHI chụp.
 *
 * Vì sao cần: logo công ty đến từ CDN của portal (`images.vietnamworks.com`), và
 * `loading="lazy"`. Chụp ngay sau khi bảng hiện thì ảnh chưa về, và trên ảnh chụp
 * chúng là những vòng tròn TRẮNG RỖNG — trông y hệt một lỗi thật ("component
 * không lùi về chữ viết tắt"). Đã mất một vòng đi tìm lỗi không tồn tại vì đúng
 * chuyện này: đo lại sau 3 giây thì mọi ảnh đều `complete` với naturalWidth
 * 170–877.
 *
 * `limitMs` để một CDN treo không kéo cả bộ test theo: hết hạn thì chụp như đang
 * có, vì một ảnh chụp muộn còn hơn một test đỏ vì mạng.
 */
export async function waitForImages(page: Page, limitMs = 8000): Promise<void> {
  await page.evaluate(async (limit: number) => {
    const pending = [...document.images].filter((img) => !img.complete);
    if (pending.length === 0) return;

    const settled = Promise.all(
      pending.map(
        (img) =>
          new Promise<void>((resolve) => {
            img.addEventListener("load", () => resolve(), { once: true });
            img.addEventListener("error", () => resolve(), { once: true });
          }),
      ),
    );

    await Promise.race([
      settled,
      new Promise<void>((resolve) => setTimeout(resolve, limit)),
    ]);
  }, limitMs);
}

/** Đăng nhập qua modal: `/login` chuyển về trang chủ và mở modal, xong thì chờ modal đóng (phiên đã nạp). */
export async function logIn(
  page: Page,
  email: string,
  password = "Demo@12345",
): Promise<void> {
  await page.goto("/login");
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Email").fill(email);
  await dialog.getByLabel("Mật khẩu").fill(password);
  await dialog.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await dialog.waitFor({ state: "hidden" });
}
