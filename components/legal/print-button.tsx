"use client";

import { Printer } from "@phosphor-icons/react/ssr";

/** Nút in trang, cũng là cách lưu trang thành PDF trên trình duyệt. */
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 hover:bg-slate-50"
    >
      <Printer className="size-4 text-slate-500" />
      In / lưu PDF
    </button>
  );
}
