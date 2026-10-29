import type { JobFilterValue } from "@/types";

export const EMPTY_FILTER: JobFilterValue = {
  q: "",
  province: [],
  occupation: [],
  salaryMin: 0,
  postedWithin: 0,
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
