import type { JobFilterValue } from "@/types";

export const EMPTY_FILTER: JobFilterValue = {
  q: "",
  province: [],
  occupation: [],
  salaryMin: 0,
  postedWithin: 0,
  maxYears: null,
  seniority: [],
  sort: "newest",
  saved: false,
  applied: false,
  followed: false,
  subOccupation: [],
  since: "",
};

export const SALARY_STEPS = [10, 15, 20, 30, 50];

export const POSTED_STEPS = [
  { value: 1, label: "Trong 24 giờ" },
  { value: 3, label: "Trong 3 ngày" },
  { value: 7, label: "Trong 7 ngày" },
  { value: 30, label: "Trong 30 ngày" },
];

export const EXPERIENCE_STEPS = [
  { value: 0, label: "Không yêu cầu" },
  { value: 1, label: "Tối đa 1 năm" },
  { value: 2, label: "Tối đa 2 năm" },
  { value: 3, label: "Tối đa 3 năm" },
  { value: 5, label: "Tối đa 5 năm" },
];

export const SENIORITY_OPTIONS = [
  { value: "INTERN", label: "Thực tập" },
  { value: "FRESHER", label: "Fresher" },
  { value: "JUNIOR", label: "Junior" },
  { value: "MIDDLE", label: "Middle" },
  { value: "SENIOR", label: "Senior" },
  { value: "LEAD", label: "Trưởng nhóm / Quản lý" },
];
