import type { Metadata } from "next";
import {
  Briefcase,
  Copyright,
  Gauge,
  Handshake,
  Prohibit,
  Robot,
  Scales,
  SignOut,
  UserCircle,
  Warning,
} from "@phosphor-icons/react/ssr";
import { LegalPage } from "@/components/legal/legal-page";
import { OPERATOR } from "@/lib/legal";
import type { LegalSection } from "@/types";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng — Careelot",
  description:
    "Điều khoản khi dùng Careelot: tài khoản, nội dung do AI tạo, tin tuyển dụng tổng hợp, hạn mức miễn phí và trách nhiệm.",
  robots: { index: true, follow: true },
};

const SUMMARY = [
  {
    icon: Robot,
    tone: "primary" as const,
    title: "AI có thể sai",
    text: "Đọc lại nhận xét, CV và thư do AI tạo trước khi dùng.",
  },
  {
    icon: Briefcase,
    tone: "amber" as const,
    title: "Không phải nhà tuyển dụng",
    text: "Tin được tổng hợp từ trang khác; kiểm tra ở tin gốc.",
  },
  {
    icon: Copyright,
    tone: "emerald" as const,
    title: "CV là của bạn",
    text: "Chúng tôi chỉ xử lý để các tính năng chạy cho bạn.",
  },
  {
    icon: Gauge,
    tone: "sky" as const,
    title: "Miễn phí, có hạn mức",
    text: "Số lượt AI và phút phỏng vấn giọng nói mỗi ngày có giới hạn.",
  },
  {
    icon: Prohibit,
    tone: "rose" as const,
    title: "Không gian lận",
    text: "Không giả mạo kinh nghiệm, không dùng công cụ vượt lượt.",
  },
  {
    icon: SignOut,
    tone: "primary" as const,
    title: "Rời đi lúc nào cũng được",
    text: "Xoá tài khoản trong trang Tài khoản.",
  },
];

const SECTIONS: LegalSection[] = [
  {
    id: "chap-nhan",
    title: "Chấp nhận điều khoản",
    icon: Handshake,
    tone: "primary",
    short: "dùng Careelot là bạn đồng ý với trang này và Chính sách bảo mật.",
    body: (
      <p>
        Careelot là công cụ miễn phí giúp người tìm việc phân tích CV, tìm tin
        phù hợp, viết CV, thư xin việc và luyện phỏng vấn, do cá nhân{" "}
        <b>{OPERATOR.name}</b> vận hành. Khi tạo tài khoản hoặc dùng dịch vụ,
        bạn đồng ý với điều khoản này và Chính sách bảo mật.
      </p>
    ),
  },
  {
    id: "tai-khoan",
    title: "Tài khoản",
    icon: UserCircle,
    tone: "primary",
    short: "từ 16 tuổi, thông tin thật, mỗi người một tài khoản.",
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>Bạn cần từ 16 tuổi trở lên.</li>
        <li>
          Thông tin đăng ký phải là của bạn; bạn giữ bí mật mật khẩu và chịu
          trách nhiệm cho hoạt động trên tài khoản.
        </li>
        <li>
          Mỗi người một tài khoản; không tạo nhiều tài khoản để lấy thêm lượt AI
          hay thưởng giới thiệu.
        </li>
      </ul>
    ),
  },
  {
    id: "ai",
    title: "Về các tính năng AI",
    icon: Robot,
    tone: "primary",
    short: "nội dung do AI tạo có thể sai, bạn đọc lại trước khi dùng.",
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>
          Nhận xét, điểm phù hợp, CV, thư xin việc và câu hỏi phỏng vấn do{" "}
          <b>AI tạo ra</b>. AI không được bịa số liệu: chỗ cần con số được để
          trống <b>[__]</b> để bạn điền số thật.
        </li>
        <li>Bạn chịu trách nhiệm về nội dung bạn gửi cho nhà tuyển dụng.</li>
        <li>
          Điểm phân tích CV và điểm phù hợp chỉ để tham khảo, không bảo đảm bạn
          qua vòng hồ sơ hay có việc.
        </li>
        <li>
          Khi phỏng vấn thử, bạn đang trò chuyện với AI, không phải người thật.
        </li>
      </ul>
    ),
  },
  {
    id: "tin-tuyen-dung",
    title: "Tin tuyển dụng",
    icon: Briefcase,
    tone: "amber",
    short: "tin được tổng hợp từ trang khác; luôn kiểm tra ở tin gốc.",
    body: (
      <>
        <p>
          Tin tuyển dụng được tổng hợp tự động từ các trang tuyển dụng công
          khai, kèm đường dẫn về tin gốc. Careelot{" "}
          <b>không phải nhà tuyển dụng</b>, không đại diện cho doanh nghiệp đăng
          tin và không kiểm chứng từng tin. Số liệu lương chỉ mang tính tham
          khảo.
        </p>
        <p className="flex gap-2.5 rounded-xl bg-amber-50 px-3.5 py-3 text-sm text-slate-900">
          <Warning className="mt-0.5 size-4.5 shrink-0 text-amber-600" />
          <span>
            Không nộp tiền cho bất kỳ ai để &ldquo;được nhận việc&rdquo;. Đó là
            dấu hiệu lừa đảo.
          </span>
        </p>
      </>
    ),
  },
  {
    id: "noi-dung",
    title: "Nội dung của bạn",
    icon: Copyright,
    tone: "emerald",
    short: "CV và tài liệu thuộc về bạn.",
    body: (
      <p>
        CV, hồ sơ và tài liệu bạn tạo thuộc về bạn. Bạn cho phép Careelot xử lý
        chúng chỉ để cung cấp các tính năng bạn dùng, như mô tả trong Chính sách
        bảo mật. Chúng tôi không dùng CV của bạn để quảng cáo hay công bố.
      </p>
    ),
  },
  {
    id: "hanh-vi-cam",
    title: "Hành vi bị cấm",
    icon: Prohibit,
    tone: "rose",
    short: "không gian lận, không lừa đảo, không cào dữ liệu.",
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>
          Tải lên nội dung không phải của bạn, nội dung vi phạm pháp luật hoặc
          dữ liệu cá nhân của người khác khi chưa được đồng ý.
        </li>
        <li>
          Dùng công cụ tự động để thu thập dữ liệu, dò lỗi hay vượt giới hạn
          lượt.
        </li>
        <li>
          Dùng AI để tạo nội dung lừa đảo, giả mạo bằng cấp hay kinh nghiệm.
        </li>
      </ul>
    ),
  },
  {
    id: "han-muc",
    title: "Hạn mức miễn phí",
    icon: Gauge,
    tone: "sky",
    short: "miễn phí, có giới hạn lượt mỗi ngày.",
    body: (
      <p>
        Dịch vụ miễn phí và có giới hạn số lượt AI mỗi ngày cùng số phút phỏng
        vấn bằng giọng nói. Hạn mức có thể thay đổi để giữ dịch vụ ổn định.
      </p>
    ),
  },
  {
    id: "trach-nhiem",
    title: "Giới hạn trách nhiệm",
    icon: Warning,
    tone: "amber",
    short: "dịch vụ nguyên trạng; quyết định tuyển dụng không do chúng tôi.",
    body: (
      <p>
        Dịch vụ được cung cấp nguyên trạng, có thể gián đoạn hoặc thay đổi.
        Trong phạm vi pháp luật cho phép, chúng tôi không chịu trách nhiệm về
        quyết định tuyển dụng, nội dung tin tuyển dụng của bên thứ ba, hay thiệt
        hại phát sinh từ việc dùng nội dung do AI tạo.
      </p>
    ),
  },
  {
    id: "cham-dut",
    title: "Chấm dứt",
    icon: SignOut,
    tone: "rose",
    short: "bạn xoá tài khoản lúc nào cũng được; vi phạm thì bị khoá.",
    body: (
      <p>
        Bạn có thể xoá tài khoản bất cứ lúc nào trong trang Tài khoản. Chúng tôi
        có thể khoá tài khoản vi phạm mục Hành vi bị cấm.
      </p>
    ),
  },
  {
    id: "luat-ap-dung",
    title: "Luật áp dụng",
    icon: Scales,
    tone: "primary",
    short: "theo pháp luật Việt Nam; tranh chấp ưu tiên thương lượng.",
    body: (
      <p>
        Điều khoản tuân theo pháp luật Việt Nam. Tranh chấp được ưu tiên thương
        lượng qua <b>{OPERATOR.email}</b>; không thành thì giải quyết tại toà án
        có thẩm quyền tại Việt Nam.
      </p>
    ),
  },
];

/** Trang Điều khoản sử dụng; khách xem được, Google index được. */
export default function TermsPage() {
  return (
    <LegalPage
      current="terms"
      title="Điều khoản sử dụng"
      lead='Những gì bạn và Careelot cam kết với nhau khi dùng dịch vụ, viết ngắn gọn. Mỗi mục có một dòng "Nói ngắn gọn" trước phần chi tiết.'
      readMinutes={4}
      summary={SUMMARY}
      sections={SECTIONS}
    />
  );
}
