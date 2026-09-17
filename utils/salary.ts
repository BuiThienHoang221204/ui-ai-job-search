import type { Job, SalaryRange } from "@/types";
export function formatJobSalary(job: Pick<Job, "salary" | "salaryRaw">): string {
  if (job.salary) return formatSalary(job.salary);
  return job.salaryRaw?.trim() || "Lương thoả thuận";
}
export function formatSalary(salary: SalaryRange): string {
  const period = salary.period === "year" ? "/năm" : "/tháng";
  const format =
    salary.currency === "VND"
      ? (value: number) =>
          (value / 1_000_000).toLocaleString("vi-VN", {
            maximumFractionDigits: 1,
          })
      : (value: number) => `$${value.toLocaleString("en-US")}`;
  const unit = salary.currency === "VND" ? " triệu" : "";

  if (salary.min === salary.max) {
    return `${format(salary.min)}${unit}${period}`;
  }
  return `${format(salary.min)} – ${format(salary.max)}${unit}${period}`;
}

/** Một mức lương tháng đơn lẻ, đơn vị VND: 27300000 -> "27,3 triệu". */
export function formatMonthlyVnd(value: number): string {
  const amount = (value / 1_000_000).toLocaleString("vi-VN", {
    maximumFractionDigits: 1,
  });
  return `${amount} triệu`;
}

export const SALARY_MILLION = 1_000_000;

const DECIMAL_MILLION = /^\d{1,3}[.,]\d{1,2}$/;

export function parseMonthlySalary(input: string): number | null {
  const text = input.trim();
  if (!text) return null;

  const compact = text.replace(/[^\d.,]/g, "");
  if (!compact) return null;

  if (DECIMAL_MILLION.test(compact)) {
    const amount = Number(compact.replace(",", "."));
    return Number.isFinite(amount) && amount > 0
      ? Math.round(amount * SALARY_MILLION)
      : null;
  }

  const digits = compact.replace(/[.,]/g, "");
  if (!digits) return null;

  const amount = Number(digits);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  return amount < 1000 ? amount * SALARY_MILLION : amount;
}

export function formatSalaryInput(input: string): string | null {
  const amount = parseMonthlySalary(input);
  if (amount === null) return null;
  return `= ${amount.toLocaleString("vi-VN")} ₫/tháng`;
}
