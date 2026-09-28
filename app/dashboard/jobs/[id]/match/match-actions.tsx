import Link from "next/link";
import { Envelope, FileText, Microphone } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";

/** Ba việc làm tiếp với một tin: sửa CV, viết thư, luyện phỏng vấn. */
export function MatchActions({ jobId }: { jobId: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link href={`/dashboard/cv-optimizer?jobId=${jobId}`} className="flex-1">
        <Button variant="secondary" className="w-full">
          <FileText className="size-4.5" />
          Tối ưu CV cho tin này
        </Button>
      </Link>
      <Link href={`/dashboard/cover-letter?jobId=${jobId}`} className="flex-1">
        <Button variant="outline" className="w-full">
          <Envelope className="size-4.5" />
          Thư xin việc
        </Button>
      </Link>

      <Link href={`/dashboard/interview/${jobId}/mock`} className="flex-1">
        <Button variant="outline" className="w-full">
          <Microphone className="size-4.5" />
          Luyện phỏng vấn
        </Button>
      </Link>
    </div>
  );
}
