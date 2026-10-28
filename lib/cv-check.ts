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
    label: "ATS đọc được",
    reader: "Máy lọc ATS",
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
    reader: "Nhà tuyển dụng",
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
    reader: "Cả hai",
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

export const SAMPLE_CV_NAME = "CV mẫu - Nguyen Van An.pdf";

export const SAMPLE_CV_CHECK: CvCheckResult = {
  score: 72,
  groups: [
    { key: "ats", label: "ATS đọc được", earned: 30, max: 30 },
    { key: "content", label: "Nội dung", earned: 22, max: 45 },
    { key: "structure", label: "Cấu trúc", earned: 20, max: 25 },
  ],
  checks: [
    {
      key: "textLayer",
      group: "ats",
      label: "File có lớp chữ",
      earned: 15,
      max: 15,
      detail: "Máy lọc đọc được chữ trong file.",
      sample: null,
    },
    {
      key: "clean",
      group: "ats",
      label: "Không có ký tự hỏng",
      earned: 10,
      max: 10,
      detail: "Máy đọc ra chữ sạch, không có ký tự hỏng.",
      sample: null,
    },
    {
      key: "contact",
      group: "ats",
      label: "Liên hệ in thành chữ",
      earned: 5,
      max: 5,
      detail: "Email và số điện thoại in thành chữ.",
      sample: null,
    },
    {
      key: "metrics",
      group: "content",
      label: "Số liệu trong từng dòng",
      earned: 10,
      max: 20,
      detail: "2/8 dòng kinh nghiệm có số liệu (nên từ một nửa trở lên).",
      sample: "Tham gia tối ưu hệ thống",
    },
    {
      key: "actionVerbs",
      group: "content",
      label: "Mở đầu bằng động từ hành động",
      earned: 4,
      max: 15,
      detail:
        "2/8 dòng mở đầu bằng động từ hành động (xây dựng, triển khai, built, led…).",
      sample: "Tham gia tối ưu hệ thống",
    },
    {
      key: "concise",
      group: "content",
      label: "Câu gọn",
      earned: 8,
      max: 10,
      detail: "2/8 dòng dài quá 35 chữ.",
      sample: null,
    },
    {
      key: "sections",
      group: "structure",
      label: "Đủ mục chính",
      earned: 10,
      max: 15,
      detail: "Không thấy mục Học vấn.",
      sample: null,
    },
    {
      key: "length",
      group: "structure",
      label: "Độ dài 1–2 trang",
      earned: 10,
      max: 10,
      detail: "CV dài 1 trang (nên 1–2 trang).",
      sample: null,
    },
  ],
  flags: [],
  mode: "ai",
  reason: null,
  aiRemaining: null,
  review: {
    summary:
      "CV gọn một trang, máy lọc đọc tốt và có dự án thật với NestJS, PostgreSQL. Điểm yếu là phần kinh nghiệm kể việc đã làm mà ít nói kết quả: chỉ 2/8 dòng có con số, nhiều dòng mở đầu bằng “Tham gia”, “Hỗ trợ”. Thêm mục Học vấn và viết lại các câu dưới đây là CV đủ sức vào vòng phỏng vấn Backend Junior.",
    targetRole: "Backend Developer",
    level: "junior",
    sections: [
      {
        section: "contact",
        verdict: "ok",
        note: "Đủ email, số điện thoại, GitHub và LinkedIn, in thành chữ.",
        issues: [],
      },
      {
        section: "summary",
        verdict: "fix",
        note: "Câu giới thiệu chung chung, chưa nói bạn mạnh mảng nào.",
        issues: [
          {
            title: "Phần giới thiệu chưa nói rõ thế mạnh",
            impact: "recruiter",
            why: "Nhà tuyển dụng đọc phần này trong vài giây đầu. Nói thẳng bạn làm backend với công nghệ gì, đã đưa sản phẩm nào lên chạy thật.",
            quote:
              "Là một lập trình viên nhiệt huyết, ham học hỏi, mong muốn phát triển bản thân trong môi trường chuyên nghiệp.",
            rewrite:
              "Backend Developer 1,5 năm kinh nghiệm với NestJS và PostgreSQL, đã đưa [__] API vào chạy thật phục vụ [__] người dùng mỗi ngày.",
          },
        ],
      },
      {
        section: "experience",
        verdict: "fix",
        note: "Kể đúng việc nhưng thiếu kết quả đo được.",
        issues: [
          {
            title: "Dòng kinh nghiệm không có kết quả",
            impact: "both",
            why: "“Tham gia” không cho biết bạn tự làm phần nào. Mở đầu bằng động từ và thêm con số để máy lọc lẫn người đọc thấy tác động.",
            quote: "Tham gia tối ưu hệ thống",
            rewrite:
              "Tối ưu truy vấn PostgreSQL bằng index và phân trang con trỏ, giảm độ trễ API danh sách đơn hàng [__]%.",
          },
          {
            title: "Việc hỗ trợ chưa thấy vai trò của bạn",
            impact: "recruiter",
            why: "Ghi rõ bạn xây phần nào và nó giúp được gì, thay vì chỉ “hỗ trợ”.",
            quote: "Hỗ trợ team xây dựng chức năng thanh toán",
            rewrite:
              "Xây dựng luồng thanh toán VNPay với webhook và kiểm tra trùng giao dịch, xử lý [__] giao dịch mỗi ngày không sai lệch.",
          },
          {
            title: "Thiếu tên công nghệ máy lọc tìm",
            impact: "ats",
            why: "Máy lọc so từ khoá với tin tuyển dụng. “Viết API” không khớp được với “RESTful API”, “Redis” hay “Docker”.",
            quote: "Viết API cho ứng dụng di động",
            rewrite:
              "Thiết kế [__] RESTful API cho ứng dụng di động bằng NestJS, cache bằng Redis và đóng gói Docker.",
          },
        ],
      },
      {
        section: "projects",
        verdict: "fix",
        note: "Dự án cá nhân tốt nhưng chưa có link và quy mô.",
        issues: [
          {
            title: "Dự án nên kèm link và quy mô",
            impact: "recruiter",
            why: "Thêm link GitHub hoặc bản chạy thử để nhà tuyển dụng kiểm chứng ngay, nhất là với CV Junior.",
            quote: null,
            rewrite: null,
          },
        ],
      },
      {
        section: "skills",
        verdict: "ok",
        note: "Chia nhóm rõ: ngôn ngữ, framework, cơ sở dữ liệu, công cụ.",
        issues: [],
      },
      {
        section: "education",
        verdict: "missing",
        note: "Không thấy mục Học vấn.",
        issues: [
          {
            title: "Thêm mục Học vấn",
            impact: "ats",
            why: "Nhiều máy lọc coi Học vấn là mục bắt buộc. Ghi tên trường, ngành và năm tốt nghiệp, kể cả khi bạn tự học là chính.",
            quote: null,
            rewrite: null,
          },
        ],
      },
    ],
    ats: [
      {
        key: "readingOrder",
        status: "pass",
        note: "Bố cục một cột, máy đọc đúng thứ tự từ trên xuống.",
      },
      {
        key: "headings",
        status: "pass",
        note: "Tên mục quen thuộc: Kinh nghiệm, Dự án, Kỹ năng.",
      },
      {
        key: "dates",
        status: "warn",
        note: "Lẫn hai kiểu ngày “03/2024” và “Tháng 3, 2023”; nên dùng một kiểu.",
      },
      {
        key: "jobTitles",
        status: "pass",
        note: "Chức danh rõ ràng: Backend Developer, Thực tập sinh Backend.",
      },
      {
        key: "spelling",
        status: "pass",
        note: "Không thấy lỗi chính tả.",
      },
    ],
    strengths: [
      "Dùng đúng bộ công nghệ nhiều tin Backend đang tuyển: NestJS, PostgreSQL, Redis, Docker.",
      "Có dự án đưa vào chạy thật, không chỉ bài tập trên lớp.",
      "Gọn một trang, bố cục một cột nên máy lọc đọc dễ.",
    ],
    improvements: [
      "Thêm con số vào ít nhất một nửa số dòng kinh nghiệm.",
      "Mở đầu mỗi dòng bằng động từ: xây dựng, tối ưu, triển khai.",
      "Bổ sung mục Học vấn và link GitHub cho từng dự án.",
    ],
    questions: [
      {
        question:
          "Bạn đã tối ưu truy vấn PostgreSQL như thế nào? Làm sao biết truy vấn nào chậm?",
        topic: "Cơ sở dữ liệu",
        level: "intermediate",
        why: "CV ghi “tối ưu hệ thống” nên người phỏng vấn sẽ hỏi cụ thể bạn làm gì.",
        hint: "Kể theo thứ tự: đo bằng EXPLAIN ANALYZE, thêm index nào, kết quả trước và sau.",
      },
      {
        question:
          "Nếu VNPay gọi webhook hai lần cho cùng một giao dịch, hệ thống của bạn xử lý ra sao?",
        topic: "Thanh toán",
        level: "advanced",
        why: "Bạn ghi có làm luồng thanh toán; chống trùng là câu hỏi gần như chắc chắn gặp.",
        hint: "Nói về khoá idempotency hoặc ràng buộc unique trên mã giao dịch.",
      },
      {
        question: "Bạn dùng Redis để cache những gì, và xoá cache khi nào?",
        topic: "Cache",
        level: "intermediate",
        why: "Redis nằm trong phần kỹ năng nên dễ bị hỏi sâu.",
        hint: "Chọn một ví dụ thật, nêu thời gian sống của khoá và lúc dữ liệu đổi thì xử lý cache thế nào.",
      },
      {
        question:
          "Module trong NestJS dùng để làm gì? Bạn chia module cho dự án ra sao?",
        topic: "NestJS",
        level: "basic",
        why: "Câu khởi động quen thuộc khi CV ghi NestJS là framework chính.",
        hint: "Giải thích dependency injection rồi kể cách bạn tách module theo nghiệp vụ.",
      },
    ],
    parsed: {
      name: "Nguyễn Văn An",
      email: "an.nguyen@gmail.com",
      phone: "0901 234 567",
      jobs: [
        {
          title: "Backend Developer",
          company: "Công ty TNHH Phần mềm Sao Mai",
          dates: "03/2024 – nay",
        },
        {
          title: "Thực tập sinh Backend",
          company: "Công ty Cổ phần Công nghệ Biển Xanh",
          dates: "Tháng 3, 2023 – 02/2024",
        },
      ],
      education: [],
      skills: [
        "NestJS",
        "Node.js",
        "TypeScript",
        "PostgreSQL",
        "Redis",
        "Docker",
        "Git",
        "RESTful API",
      ],
    },
  },
};
