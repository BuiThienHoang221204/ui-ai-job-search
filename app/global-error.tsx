"use client";

const BRAND = "#4338ca";

/** Lỗi ở chính layout gốc: thay cả trang nên phải tự có thẻ html/body, style viết tại chỗ và không dùng component của app. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="vi">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          background: "#f8fafc",
          color: "#0f172a",
          fontFamily: "system-ui, 'Segoe UI', sans-serif",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 440 }}>
          <p style={{ margin: "0 0 28px", fontSize: 22, fontWeight: 800, color: BRAND }}>
            Careelot
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element -- layout gốc đang hỏng nên không dựa vào next/image */}
          <img
            src="/icons/warning-sign.png"
            alt=""
            width={144}
            height={144}
            style={{ display: "block", margin: "0 auto 20px" }}
          />
          <h1 style={{ margin: "0 0 8px", fontSize: 22 }}>
            Ứng dụng gặp lỗi ngoài dự kiến
          </h1>
          <p style={{ margin: "0 0 24px", fontSize: 14, color: "#64748b" }}>
            Tải lại trang thường sẽ khắc phục được. Nếu lỗi lặp lại, hãy thử lại
            sau ít phút.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button
              type="button"
              onClick={reset}
              style={{
                height: 40,
                padding: "0 18px",
                border: 0,
                borderRadius: 10,
                background: BRAND,
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Thử lại
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- layout gốc đang hỏng nên dùng thẻ a để nạp lại cả trang */}
            <a
              href="/"
              style={{
                height: 40,
                lineHeight: "40px",
                padding: "0 18px",
                border: "1px solid #e2e8f0",
                borderRadius: 10,
                color: "#0f172a",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Về trang chủ
            </a>
          </div>
          {error.digest && (
            <p style={{ marginTop: 22, fontSize: 12, color: "#94a3b8" }}>
              Mã lỗi: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
