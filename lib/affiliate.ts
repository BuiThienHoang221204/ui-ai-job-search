import type { SystemMatch } from "@/services";
import { fold } from "@/utils";

export const AT_PUBLISHER_ID = "7084670734220117409";

const AT_DEEP_LINK = "https://go.isclix.com/deep_link/v6";

export type AffiliatePlacement = "job-detail" | "question-bank" | "dashboard";

export type BannerSize = "300x250" | "728x90";

/** AccessTrade: code tự dựng deep link từ mã chiến dịch và trang đích. Direct: link affiliate dán nguyên (vd. Shopee Affiliate), tham số theo dõi đã cố định lúc tạo. */
export type AffiliateTarget =
  | { network: "accesstrade"; campaignId: string; url: string }
  | { network: "direct"; link: string };

export interface AffiliateOffer {
  id: string;
  target: AffiliateTarget;
  provider: string;
  title: string;
  images: Partial<Record<BannerSize, string>>;
  skills: string[];
  occupations?: string[];
  placements: AffiliatePlacement[];
}

const OFFICE_OCCUPATIONS = ["FINANCE", "HR", "SALES", "MARKETING", "CUSTOMER", "LOGISTICS"];

/** Chỉ thêm chiến dịch AccessTrade đã được duyệt hoặc link Shopee Affiliate tự tạo, và chỉ sản phẩm hợp với người đi làm. */
export const AFFILIATE_OFFERS: AffiliateOffer[] = [
  {
    id: "shopee-ielts-5-sach",
    target: { network: "direct", link: "https://s.shopee.vn/7faP62UeVz" },
    provider: "Shopee",
    title: "Bộ 5 sách IELTS: 4 kỹ năng cho người mới bắt đầu, từ vựng và kỹ thuật đọc hiểu",
    images: { "300x250": "https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mlfx4t35fny8e9" },
    skills: ["ielts"],
    placements: ["question-bank"],
  },
  {
    id: "ila-tieng-anh",
    target: { network: "accesstrade", campaignId: "6060576658500770072", url: "https://ila.edu.vn/" },
    provider: "ILA",
    title: "Khoá học tiếng Anh ILA",
    images: { "300x250": "/affiliate/ila-nam-hoc-moi-300x250.webp" },
    skills: ["tiếng anh", "english", "ielts", "toeic"],
    placements: ["question-bank", "dashboard"],
  },
  {
    id: "shopee-101-phim-tat",
    target: { network: "direct", link: "https://s.shopee.vn/7ptpHfOR2k" },
    provider: "Shopee",
    title: "Sách 101 Phím Tắt Tin Học Văn Phòng Trong Word Excel PowerPoint",
    images: { "300x250": "https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m23e52mmqa5ac6" },
    skills: ["excel", "word", "powerpoint", "tin học văn phòng", "office"],
    occupations: ["FINANCE", "HR", "LOGISTICS"],
    placements: ["question-bank"],
  },
  {
    id: "shopee-mindmap-tieng-trung",
    target: { network: "direct", link: "https://s.shopee.vn/8AWfgkgJoF" },
    provider: "Shopee",
    title: "Combo sách Mindmap từ vựng và ngữ pháp tiếng Trung theo giáo trình Hán ngữ",
    images: { "300x250": "https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mqzxx7gaul1oc4" },
    skills: ["tiếng trung", "tiếng hoa", "chinese", "hsk"],
    placements: ["dashboard", "question-bank"],
  },
  {
    id: "shopee-ky-thuat-ai-chip-huyen",
    target: { network: "direct", link: "https://s.shopee.vn/4qGDixC9WD" },
    provider: "Shopee",
    title: "Sách Kỹ thuật AI: Xây dựng ứng dụng với mô hình nền tảng (Chip Huyen)",
    images: { "300x250": "https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mq1i1g6ydf5ude" },
    skills: ["ai", "llm", "generative ai", "genai", "machine learning", "deep learning", "nlp", "rag", "langchain"],
    occupations: ["DATA_AI", "IT"],
    placements: ["dashboard", "question-bank"],
  },
  {
    id: "shopee-chatgpt-combo",
    target: { network: "direct", link: "https://s.shopee.vn/5q8kuiWZPn" },
    provider: "Shopee",
    title: "Combo sách Kỹ thuật đặt câu lệnh cho ChatGPT và ChatGPT thực chiến",
    images: { "300x250": "https://down-vn.img.susercontent.com/file/sg-11134201-7rccs-m6m12dt876r689" },
    skills: ["chatgpt", "prompt", "prompt engineering"],
    occupations: ["MARKETING"],
    placements: ["dashboard", "question-bank"],
  },
  {
    id: "shopee-ugreen-hub-type-c",
    target: { network: "direct", link: "https://s.shopee.vn/9Kid5S68kC" },
    provider: "Shopee",
    title: "Hub Type-C UGREEN 5 trong 1, HDMI 4K, sạc 100W",
    images: { "300x250": "https://down-vn.img.susercontent.com/file/cn-11134207-820l4-mpedvtdlyz9o5d" },
    skills: [],
    occupations: ["IT", "DATA_AI", "DESIGN"],
    placements: ["dashboard", "question-bank"],
  },
  {
    id: "shopee-ban-lam-viec-gaming",
    target: { network: "direct", link: "https://s.shopee.vn/7faP7DWAVd" },
    provider: "Shopee",
    title: "Bàn làm việc chân sắt mặt gỗ MDF",
    images: { "300x250": "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lyntxx07h9r58f" },
    skills: [],
    placements: ["dashboard", "question-bank"],
  },
  {
    id: "shopee-bo-dung-cu-46-chi-tiet",
    target: { network: "direct", link: "https://s.shopee.vn/8pmMVQBXN6" },
    provider: "Shopee",
    title: "Bộ dụng cụ 46 chi tiết mở bu lông, ốc vít đa năng",
    images: { "300x250": "https://down-vn.img.susercontent.com/file/vn-11134201-7r98o-lz1e59n95c25d6" },
    skills: ["bảo trì", "sửa chữa", "cơ khí"],
    occupations: ["MANUFACTURING", "CONSTRUCTION", "MANUAL"],
    placements: ["dashboard"],
  },
  {
    id: "shopee-ao-so-mi-nu-co-sen",
    target: { network: "direct", link: "https://s.shopee.vn/3B7zwHT6M1" },
    provider: "Shopee",
    title: "Áo sơ mi công sở nữ tơ xước cổ sen 2 lá, cúc ngọc",
    images: { "300x250": "https://down-vn.img.susercontent.com/file/22b139d86a08652d6567eda81d835e2d" },
    skills: [],
    occupations: OFFICE_OCCUPATIONS,
    placements: ["question-bank"],
  },
  {
    id: "shopee-ao-so-mi-genalpha",
    target: { network: "direct", link: "https://s.shopee.vn/8V9WIA69wi" },
    provider: "Shopee",
    title: "Áo sơ mi công sở tay ngắn GEN ALPHA vải lụa cao cấp",
    images: { "300x250": "https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mps6o0dm6sjl40" },
    skills: [],
    occupations: OFFICE_OCCUPATIONS,
    placements: ["question-bank"],
  },
  {
    id: "shopee-quan-tay-jbagy",
    target: { network: "direct", link: "https://s.shopee.vn/60SBJd65Rm" },
    provider: "Shopee",
    title: "Quần tây nam ống suông JBAGY vải âu",
    images: { "300x250": "https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mehia9f6n94wbd" },
    skills: [],
    occupations: OFFICE_OCCUPATIONS,
    placements: ["question-bank"],
  },
  {
    id: "shopee-chan-vay-midi-mely",
    target: { network: "direct", link: "https://s.shopee.vn/9V23U7zBox" },
    provider: "Shopee",
    title: "Chân váy midi chữ A công sở Mely Fashion, cạp cao",
    images: { "300x250": "https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-mbro6181c91xd1" },
    skills: [],
    occupations: OFFICE_OCCUPATIONS,
    placements: ["question-bank"],
  },
  {
    id: "shopee-blazer-nu-salalu",
    target: { network: "direct", link: "https://s.shopee.vn/70KiVc7Elh" },
    provider: "Shopee",
    title: "Áo blazer nữ dáng ngắn đính khuy SALALU",
    images: { "300x250": "https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mrzeghg99vd15b" },
    skills: [],
    occupations: OFFICE_OCCUPATIONS,
    placements: ["question-bank"],
  },
  {
    id: "shopee-blazer-nam-jbagy",
    target: { network: "direct", link: "https://s.shopee.vn/7ptpVBCKbm" },
    provider: "Shopee",
    title: "Áo blazer nam JBAGY Classic 3 lớp, có đệm vai",
    images: { "300x250": "https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mswgim7ef9j4c6" },
    skills: [],
    occupations: OFFICE_OCCUPATIONS,
    placements: ["question-bank"],
  },
  {
    id: "shopee-giay-cong-so-dan",
    target: { network: "direct", link: "https://s.shopee.vn/9petstl58C" },
    provider: "Shopee",
    title: "Giày đan công sở hở gót cao 5–7cm",
    images: { "300x250": "https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-moutzfl44p3f3f" },
    skills: [],
    occupations: OFFICE_OCCUPATIONS,
    placements: ["question-bank"],
  },
  {
    id: "shopee-bia-nut-thien-long",
    target: { network: "direct", link: "https://s.shopee.vn/1VzlxeKLWw" },
    provider: "Shopee",
    title: "Bìa nút F4 Thiên Long đựng hồ sơ",
    images: { "300x250": "https://down-vn.img.susercontent.com/file/vn-11134207-7qukw-lk8z6so9588ye1" },
    skills: [],
    occupations: ["FINANCE", "HR", "LOGISTICS", "EDUCATION"],
    placements: ["question-bank"],
  },
  {
    id: "shopee-balo-laptop-mintas",
    target: { network: "direct", link: "https://s.shopee.vn/70KiVnnsva" },
    provider: "Shopee",
    title: "Balo da công sở đựng laptop MINTAS, chống sốc",
    images: { "300x250": "https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-moc7ote3iq6l3f" },
    skills: [],
    occupations: ["IT", "DATA_AI", "DESIGN", "SALES"],
    placements: ["question-bank"],
  },
  {
    id: "shopee-tui-tote-limi",
    target: { network: "direct", link: "https://s.shopee.vn/4VdNXEOMIK" },
    provider: "Shopee",
    title: "Túi tote da công sở LIMI đựng laptop 15.6 inch, khổ A4",
    images: { "300x250": "https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mq5t3d2nj9xc5b" },
    skills: [],
    occupations: ["EDUCATION", "FINANCE", "HR", "MARKETING"],
    placements: ["question-bank"],
  },
  {
    id: "shopee-tai-nghe-hoco-h17",
    target: { network: "direct", link: "https://s.shopee.vn/BUONLUNbt" },
    provider: "Shopee",
    title: "Tai nghe có dây có mic HOCO H17, jack 3.5mm",
    images: { "300x250": "https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mopdijs84p3ga6" },
    skills: [],
    occupations: ["CUSTOMER", "SALES"],
    placements: ["question-bank"],
  },
  {
    id: "shopee-tai-nghe-lenovo-th10",
    target: { network: "direct", link: "https://s.shopee.vn/8V9WIgwXcu" },
    provider: "Shopee",
    title: "Tai nghe Bluetooth Lenovo TH10 chống ồn",
    images: { "300x250": "https://down-vn.img.susercontent.com/file/cn-11134207-820l4-mk7i2pjwuebm7a" },
    skills: [],
    occupations: ["IT", "DATA_AI", "DESIGN"],
    placements: ["question-bank"],
  },
  {
    id: "shopee-webcam-vovova",
    target: { network: "direct", link: "https://s.shopee.vn/3g4GXsHrZ4" },
    provider: "Shopee",
    title: "Webcam VOVOVA Full HD 1080p có mic, cho phỏng vấn online",
    images: { "300x250": "https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-msavq3iyohe05a" },
    skills: [],
    occupations: ["IT", "DATA_AI", "EDUCATION", "CUSTOMER"],
    placements: ["question-bank"],
  },
  {
    id: "shopee-gia-do-laptop-nhom",
    target: { network: "direct", link: "https://s.shopee.vn/9APD62vW1b" },
    provider: "Shopee",
    title: "Giá đỡ laptop nhôm gấp gọn, chỉnh được độ cao",
    images: { "300x250": "https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mhcdf3uxmlmwf5" },
    skills: [],
    occupations: ["IT", "DATA_AI", "DESIGN", "MARKETING"],
    placements: ["question-bank"],
  },
  {
    id: "shopee-ban-phim-sidotech-km10",
    target: { network: "direct", link: "https://s.shopee.vn/4LJxLE98ak" },
    provider: "Shopee",
    title: "Bàn phím văn phòng SIDOTECH KM10 có dây, full size, chống nước",
    images: { "300x250": "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lua81snhrifzd2" },
    skills: [],
    occupations: ["FINANCE", "HR", "CUSTOMER", "IT", "DATA_AI"],
    placements: ["question-bank"],
  },
  {
    id: "shopee-chuot-goojodoq-bluetooth",
    target: { network: "direct", link: "https://s.shopee.vn/50Ze8Wut1e" },
    provider: "Shopee",
    title: "Chuột không dây GOOJODOQ 2.4GHz + Bluetooth, công thái học, bấm êm",
    images: { "300x250": "https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mtc8lw3q7qivaa" },
    skills: [],
    occupations: ["IT", "DATA_AI", "DESIGN", "FINANCE", "HR", "MARKETING"],
    placements: ["question-bank"],
  },
  {
    id: "shopee-cap-sac-aromax-3in1",
    target: { network: "direct", link: "https://s.shopee.vn/40h6wlbqNN" },
    provider: "Shopee",
    title: "Cáp sạc nhanh 3 trong 1 Aromax 100W dây dù bện",
    images: { "300x250": "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lyurenyhc2w179" },
    skills: [],
    occupations: ["SALES", "MARKETING", "CUSTOMER", "LOGISTICS"],
    placements: ["question-bank"],
  },
];

export interface PickedOffer {
  offer: AffiliateOffer;
  /** Kỹ năng còn thiếu đã khớp; `null` khi thẻ hiện theo ngành hoặc theo vị trí đặt. */
  skill: string | null;
}

/** Link affiliate của một ưu đãi; với AccessTrade sub1 là vị trí đặt, sub2 là kỹ năng (hoặc mã ưu đãi). */
export function affiliateLink(offer: AffiliateOffer, placement: AffiliatePlacement, skill: string | null): string {
  const { target } = offer;
  if (target.network === "direct") return target.link;

  let binary = "";
  for (const byte of new TextEncoder().encode(target.url)) binary += String.fromCharCode(byte);

  const sub2 = skill
    ? fold(skill).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40)
    : offer.id;

  const params = new URLSearchParams({
    url_enc: btoa(binary),
    sub1: placement,
    sub2,
  });
  return `${AT_DEEP_LINK}/${AT_PUBLISHER_ID}/${target.campaignId}?${params.toString()}`;
}

/** Kỹ năng hồ sơ chưa đáp ứng của một tin, bắt buộc trước rồi tới ưu tiên. */
export function missingSkillsOf(system?: SystemMatch | null): string[] {
  const checks = system?.checks ?? [];
  return ["SKILL", "NICE"].flatMap((kind) =>
    checks.filter((c) => c.kind === kind && c.met === false).map((c) => c.label),
  );
}

/** Tên kỹ năng của gợi ý "Học {kỹ năng}" ở trang tổng quan; gợi ý loại khác trả null. */
export function suggestionSkill(suggestion: { type: string; title: string }): string | null {
  if (suggestion.type !== "skill") return null;
  return suggestion.title.replace(/^Học\s+/u, "").trim() || null;
}

export type PickOffersOptions = {
  skills?: string[];
  occupation?: string | null;
  placement?: AffiliatePlacement | null;
  max?: number;
  rotation?: number;
};

/**
 * Hàm cốt lõi tìm & chọn ưu đãi: ưu tiên kỹ năng còn thiếu, đến nhóm ngành, cuối cùng lùi về vị trí đặt (nếu có placement).
 * Hỗ trợ cả cú pháp options object mới lẫn danh sách tham số cũ.
 */
export function pickOffers(
  offers: AffiliateOffer[],
  optionsOrPlacement?: PickOffersOptions | AffiliatePlacement,
  missingSkills: string[] = [],
  rotationArg = 0,
  countArg = 1,
  occupationArg: string | null = null,
): PickedOffer[] {
  const opts: PickOffersOptions =
    typeof optionsOrPlacement === "string"
      ? {
          placement: optionsOrPlacement,
          skills: missingSkills,
          rotation: rotationArg,
          max: countArg,
          occupation: occupationArg,
        }
      : (optionsOrPlacement ?? {});

  const { skills = [], occupation, placement, max = 1, rotation = 0 } = opts;
  const picked: PickedOffer[] = [];
  const taken = new Set<string>();

  // 1. Khớp theo kỹ năng còn thiếu
  for (let i = 0; i < skills.length && picked.length < max; i++) {
    const skill = skills[i];
    const skillNorm = ` ${fold(skill).replace(/[^a-z0-9+#.]+/g, " ")} `;
    const candidates = offers.filter(
      (o) =>
        !taken.has(o.id) &&
        o.skills.some((k) => {
          const kw = fold(k).trim();
          return Boolean(kw) && skillNorm.includes(` ${kw} `);
        }),
    );
    if (candidates.length > 0) {
      const chosen = candidates[(Math.abs(rotation) + i) % candidates.length];
      picked.push({ offer: chosen, skill });
      taken.add(chosen.id);
    }
  }

  // Helper xoay vòng lấy thêm các ưu đãi còn thiếu
  const fillRemaining = (candidates: AffiliateOffer[]) => {
    const needed = max - picked.length;
    if (needed <= 0 || candidates.length === 0) return;
    const start = Math.abs(rotation) % candidates.length;
    const rotated = [...candidates.slice(start), ...candidates.slice(0, start)];
    for (const offer of rotated.slice(0, needed)) {
      picked.push({ offer, skill: null });
      taken.add(offer.id);
    }
  };

  // 2. Khớp theo nhóm ngành
  if (occupation && picked.length < max) {
    fillRemaining(offers.filter((o) => !taken.has(o.id) && o.occupations?.includes(occupation)));
  }

  // 3. Khớp theo vị trí hiển thị (fallback)
  if (placement && picked.length < max) {
    fillRemaining(offers.filter((o) => !taken.has(o.id) && o.placements.includes(placement)));
  }

  return picked;
}

/** Lấy 1 ưu đãi duy nhất cho vị trí chỉ đặt 1 banner. */
export const pickOffer = (
  offers: AffiliateOffer[],
  placement: AffiliatePlacement,
  missingSkills: string[] = [],
  rotation = 0,
): PickedOffer | null => pickOffers(offers, { placement, skills: missingSkills, rotation, max: 1 })[0] ?? null;

/** Ưu đãi liên quan theo kỹ năng rồi tới ngành nghề (tương thích ngược). */
export const relevantOffers = (
  offers: AffiliateOffer[],
  skills: string[],
  occupation: string | null | undefined,
  max: number,
  rotation = 0,
) => pickOffers(offers, { skills, occupation, max, rotation });

/** Ưu đãi theo kỹ năng (tương thích ngược). */
export const offersForSkills = (
  offers: AffiliateOffer[],
  skills: string[],
  max: number,
  rotation = 0,
) => pickOffers(offers, { skills, max, rotation });
