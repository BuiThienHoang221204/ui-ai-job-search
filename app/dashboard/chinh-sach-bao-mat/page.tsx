import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowsClockwise,
  Briefcase,
  Clock,
  Cookie,
  Database,
  EnvelopeSimple,
  FileText,
  Gauge,
  Globe,
  Handshake,
  Info,
  LockKey,
  Prohibit,
  Robot,
  ShareNetwork,
  ShieldCheck,
  Target,
  Trash,
  UserCircle,
} from "@phosphor-icons/react/ssr";
import { IconBadge } from "@/components/legal/icon-badge";
import { LegalPage } from "@/components/legal/legal-page";
import { OPERATOR } from "@/lib/legal";
import type { LegalSection } from "@/types";

export const metadata: Metadata = {
  title: "Chính sách bảo mật — Careelot",
  description:
    "Careelot thu thập dữ liệu gì, dùng để làm gì, chia sẻ cho ai, lưu bao lâu và cách bạn xem, sửa, xoá dữ liệu của mình.",
  robots: { index: true, follow: true },
};

const CARD = "rounded-xl border border-slate-200 p-4";
const NOTE =
  "mt-3 flex gap-2.5 rounded-xl bg-amber-50 px-3.5 py-3 text-sm text-slate-900";

const SUMMARY = [
  {
    icon: Prohibit,
    tone: "emerald" as const,
    title: "Không bán dữ liệu",
    text: "Không bán, không cho thuê, không dùng để quảng cáo.",
  },
  {
    icon: Robot,
    tone: "primary" as const,
    title: "AI đọc CV của bạn",
    text: "Chữ của CV được gửi tới nhà cung cấp AI để phân tích.",
  },
  {
    icon: Trash,
    tone: "rose" as const,
    title: "Xoá bất cứ lúc nào",
    text: "Một nút trong trang Tài khoản, dữ liệu mất ngay.",
  },
  {
    icon: Globe,
    tone: "sky" as const,
    title: "Máy chủ ở nước ngoài",
    text: "Dịch vụ AI và lưu trữ đặt ngoài Việt Nam.",
  },
  {
    icon: Clock,
    tone: "amber" as const,
    title: "Nhật ký giữ 90 ngày",
    text: "Nhật ký gọi AI tự xoá sau 90 ngày.",
  },
  {
    icon: ShieldCheck,
    tone: "emerald" as const,
    title: "Khách không bị lưu",
    text: "Phân tích CV khi chưa đăng nhập không lưu chữ của CV.",
  },
];

const COLLECTED = [
  {
    icon: UserCircle,
    title: "Tài khoản",
    text: "Email, tên, mật khẩu đã mã hoá một chiều, mã Google nếu đăng nhập bằng Google, thời điểm bạn đồng ý điều khoản.",
    when: "Khi đăng ký",
  },
  {
    icon: FileText,
    title: "Hồ sơ và CV",
    text: "File CV; số điện thoại, nơi ở, kinh nghiệm, học vấn, kỹ năng, mục tiêu nghề nghiệp, mức lương hiện tại và mong muốn, quốc tịch, giấy phép lao động (nếu bạn điền).",
    when: "Khi tải CV hoặc sửa hồ sơ",
  },
  {
    icon: Briefcase,
    title: "Tài liệu và luyện tập",
    text: "CV, thư xin việc đã tạo; câu trả lời và nhận xét khi luyện phỏng vấn; tin đã lưu, đơn ứng tuyển, công ty theo dõi; giờ học và địa chỉ nhận thông báo.",
    when: "Khi bạn dùng tính năng",
  },
  {
    icon: Gauge,
    title: "Kỹ thuật",
    text: "Nhật ký mỗi lượt gọi AI; với khách dùng thử, chỉ lưu mã băm của địa chỉ IP để đếm lượt.",
    when: "Tự động",
  },
];

const VENDORS = [
  {
    name: "Nhà cung cấp AI",
    kind: "Google Gemini, OpenRouter, Groq…",
    gets: "Chữ của CV, hồ sơ, tin tuyển dụng, câu trả lời và âm thanh phỏng vấn — để phân tích, viết lại, chấm điểm, phỏng vấn thử.",
  },
  { name: "Cloudflare R2", kind: "Lưu trữ", gets: "File CV bạn tải lên." },
  {
    name: "Google",
    kind: "Đăng nhập",
    gets: "Thông tin đăng nhập, nếu bạn chọn Google.",
  },
  {
    name: "Dịch vụ thông báo của trình duyệt",
    kind: "Thông báo đẩy",
    gets: "Nội dung thông báo, khi bạn bật.",
  },
  {
    name: `Vercel, ${OPERATOR.backendHost}`,
    kind: "Hạ tầng",
    gets: "Dữ liệu đi qua khi bạn dùng trang.",
  },
];

const RETENTION = [
  {
    when: "Tới khi bạn xoá",
    what: "Tài khoản, hồ sơ, CV, tài liệu. Xoá là mất ngay; bản sao lưu của nhà cung cấp hạ tầng tự hết hạn trong 30 ngày.",
  },
  { when: "90 ngày", what: "Nhật ký lượt gọi AI; bộ đếm lượt của khách." },
  {
    when: "Không lưu",
    what: "Chữ của CV khi phân tích lúc chưa đăng nhập; âm thanh phỏng vấn bằng giọng nói.",
  },
];

const SECTIONS: LegalSection[] = [
  {
    id: "ben-xu-ly",
    title: "Ai xử lý dữ liệu",
    icon: UserCircle,
    tone: "primary",
    short:
      "một cá nhân vận hành Careelot và chịu trách nhiệm về dữ liệu của bạn.",
    body: (
      <p>
        Careelot do cá nhân <b>{OPERATOR.name}</b> ({OPERATOR.city}) vận hành và
        là bên kiểm soát dữ liệu cá nhân của bạn. Mọi yêu cầu về dữ liệu, gửi
        tới <b>{OPERATOR.email}</b>; chúng tôi trả lời trong 72 giờ làm việc.
      </p>
    ),
  },
  {
    id: "du-lieu",
    title: "Dữ liệu thu thập",
    icon: Database,
    tone: "primary",
    short:
      "chỉ những gì bạn nhập hoặc tải lên, cộng nhật ký kỹ thuật tối thiểu.",
    body: (
      <>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {COLLECTED.map((item) => (
            <div key={item.title} className={CARD}>
              <p className="flex items-center gap-2 font-semibold text-slate-900">
                <item.icon className="size-4.5 text-slate-500" />
                {item.title}
              </p>
              <p className="mt-1 text-sm">{item.text}</p>
              <p className="mt-2 text-xs text-slate-500">{item.when}</p>
            </div>
          ))}
        </div>
        <p className={NOTE}>
          <Info className="mt-0.5 size-4.5 shrink-0 text-amber-600" />
          <span>
            Phỏng vấn bằng giọng nói: âm thanh truyền thẳng tới dịch vụ AI,{" "}
            <b>không lưu</b> trên máy chủ của chúng tôi.
          </span>
        </p>
      </>
    ),
  },
  {
    id: "muc-dich",
    title: "Dùng để làm gì",
    icon: Target,
    tone: "emerald",
    short:
      "để các tính năng chạy được cho chính bạn; không quảng cáo, không bán.",
    body: (
      <>
        <ul className="list-disc space-y-1 pl-5">
          <li>Tìm và chấm độ phù hợp của tin tuyển dụng với hồ sơ của bạn.</li>
          <li>
            Phân tích CV, gợi ý viết lại, tạo CV và thư xin việc theo từng tin.
          </li>
          <li>Luyện phỏng vấn và lập lộ trình học.</li>
          <li>Gửi thông báo tin mới và nhắc học, khi bạn bật.</li>
          <li>
            Giữ hệ thống an toàn: chống lạm dụng, giới hạn lượt AI, sửa lỗi.
          </li>
        </ul>
        <p className="mt-2.5">
          Căn cứ xử lý là <b>sự đồng ý</b> của bạn khi đăng ký. Bạn rút lại sự
          đồng ý bằng cách xoá tài khoản.
        </p>
      </>
    ),
  },
  {
    id: "chia-se",
    title: "Chia sẻ cho ai",
    icon: ShareNetwork,
    tone: "sky",
    short: "chỉ các dịch vụ giúp Careelot chạy, và chỉ phần dữ liệu họ cần.",
    body: (
      <>
        <div className="grid gap-2">
          {VENDORS.map((vendor) => (
            <div
              key={vendor.name}
              className="grid gap-1 rounded-xl border border-slate-200 px-4 py-3 text-sm sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-4"
            >
              <span>
                <b className="block">{vendor.name}</b>
                <span className="text-xs text-slate-500">{vendor.kind}</span>
              </span>
              <span>{vendor.gets}</span>
            </div>
          ))}
        </div>
        <p className={NOTE}>
          <Globe className="mt-0.5 size-4.5 shrink-0 text-amber-600" />
          <span>
            <b>Dữ liệu ra nước ngoài:</b> các dịch vụ trên đặt máy chủ ngoài
            Việt Nam. Chúng tôi làm thủ tục chuyển dữ liệu xuyên biên giới theo
            quy định, và chỉ cung cấp dữ liệu cho cơ quan nhà nước khi có yêu
            cầu đúng pháp luật.
          </span>
        </p>
      </>
    ),
  },
  {
    id: "luu-tru",
    title: "Lưu bao lâu",
    icon: Clock,
    tone: "amber",
    short: "tới khi bạn xoá tài khoản; nhật ký kỹ thuật 90 ngày.",
    body: (
      <dl>
        {RETENTION.map((row) => (
          <div
            key={row.when}
            className="grid gap-1 border-t border-dashed border-slate-200 py-3 first:border-t-0 first:pt-0 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4"
          >
            <dt className="font-semibold text-slate-900">{row.when}</dt>
            <dd>{row.what}</dd>
          </div>
        ))}
      </dl>
    ),
  },
  {
    id: "quyen",
    title: "Quyền của bạn",
    icon: Handshake,
    tone: "emerald",
    short: "xem, sửa, xoá được ngay trong app; việc khác gửi email.",
    body: (
      <>
        <div className="grid gap-2.5 sm:grid-cols-3">
          <div className={CARD}>
            <IconBadge icon={FileText} tone="primary" className="size-8" />
            <p className="mt-2 font-semibold text-slate-900">Xem và sửa</p>
            <p className="text-sm">Trong trang Hồ sơ và Tài khoản.</p>
            <Link
              href="/dashboard/profile"
              className="text-primary-600 mt-1.5 inline-block text-sm font-semibold"
            >
              Mở Hồ sơ →
            </Link>
          </div>
          <div className={CARD}>
            <IconBadge icon={Trash} tone="rose" className="size-8" />
            <p className="mt-2 font-semibold text-slate-900">Xoá toàn bộ</p>
            <p className="text-sm">Tài khoản → Xoá tài khoản.</p>
            <Link
              href="/dashboard/settings"
              className="text-primary-600 mt-1.5 inline-block text-sm font-semibold"
            >
              Mở Tài khoản →
            </Link>
          </div>
          <div className={CARD}>
            <IconBadge icon={EnvelopeSimple} tone="sky" className="size-8" />
            <p className="mt-2 font-semibold text-slate-900">Yêu cầu khác</p>
            <p className="text-sm">
              Bản sao dữ liệu, rút đồng ý, phản đối hay hạn chế xử lý.
            </p>
            <a
              href={`mailto:${OPERATOR.email}`}
              className="text-primary-600 mt-1.5 inline-block text-sm font-semibold"
            >
              Gửi email →
            </a>
          </div>
        </div>
        <p className="mt-3 text-sm">
          Bạn có thể khiếu nại tới cơ quan chuyên trách bảo vệ dữ liệu cá nhân
          (Bộ Công an) nếu cho rằng dữ liệu bị xử lý sai.
        </p>
      </>
    ),
  },
  {
    id: "bao-mat",
    title: "Bảo mật",
    icon: LockKey,
    tone: "primary",
    short: "mã hoá đường truyền, mật khẩu băm, file chỉ mở bằng link tạm.",
    body: (
      <p>
        Kết nối mã hoá HTTPS; mật khẩu chỉ lưu dạng băm một chiều; phiên đăng
        nhập lưu trong cookie mà mã chạy trên trang không đọc được; file CV chỉ
        mở được qua đường dẫn tạm thời, hết hạn sau ít phút. Nếu xảy ra sự cố lộ
        dữ liệu, chúng tôi báo cho bạn và cơ quan chức năng theo thời hạn luật
        định.
      </p>
    ),
  },
  {
    id: "cookie",
    title: "Cookie",
    icon: Cookie,
    tone: "amber",
    short: "chỉ cookie giữ đăng nhập; không quảng cáo, không theo dõi.",
    body: (
      <p>
        Chúng tôi chỉ dùng cookie cần thiết để giữ bạn đăng nhập. Lựa chọn giao
        diện (sáng/tối, cỡ chữ, thu gọn thanh bên) lưu ngay trên trình duyệt của
        bạn. Không dùng cookie quảng cáo hay công cụ theo dõi của bên thứ ba.
      </p>
    ),
  },
  {
    id: "thay-doi",
    title: "Thay đổi chính sách",
    icon: ArrowsClockwise,
    tone: "sky",
    short: "đổi điều quan trọng thì báo trước ít nhất 7 ngày.",
    body: (
      <p>
        Khi thay đổi nội dung quan trọng, chúng tôi báo trên trang ít nhất 7
        ngày trước khi áp dụng.
      </p>
    ),
  },
];

/** Trang Chính sách bảo mật; khách xem được, Google index được. */
export default function PrivacyPage() {
  return (
    <LegalPage
      current="privacy"
      title="Dữ liệu của bạn ở Careelot"
      lead='Trang này viết để bạn đọc hiểu được: thu gì, dùng làm gì, gửi cho ai và xoá thế nào. Mỗi mục có một dòng "Nói ngắn gọn" trước phần chi tiết.'
      basis="Theo Luật Bảo vệ dữ liệu cá nhân 91/2025"
      readMinutes={5}
      summary={SUMMARY}
      sections={SECTIONS}
    />
  );
}
