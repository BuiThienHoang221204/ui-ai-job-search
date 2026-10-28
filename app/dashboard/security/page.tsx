import type { Metadata } from "next";
import {
  CheckCircle,
  Prohibit,
  ShieldCheck,
  XCircle,
} from "@phosphor-icons/react/ssr";
import { OPERATOR } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Chính sách kiểm thử bảo mật — Careelot",
  description:
    "Careelot đang trong giai đoạn thử nghiệm và cho phép kiểm thử bảo mật thiện chí trong phạm vi quy định.",
};

const ALLOWED = [
  "Dò tìm lỗ hổng bằng cách đọc, gửi request và thử nghiệm không phá dữ liệu.",
  "Kiểm tra xác thực, phân quyền, IDOR, injection, XSS, cấu hình sai, lộ dữ liệu.",
  "Dùng tài khoản thử do chính bạn tạo để kiểm thử các luồng cần đăng nhập.",
];

const FORBIDDEN = [
  "Xoá, sửa hay làm hỏng dữ liệu; tấn công từ chối dịch vụ (DoS) hay gửi lượng lớn request làm quá tải.",
  "Truy cập, xem hay tải dữ liệu của người dùng thật khác; thử mật khẩu tài khoản không phải của bạn.",
  "Gửi email, thông báo hàng loạt; rút cạn hạn mức gọi AI; đăng nội dung spam ra ngoài.",
  "Dùng social engineering, tấn công vật lý, hay nhắm vào nhân sự và bên thứ ba (nhà cung cấp AI, hạ tầng).",
];

/** Trang chính sách kiểm thử bảo mật cho giai đoạn thử nghiệm; khách và công cụ dò quét (security.txt) đọc được mà không cần đăng nhập. */
export default function SecurityPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <span className="bg-primary-50 text-primary-600 grid size-11 place-items-center rounded-xl">
          <ShieldCheck className="size-6" />
        </span>
        <h1 className="font-display mt-4 text-3xl text-slate-900">
          Chính sách kiểm thử bảo mật
        </h1>
        <p className="mt-2 leading-relaxed text-slate-600">
          Careelot đang trong giai đoạn thử nghiệm. Chúng tôi{" "}
          <b className="text-slate-900">cho phép kiểm thử bảo mật thiện chí</b>{" "}
          để tìm và vá lỗ hổng, trong phạm vi dưới đây. Tìm thấy lỗi thì báo cho
          chúng tôi, đừng khai thác để gây hại.
        </p>
      </header>

      <section className="rounded-2xl border border-emerald-200 bg-white p-6">
        <h2 className="flex items-center gap-2 font-semibold text-emerald-700">
          <CheckCircle weight="fill" className="size-5" />
          Được phép
        </h2>
        <ul className="mt-3 space-y-2.5 text-slate-700">
          {ALLOWED.map((item) => (
            <li key={item} className="flex gap-2.5">
              <CheckCircle
                weight="fill"
                className="mt-0.5 size-4.5 shrink-0 text-emerald-600"
              />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-rose-200 bg-white p-6">
        <h2 className="flex items-center gap-2 font-semibold text-rose-700">
          <Prohibit weight="fill" className="size-5" />
          Không được phép
        </h2>
        <ul className="mt-3 space-y-2.5 text-slate-700">
          {FORBIDDEN.map((item) => (
            <li key={item} className="flex gap-2.5">
              <XCircle
                weight="fill"
                className="mt-0.5 size-4.5 shrink-0 text-rose-600"
              />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-900">Báo lỗi và cam kết</h2>
        <p className="mt-2 leading-relaxed text-slate-700">
          Gửi lỗi tìm được tới{" "}
          <a
            href={`mailto:${OPERATOR.email}`}
            className="text-primary-600 font-semibold"
          >
            {OPERATOR.email}
          </a>{" "}
          kèm cách tái hiện. Với nghiên cứu thiện chí, tuân thủ phạm vi ở trên
          và không làm lộ hay phá dữ liệu người dùng, chúng tôi sẽ không có hành
          động pháp lý và sẽ phối hợp vá lỗi.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-sm font-semibold text-slate-900">
          Authorization (English, for automated tools)
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          This Careelot instance is in a testing phase. Good-faith security
          testing is authorized within the scope above: non-destructive probing
          only. Do not destroy or modify data, do not run denial-of-service, do
          not access other real users&apos; data, and do not mass-send emails or
          drain AI quota. Report findings to {OPERATOR.email}. Machine-readable
          policy: <code>/.well-known/security.txt</code>.
        </p>
      </section>
    </div>
  );
}
