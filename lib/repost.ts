const WEEKS = 13;
const WEEK_MS = 7 * 86_400_000;

/** Tuần nào trong 13 tuần gần nhất có lần đăng, tuần cũ nhất đứng đầu. */
export function postedWeeks(dates: string[], now: Date): boolean[] {
  const weeks: boolean[] = Array.from({ length: WEEKS }, () => false);
  for (const date of dates) {
    const ago = Math.floor(
      (now.getTime() - new Date(date).getTime()) / WEEK_MS,
    );
    if (ago >= 0 && ago < WEEKS) weeks[WEEKS - 1 - ago] = true;
  }
  return weeks;
}
