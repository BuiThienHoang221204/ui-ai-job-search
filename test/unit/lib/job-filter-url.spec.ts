import { describe, expect, it } from "vitest";
import {
  DEFAULT_SORT,
  matchOccupations,
  provinceChoices,
  readFilter,
  subOptionName,
  summarizeNames,
  writeFilter,
} from "@/lib/job-filter-url";
import type { JobFilterValue } from "@/types";

const empty = (): JobFilterValue => ({
  q: "",
  province: [],
  occupation: [],
  subOccupation: [],
  salaryMin: 0,
  postedWithin: 0,
  sort: DEFAULT_SORT,
  saved: false,
  applied: false,
  followed: false,
  since: "",
});

const roundTrip = (filter: JobFilterValue, scored = false): JobFilterValue =>
  readFilter(new URLSearchParams(writeFilter(filter, 0, scored)));

describe("writeFilter", () => {
  it("bỏ giá trị rỗng và giá trị mặc định khỏi URL", () => {
    expect(writeFilter(empty(), 0, false)).toBe("");
  });

  it("bỏ sort khi nó trùng mặc định, kể cả trên màn hình đã chấm điểm", () => {
    expect(writeFilter({ ...empty(), sort: "newest" }, 0, false)).toBe("");
    expect(writeFilter({ ...empty(), sort: "newest" }, 0, true)).toBe(
      "scored=1",
    );
  });

  it("giữ sort khi nó khác mặc định", () => {
    expect(writeFilter({ ...empty(), sort: "salary" }, 0, false)).toContain(
      "sort=salary",
    );
  });

  it("dùng append cho mảng nên nhiều lựa chọn không đè lên nhau", () => {
    const url = writeFilter(
      { ...empty(), province: ["HN", "HCM", "DN"] },
      0,
      false,
    );

    expect(new URLSearchParams(url).getAll("province")).toEqual([
      "HN",
      "HCM",
      "DN",
    ]);
  });

  it("bỏ offset 0 nhưng giữ offset khác 0", () => {
    expect(writeFilter(empty(), 0, false)).not.toContain("offset");
    expect(writeFilter(empty(), 40, false)).toContain("offset=40");
  });
});

describe("readFilter", () => {
  it("lùi về mặc định khi sort trên URL không hợp lệ", () => {
    const params = new URLSearchParams("sort=xoa-so-tui-tien");

    expect(readFilter(params).sort).toBe("newest");
  });

  it("đọc số hỏng thành 0 chứ không thành NaN", () => {
    const filter = readFilter(
      new URLSearchParams("salaryMin=abc&postedWithin="),
    );

    expect(filter.salaryMin).toBe(0);
    expect(filter.postedWithin).toBe(0);
  });

  it("cờ chỉ bật khi đúng chuỗi '1'", () => {
    expect(readFilter(new URLSearchParams("saved=1")).saved).toBe(true);
    expect(readFilter(new URLSearchParams("saved=true")).saved).toBe(
      false,
    );
  });
});

describe("khứ hồi", () => {
  it("giữ nguyên bộ lọc rỗng", () => {
    expect(roundTrip(empty())).toEqual(empty());
  });

  it("giữ nguyên bộ lọc đầy đủ mọi trường", () => {
    const full: JobFilterValue = {
      q: "kế toán tổng hợp",
      province: ["HN", "HCM"],
      occupation: ["IT", "FINANCE"],
      subOccupation: ["IT_QA"],
      salaryMin: 15_000_000,
      postedWithin: 7,
      sort: "salary",
      saved: true,
      applied: true,
      followed: true,
      since: "2026-10-25T00:30:00.000Z",
    };

    expect(roundTrip(full)).toEqual(full);
  });

  it("giữ nguyên trên màn hình đã chấm điểm", () => {
    const scoredFilter: JobFilterValue = { ...empty(), q: "backend" };

    expect(roundTrip(scoredFilter, true)).toEqual(scoredFilter);
  });
});

describe("nhãn và lựa chọn của bộ lọc", () => {
  const groups = [
    { code: "FIN", name: "Kế toán / Kiểm toán", count: 686, subs: [{ code: "ACC", name: "Kế toán", count: 464 }] },
    { code: "IT", name: "Công nghệ thông tin", count: 900, subs: [] },
  ];

  it("rút gọn tên, tìm tên nghề con và lọc tỉnh có tin", () => {
    expect(summarizeNames([])).toBe("");
    expect(summarizeNames(["Hà Nội", "Bắc Ninh", "Huế"])).toBe("Hà Nội +2");
    expect(subOptionName(groups, "ACC")).toBe("Kế toán");
    expect(subOptionName(groups, "X")).toBe("X");
    const provinces = [
      { code: "HN", name: "Hà Nội", count: 10 },
      { code: "HUE", name: "Huế", count: 0 },
      { code: "HCM", name: "HCM", count: 20 },
    ];
    expect(provinceChoices(provinces, []).map((p) => p.code)).toEqual(["HCM", "HN"]);
    expect(provinceChoices(provinces, ["HUE"]).map((p) => p.code)).toEqual(["HCM", "HN", "HUE"]);
  });

  it("khớp ngành không dấu, nhiều tin trước, có giới hạn", () => {
    expect(matchOccupations(groups, "ke toan", 3)).toEqual([
      { code: "FIN", name: "Kế toán / Kiểm toán", count: 686, sub: false },
      { code: "ACC", name: "Kế toán", count: 464, sub: true },
    ]);
    expect(matchOccupations(groups, "ke toan", 1)).toHaveLength(1);
    expect(matchOccupations(groups, "  ", 3)).toEqual([]);
  });
});
