import type { Metadata } from "next";
import { CvCheckView } from "./cv-check-view";

export const metadata: Metadata = {
  title: "Kiểm tra CV chuẩn ATS miễn phí",
  description:
    "Kiểm tra CV chuẩn ATS miễn phí: kéo thả CV PDF để xem máy lọc hồ sơ (ATS) có đọc được không, câu nào nên viết lại và câu hỏi phỏng vấn dự đoán. Không cần tài khoản.",
};

export default function CvCheckPage() {
  return <CvCheckView />;
}
