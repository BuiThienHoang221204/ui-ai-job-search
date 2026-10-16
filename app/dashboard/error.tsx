"use client";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

/** Lỗi khi dựng một trang trong dashboard: giữ khung app, cho bấm thử lại thay vì sập cả trang. */
export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl space-y-4 py-10">
      <Alert tone="danger">
        Trang này gặp lỗi khi hiển thị. Hãy thử lại; nếu vẫn lỗi, tải lại trang.
      </Alert>
      <Button onClick={reset}>Thử lại</Button>
    </div>
  );
}
