import type { Metadata } from "next";
import { CvCheckView } from "./cv-check-view";

export const metadata: Metadata = {
  title: "Phân tích CV",
  description:
    "Kéo thả CV PDF để xem máy lọc hồ sơ có đọc được không và 3 lỗi đáng sửa nhất. Không cần tài khoản.",
};

export default function CvCheckPage() {
  return <CvCheckView />;
}
