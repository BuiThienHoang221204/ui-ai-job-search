import { describe, expect, test } from "vitest";
import {
  formatJobSalary,
  formatSalary,
  formatSalaryInput,
  parseMonthlySalary,
} from "@/utils";

const vnd = (min: number, max: number) =>
  ({ min, max, currency: "VND", period: "month" }) as const;

describe("formatSalary", () => {
  
  test("VND đầy đủ được chia trước khi gắn chữ triệu", () => {
    expect(formatSalary(vnd(28_000_000, 40_000_000))).toBe(
      "28 – 40 triệu/tháng",
    );
  });

  test("số lẻ giữ một chữ số thập phân", () => {
    expect(formatSalary(vnd(12_500_000, 17_800_000))).toBe(
      "12,5 – 17,8 triệu/tháng",
    );
  });

  test("hai đầu bằng nhau thì không in khoảng", () => {
    expect(formatSalary(vnd(20_000_000, 20_000_000))).toBe("20 triệu/tháng");
  });

  test("ngoại tệ giữ nguyên số, KHÔNG gắn chữ triệu", () => {
    expect(
      formatSalary({
        min: 700,
        max: 1500,
        currency: "USD",
        period: "month",
      }),
    ).toBe("$700 – $1,500/tháng");
  });

  test("lương năm thì đuôi phải là /năm", () => {
    expect(
      formatSalary({
        min: 20_000_000,
        max: 30_000_000,
        currency: "VND",
        period: "year",
      }),
    ).toBe("20 – 30 triệu/năm");
  });
});

describe("formatJobSalary", () => {
  test("không có số thì hiện nguyên văn của portal", () => {
    expect(
      formatJobSalary({ salary: null, salaryRaw: "Thương lượng" }),
    ).toBe("Thương lượng");
  });

  test("không có gì cả thì nói rõ, KHÔNG bịa số 0", () => {
    expect(formatJobSalary({ salary: null, salaryRaw: null })).toBe(
      "Lương thoả thuận",
    );
  });
});

describe("parseMonthlySalary", () => {
  test("gõ theo triệu", () => {
    expect(parseMonthlySalary("12")).toBe(12_000_000);
    expect(parseMonthlySalary("18")).toBe(18_000_000);
  });

  test("gõ đủ số tiền VNĐ", () => {
    expect(parseMonthlySalary("12000000")).toBe(12_000_000);
    expect(parseMonthlySalary("18000000")).toBe(18_000_000);
  });

  test("gõ VNĐ có dấu ngăn nghìn", () => {
    expect(parseMonthlySalary("12.000.000")).toBe(12_000_000);
    expect(parseMonthlySalary("12,000,000")).toBe(12_000_000);
  });

  test("gõ số lẻ theo triệu", () => {
    expect(parseMonthlySalary("12,5")).toBe(12_500_000);
    expect(parseMonthlySalary("12.5")).toBe(12_500_000);
  });

  test("bỏ qua chữ và ký hiệu tiền tệ người dùng gõ kèm", () => {
    expect(parseMonthlySalary("18 triệu")).toBe(18_000_000);
    expect(parseMonthlySalary("18.000.000 ₫")).toBe(18_000_000);
  });

  test("ô trống hoặc rác thì trả null chứ không trả 0", () => {
    expect(parseMonthlySalary("")).toBeNull();
    expect(parseMonthlySalary("   ")).toBeNull();
    expect(parseMonthlySalary("abc")).toBeNull();
    expect(parseMonthlySalary("0")).toBeNull();
  });

  test("số vượt trần của server vẫn parse ra để server còn từ chối", () => {
    expect(parseMonthlySalary("999999999999")).toBe(999_999_999_999);
  });
});

describe("formatSalaryInput", () => {
  test("hiện lại đúng số tiền hệ thống đã hiểu", () => {
    expect(formatSalaryInput("12")).toBe("= 12.000.000 ₫/tháng");
    expect(formatSalaryInput("12000000")).toBe("= 12.000.000 ₫/tháng");
  });

  test("gõ thiếu số 0 thì con số hiện ra đủ nhỏ để người dùng nhận ra", () => {
    expect(formatSalaryInput("12.000")).toBe("= 12.000 ₫/tháng");
  });

  test("chưa gõ gì thì không hiện gì", () => {
    expect(formatSalaryInput("")).toBeNull();
  });
});
