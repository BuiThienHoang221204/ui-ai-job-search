"use client";

import Link from "next/link";
import {
  BookmarkSimple,
  Buildings,
  Compass,
  MagnifyingGlass,
  PaperPlaneRight,
} from "@phosphor-icons/react/ssr";
import type { JobFilterValue } from "@/types";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { EMPTY_FILTER } from "./job-filter-options";

/** Danh sách việc làm trống: nói rõ vì sao theo ngữ cảnh (việc phù hợp, tab cá nhân, bộ lọc) và đưa lối đi tiếp. */
export function JobsEmpty({
  filter,
  scored,
  onChange,
}: {
  filter: JobFilterValue;
  scored: boolean;
  onChange: (next: JobFilterValue) => void;
}) {
  const showAll = () =>
    onChange({ ...filter, saved: false, applied: false, followed: false });

  if (scored) {
    return (
      <EmptyState
        icon={Compass}
        title="Chưa có việc làm hợp hồ sơ trong 7 ngày qua"
        description="Mỗi đêm hệ thống quét tin mới và chỉ giữ tin đúng ngành, đủ kinh nghiệm với bạn. Thêm nghề, kỹ năng hoặc tỉnh làm việc trong hồ sơ để thấy nhiều tin hơn."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/dashboard/profile">
              <Button>Cập nhật hồ sơ</Button>
            </Link>
            <Link href="/dashboard/jobs">
              <Button variant="outline">Xem tất cả việc làm</Button>
            </Link>
          </div>
        }
      />
    );
  }

  if (filter.saved) {
    return (
      <EmptyState
        icon={BookmarkSimple}
        title="Bạn chưa lưu việc làm nào"
        description="Bấm biểu tượng lưu trên một tin để giữ lại và xem ở đây."
        action={<Button variant="outline" onClick={showAll}>Xem tất cả việc làm</Button>}
      />
    );
  }

  if (filter.applied) {
    return (
      <EmptyState
        icon={PaperPlaneRight}
        title="Chưa có tin nào bạn đã ứng tuyển"
        description="Tin bạn bấm Ứng tuyển ngay sẽ nằm ở đây để theo dõi."
        action={<Button variant="outline" onClick={showAll}>Xem tất cả việc làm</Button>}
      />
    );
  }

  if (filter.followed) {
    return (
      <EmptyState
        icon={Buildings}
        title="Công ty bạn theo dõi chưa có tin phù hợp"
        description="Bấm Theo dõi ở trang chi tiết một tin để nhận tin mới của công ty đó."
        action={<Button variant="outline" onClick={showAll}>Xem tất cả việc làm</Button>}
      />
    );
  }

  return (
    <EmptyState
      icon={MagnifyingGlass}
      title={filter.q ? `Không có việc làm khớp "${filter.q}"` : "Không có việc làm khớp bộ lọc"}
      description="Thử từ khoá ngắn hơn, bỏ bớt bộ lọc hoặc chọn thêm địa điểm."
      action={
        <Button
          variant="outline"
          onClick={() => onChange({ ...EMPTY_FILTER, sort: filter.sort })}
        >
          Xoá từ khoá và bộ lọc
        </Button>
      }
    />
  );
}
