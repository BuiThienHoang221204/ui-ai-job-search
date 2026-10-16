"use client";

/** Lỗi ở chính layout gốc: thay cả trang nên phải tự có thẻ html/body và không dùng component của app. */
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="vi">
      <body style={{ fontFamily: "sans-serif", padding: 40 }}>
        <p>Ứng dụng gặp lỗi ngoài dự kiến.</p>
        <button type="button" onClick={reset}>
          Thử lại
        </button>
      </body>
    </html>
  );
}
