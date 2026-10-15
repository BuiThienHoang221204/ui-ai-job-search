/** Bộ câu hỏi còn đang chờ hoặc đang soạn. */
export const isPrepBusy = (status: string) =>
  status === "PENDING" || status === "RUNNING";

/** Lượt chạy đã dừng hẳn, không còn chờ gì. */
export const isClosed = (status: string) =>
  status === "DONE" || status === "FAILED";
