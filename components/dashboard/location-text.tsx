import { displayLocation } from "@/utils";
import { cn } from "@/utils";

/** Địa điểm tin tuyển dụng trong ô bảng: cắt ngắn, giữ nguyên văn ở `title`. */
export function LocationText({
  location,
  className,
}: {
  location?: string | null;
  className?: string;
}) {
  const place = displayLocation(location);

  return (
    <span
      title={place.full}
      className={cn("inline-block max-w-56 truncate align-middle", className)}
    >
      {place.text}
    </span>
  );
}
