import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import {
  AFFILIATE_OFFERS,
  AT_PUBLISHER_ID,
  affiliateLink,
  missingSkillsOf,
  pickOffer,
  pickOffers,
  offersForSkills,
  relevantOffers,
  suggestionSkill,
  type AffiliateOffer,
} from "@/lib/affiliate";
import type { SystemMatch } from "@/services";

const offer = (patch: Partial<AffiliateOffer>): AffiliateOffer => ({
  id: "unica-excel",
  target: { network: "accesstrade", campaignId: "6060576658500770072", url: "https://unica.vn/excel" },
  provider: "Unica",
  title: "Excel từ cơ bản tới nâng cao",
  images: { "300x250": "/affiliate/excel-300x250.webp" },
  skills: ["excel"],
  placements: [],
  ...patch,
});

describe("affiliateLink", () => {
  test("dựng đúng khuôn deep link AccessTrade đã đo trên link thật của chiến dịch ILA", () => {
    const link = new URL(
      affiliateLink(
        offer({
          target: { network: "accesstrade", campaignId: "6060576658500770072", url: "https://ila.edu.vn/tieng-anh-cho-be/" },
        }),
        "job-detail",
        null,
      ),
    );
    expect(`${link.origin}${link.pathname}`).toBe(
      `https://go.isclix.com/deep_link/v6/${AT_PUBLISHER_ID}/6060576658500770072`,
    );
    expect(link.searchParams.get("url_enc")).toBe("aHR0cHM6Ly9pbGEuZWR1LnZuL3RpZW5nLWFuaC1jaG8tYmUv");
  });

  test("sub1 là vị trí đặt, sub2 là kỹ năng đã bỏ dấu", () => {
    const link = new URL(affiliateLink(offer({}), "job-detail", "Kế toán tổng hợp"));
    expect(link.searchParams.get("sub1")).toBe("job-detail");
    expect(link.searchParams.get("sub2")).toBe("ke-toan-tong-hop");
  });

  test("không khớp kỹ năng thì sub2 là mã ưu đãi", () => {
    const link = new URL(affiliateLink(offer({}), "dashboard", null));
    expect(link.searchParams.get("sub2")).toBe("unica-excel");
  });

  test("link trực tiếp (Shopee Affiliate) dùng nguyên, không bọc deep link AccessTrade", () => {
    const shopee = offer({ target: { network: "direct", link: "https://s.shopee.vn/7ptpHfOR2k" } });
    expect(affiliateLink(shopee, "job-detail", "Excel")).toBe("https://s.shopee.vn/7ptpHfOR2k");
  });

  test("trang đích có ký tự tiếng Việt vẫn mã hoá được", () => {
    const url = "https://unica.vn/khoá-học";
    const link = new URL(
      affiliateLink(offer({ target: { network: "accesstrade", campaignId: "1", url } }), "dashboard", null),
    );
    const encoded = link.searchParams.get("url_enc") ?? "";
    const bytes = Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0));
    expect(new TextDecoder().decode(bytes)).toBe(url);
  });
});

describe("pickOffer", () => {
  const excel = offer({ id: "excel", skills: ["excel"] });
  const english = offer({ id: "english", skills: ["tiếng anh", "english"], placements: ["question-bank"] });

  test("khớp kỹ năng còn thiếu, không phân biệt dấu và hoa thường", () => {
    expect(pickOffer([excel, english], "job-detail", ["Tieng Anh giao tiep"])).toEqual({
      offer: english,
      skill: "Tieng Anh giao tiep",
    });
  });

  test("theo thứ tự kỹ năng còn thiếu, không theo thứ tự danh mục", () => {
    expect(pickOffer([english, excel], "job-detail", ["Microsoft Excel", "English"])?.offer).toBe(excel);
  });

  test("chỉ khớp nguyên từ: 'excel' không khớp 'excellent'", () => {
    expect(pickOffer([excel], "job-detail", ["Excellent communication"])).toBeNull();
  });

  test("không khớp kỹ năng thì lùi về ưu đãi được phép ở vị trí đó", () => {
    expect(pickOffer([excel, english], "question-bank", ["Docker"])).toEqual({ offer: english, skill: null });
  });

  test("nhiều ưu đãi cùng được phép ở một vị trí thì xoay vòng theo rotation, không luôn lấy cái đầu", () => {
    const a = offer({ id: "a", skills: [], placements: ["dashboard"] });
    const b = offer({ id: "b", skills: [], placements: ["dashboard"] });
    expect(pickOffer([a, b], "dashboard", [], 0)?.offer.id).toBe("a");
    expect(pickOffer([a, b], "dashboard", [], 1)?.offer.id).toBe("b");
    expect(pickOffer([a, b], "dashboard", [], 7)?.offer.id).toBe("b");
  });

  test("pickOffers trả nhiều ưu đãi KHÔNG trùng: kỹ năng khớp trước, rồi xoay vòng phần còn lại", () => {
    const a = offer({ id: "a", skills: [], placements: ["dashboard"] });
    const b = offer({ id: "b", skills: [], placements: ["dashboard"] });
    const c = offer({ id: "c", skills: ["excel"], placements: ["dashboard"] });
    const ids = pickOffers([a, b, c], "dashboard", ["Excel"], 0, 3).map((p) => p.offer.id);
    expect(ids).toEqual(["c", "a", "b"]);
  });

  test("pickOffers không trả nhiều hơn số ưu đãi đang có", () => {
    const a = offer({ id: "a", skills: [], placements: ["dashboard"] });
    expect(pickOffers([a], "dashboard", [], 0, 5)).toHaveLength(1);
  });

  test("khớp kỹ năng thì không bị xoay vòng làm lệch", () => {
    expect(pickOffer([excel, english], "job-detail", ["Excel"], 5)?.offer).toBe(excel);
  });

  test("không ưu đãi nào hợp thì trả null để trang không vẽ gì", () => {
    expect(pickOffer([excel], "dashboard")).toBeNull();
    expect(pickOffer([], "job-detail", ["Excel"])).toBeNull();
  });
});

describe("missingSkillsOf", () => {
  test("lấy kỹ năng chưa đáp ứng, bắt buộc trước rồi tới ưu tiên, bỏ qua số năm và địa điểm", () => {
    const system = {
      kind: "REQUIREMENTS",
      met: 1,
      total: 5,
      score: 40,
      eligibility: "PASS",
      checks: [
        { label: "Power BI", kind: "NICE", met: false },
        { label: "Excel", kind: "SKILL", met: false },
        { label: "SQL", kind: "SKILL", met: true },
        { label: "3 năm kinh nghiệm", kind: "YEARS", met: false },
        { label: "Python", kind: "SKILL", met: null },
      ],
    } satisfies SystemMatch;
    expect(missingSkillsOf(system)).toEqual(["Excel", "Power BI"]);
  });

  test("tin chưa có đối chiếu thì trả mảng rỗng", () => {
    expect(missingSkillsOf(null)).toEqual([]);
  });
});

describe("AFFILIATE_OFFERS (danh mục thật)", () => {
  test("mã ưu đãi không trùng nhau", () => {
    const ids = AFFILIATE_OFFERS.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("mọi ảnh khai trong danh mục đều có file thật trong public/ hoặc là URL hợp lệ", () => {
    for (const item of AFFILIATE_OFFERS) {
      for (const path of Object.values(item.images)) {
        if (path?.startsWith("http://") || path?.startsWith("https://")) {
          expect(() => new URL(path)).not.toThrow();
        } else {
          expect(existsSync(join("public", path ?? ""))).toBe(true);
        }
      }
    }
  });

  test("tin đòi IELTS gợi ý sách IELTS, tin đòi tiếng Anh chung vẫn gợi ý ILA", () => {
    expect(pickOffer(AFFILIATE_OFFERS, "job-detail", ["IELTS 6.5"])?.offer.id).toBe("shopee-ielts-5-sach");
    expect(pickOffer(AFFILIATE_OFFERS, "job-detail", ["Tiếng Anh giao tiếp"])?.offer.id).toBe("ila-tieng-anh");
  });

  test("tin đòi tiếng Trung hay AI ra đúng sách", () => {
    expect(pickOffer(AFFILIATE_OFFERS, "job-detail", ["Tiếng Trung"])?.offer.id).toBe("shopee-mindmap-tieng-trung");
    expect(pickOffer(AFFILIATE_OFFERS, "job-detail", ["LLM"])?.offer.id).toBe("shopee-ky-thuat-ai-chip-huyen");
  });
});

describe("offersForSkills", () => {
  const excel = offer({ id: "excel", skills: ["excel"], placements: [] });
  const household = offer({ id: "giay-an", skills: [], placements: ["dashboard"] });

  test("không khớp kỹ năng nào thì trả rỗng, không lùi về món chung của vị trí", () => {
    expect(offersForSkills([excel, household], ["Docker"], 2)).toEqual([]);
  });

  test("khớp thì trả đúng món, kèm kỹ năng đã khớp, tối đa max", () => {
    expect(offersForSkills([excel, household], ["Microsoft Excel", "Excel"], 2)).toEqual([
      { offer: excel, skill: "Microsoft Excel" },
    ]);
  });
});

describe("suggestionSkill", () => {
  test("lấy tên kỹ năng từ gợi ý \"Học {kỹ năng}\"", () => {
    expect(suggestionSkill({ type: "skill", title: "Học Excel" })).toBe("Excel");
  });

  test("gợi ý loại khác trả null", () => {
    expect(suggestionSkill({ type: "cv", title: "Hoàn thiện hồ sơ (92%)" })).toBeNull();
  });
});

describe("relevantOffers", () => {
  const excel = offer({ id: "excel", skills: ["excel"], placements: [] });
  const stethoscope = offer({ id: "ong-nghe", skills: [], occupations: ["HEALTHCARE"], placements: [] });
  const hub = offer({ id: "hub", skills: [], placements: ["question-bank"] });

  test("khớp kỹ năng đứng trước, rồi tới khớp ngành, không lùi về món chung", () => {
    expect(relevantOffers([excel, stethoscope, hub], ["Excel"], "HEALTHCARE", 3)).toEqual([
      { offer: excel, skill: "Excel" },
      { offer: stethoscope, skill: null },
    ]);
  });

  test("không khớp kỹ năng vẫn hiện món đúng ngành", () => {
    expect(relevantOffers([excel, stethoscope], ["Docker"], "HEALTHCARE", 2)).toEqual([
      { offer: stethoscope, skill: null },
    ]);
  });

  test("không rõ ngành thì chỉ còn khớp kỹ năng", () => {
    expect(relevantOffers([excel, stethoscope], [], null, 2)).toEqual([]);
  });

  test("pickOffers xếp ngành trước khi xoay vòng món chung", () => {
    expect(pickOffers([hub, stethoscope], "question-bank", [], 0, 2, "HEALTHCARE").map(({ offer }) => offer.id)).toEqual([
      "ong-nghe",
      "hub",
    ]);
  });
});

describe("relevantOffers xoay vòng món theo ngành", () => {
  const a = offer({ id: "a", skills: [], occupations: ["FINANCE"] });
  const b = offer({ id: "b", skills: [], occupations: ["FINANCE"] });

  test("rotation khác nhau ra món khác nhau, vẫn không trùng", () => {
    expect(relevantOffers([a, b], [], "FINANCE", 1, 0)[0].offer.id).toBe("a");
    expect(relevantOffers([a, b], [], "FINANCE", 1, 1)[0].offer.id).toBe("b");
    expect(relevantOffers([a, b], [], "FINANCE", 2, 1).map(({ offer }) => offer.id)).toEqual(["b", "a"]);
  });
});

describe("offersForSkills xoay vòng món theo kỹ năng", () => {
  const course1 = offer({ id: "english-1", skills: ["english"] });
  const course2 = offer({ id: "english-2", skills: ["english"] });

  test("rotation khác nhau ra món khác nhau cho cùng một kỹ năng", () => {
    expect(offersForSkills([course1, course2], ["English"], 1, 0)[0].offer.id).toBe("english-1");
    expect(offersForSkills([course1, course2], ["English"], 1, 1)[0].offer.id).toBe("english-2");
  });
});
