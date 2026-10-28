import type {
  CvAtsCheck,
  CvCheckStatus,
  CvCheckReason,
  CvCheckResult,
  CvReview,
} from "@/types";

export const MAX_CV_TEXT = 40_000;

export const CV_RUBRIC = [
  {
    key: "ats",
    label: "Máy lọc đọc được",
    points: 30,
    items: [
      {
        key: "textLayer",
        label: "File có lớp chữ",
        points: 15,
        note: "CV xuất từ ảnh quét thì máy lọc chỉ thấy trang trắng.",
      },
      {
        key: "clean",
        label: "Không có ký tự hỏng",
        points: 10,
        note: "Font lạ biến chữ thành ô vuông, dấu hỏi.",
      },
      {
        key: "contact",
        label: "Liên hệ in thành chữ",
        points: 5,
        note: "Email, số điện thoại không nằm trong ảnh hay icon.",
      },
    ],
  },
  {
    key: "content",
    label: "Nội dung",
    points: 45,
    items: [
      {
        key: "metrics",
        label: "Số liệu trong từng dòng",
        points: 20,
        note: "Ít nhất một nửa số dòng kinh nghiệm có con số.",
      },
      {
        key: "actionVerbs",
        label: "Mở đầu bằng động từ",
        points: 15,
        note: "“Xây dựng…”, “Giảm…” thay cho “Tham gia…”, “Hỗ trợ…”.",
      },
      {
        key: "concise",
        label: "Câu gọn",
        points: 10,
        note: "Mỗi dòng không quá 35 chữ.",
      },
    ],
  },
  {
    key: "structure",
    label: "Cấu trúc",
    points: 25,
    items: [
      {
        key: "sections",
        label: "Đủ mục chính",
        points: 15,
        note: "Kinh nghiệm, học vấn, kỹ năng, đặt tên dễ nhận ra.",
      },
      {
        key: "length",
        label: "Độ dài 1–2 trang",
        points: 10,
        note: "Dài hơn thì ít ai đọc hết.",
      },
    ],
  },
];

export const FIX_HINTS: Record<string, string> = {
  textLayer:
    "xuất lại CV từ Word, Google Docs hay Canva thành PDF có chữ, đừng chụp hay quét thành ảnh.",
  clean:
    "đổi sang font phổ biến (Arial, Roboto, Times New Roman) rồi xuất lại PDF.",
  contact:
    "gõ email và số điện thoại thành chữ, đừng chỉ để trong ảnh hay icon.",
  metrics:
    "thêm kết quả đo được, ví dụ bao nhiêu người dùng, nhanh hơn bao nhiêu %, tiết kiệm bao nhiêu giờ.",
  actionVerbs:
    "mở đầu bằng việc bạn đã làm: “Xây dựng…”, “Built…”, thay cho “Tham gia…”, “Contributed…”.",
  concise: "tách câu dài thành hai dòng, mỗi dòng một việc và một kết quả.",
  sections:
    "đặt tên mục dễ nhận ra: Kinh nghiệm, Học vấn, Kỹ năng (hoặc Experience, Education, Skills).",
  length:
    "bỏ việc cũ hoặc không liên quan tới vị trí đang nhắm để gọn trong 1–2 trang.",
};

export const ATS_CHECK_LABELS: Record<CvAtsCheck, string> = {
  readingOrder: "Chữ đọc ra đúng thứ tự",
  headings: "Tên mục chuẩn",
  dates: "Ngày tháng thống nhất",
  jobTitles: "Chức danh rõ ràng",
  spelling: "Chính tả, viết tắt",
};

export const LEVEL_LABELS: Record<CvReview["level"], string> = {
  intern: "Thực tập",
  fresher: "Fresher",
  junior: "Junior",
  middle: "Middle",
  senior: "Senior",
  lead: "Lead",
  unknown: "Chưa rõ",
};

export const QUESTION_LEVEL_LABELS: Record<
  CvReview["questions"][number]["level"],
  string
> = {
  basic: "Cơ bản",
  intermediate: "Trung cấp",
  advanced: "Nâng cao",
};

const CHARS_PER_PAGE = 3_500;

/** Số trang ước theo độ dài chữ khi người dùng dán văn bản thay vì tải PDF. */
export const pagesOfText = (text: string) =>
  Math.min(10, Math.max(1, Math.ceil(text.length / CHARS_PER_PAGE)));

/** Đủ điểm là đạt, dưới một nửa là hỏng, còn lại là cảnh báo. */
export function statusOf(earned: number, max: number): CvCheckStatus {
  if (earned === max) return "pass";
  if (earned * 2 < max) return "fail";
  return "warn";
}

/** Nhãn đi kèm điểm tổng. */
export function gradeOf(score: number): string {
  if (score >= 85) return "Tốt";
  if (score >= 70) return "Khá";
  if (score >= 50) return "Trung bình";
  return "Cần sửa nhiều";
}

const QUICK_REASONS: Record<CvCheckReason, string> = {
  "no-text":
    "CV là ảnh quét nên máy lọc không đọc được chữ — đây chính là lỗi nặng nhất. Xuất lại CV từ Word, Google Docs hay Canva dưới dạng PDF có chữ rồi phân tích lại.",
  "guest-limit":
    "Bạn đã dùng hết 4 lượt AI hôm nay, lượt mới có lại lúc 00:00. Lần này phân tích nhanh không có AI nên CV hai cột có thể bị tách dòng sai.",
  "daily-limit":
    "Hôm nay hết lượt AI miễn phí cho khách, có lại lúc 00:00. Lần này phân tích nhanh không có AI nên CV hai cột có thể bị tách dòng sai.",
  "ai-failed":
    "AI đang quá tải nên lần này phân tích nhanh không có AI (không trừ lượt). Thử lại sau ít phút để có nhận xét.",
};

export const quickReasonMessage = (reason: CvCheckReason) =>
  QUICK_REASONS[reason];

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;

/** Vẽ thẻ chia sẻ 1200×630: chỉ có điểm và tên các lỗi, không có tên người hay nội dung CV. */
export function drawShareCard(
  canvas: HTMLCanvasElement,
  result: CvCheckResult,
  link: string,
): void {
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) return;

  const gradient = context.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
  gradient.addColorStop(0, "#5f6bff");
  gradient.addColorStop(1, "#1f1f6b");
  context.fillStyle = gradient;
  context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  context.fillStyle = "#ffffff";
  context.font = "600 34px system-ui, sans-serif";
  context.fillText("Careelot · Phân tích CV", 72, 100);

  context.font = "700 190px system-ui, sans-serif";
  context.fillText(String(result.score), 72, 330);
  const scoreWidth = context.measureText(String(result.score)).width;
  context.font = "600 56px system-ui, sans-serif";
  context.fillText("/ 100", 92 + scoreWidth, 330);

  context.font = "500 36px system-ui, sans-serif";
  const flags = result.flags.map((flag) => flag.label).join(" · ");
  context.fillText(flags || "Không có lỗi đáng kể", 72, 420, CARD_WIDTH - 144);

  context.globalAlpha = 0.85;
  context.font = "500 30px system-ui, sans-serif";
  context.fillText("Phân tích CV của bạn miễn phí", 72, 550);
  context.fillText(link, 72, 592, CARD_WIDTH - 144);
  context.globalAlpha = 1;
}
