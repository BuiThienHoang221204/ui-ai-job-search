import { Gift } from "@phosphor-icons/react/ssr";

/** Dòng báo người đăng ký đến từ lời mời của bạn bè. */
export function ReferralNotice() {
  return (
    <p className="border-primary-100 bg-primary-50 text-primary-800 flex gap-2 rounded-xl border px-3 py-2 text-xs">
      <Gift className="size-4 shrink-0" weight="fill" />
      Bạn được mời: đăng ký và chọn ngành nghề để cả bạn và người mời được thêm
      15 phút luyện phỏng vấn bằng giọng nói.
    </p>
  );
}
