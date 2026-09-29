import { ArrowClockwise, Sparkle } from "@phosphor-icons/react/ssr";
import type { JobMatchDetail } from "@/services";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { failureMessage } from "@/lib/failure-message";

type ScoreAction = {
  onScore: (force: boolean) => void;
  scoring: boolean;
};

/** Thẻ khi chưa có bản ghi chấm nào cho tin này. */
export function NotScoredCard({ onScore, scoring }: ScoreAction) {
  return (
    <Card>
      <CardContent className="flex items-start gap-2.5 text-sm text-slate-600">
        <Sparkle className="mt-0.5 size-4.5 shrink-0 text-slate-400" />
        <div>
          <p className="font-semibold text-slate-800">
            Chưa chấm điểm phù hợp cho công việc này
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Mỗi đêm hệ thống chỉ chấm sẵn vài tin khớp nhất với hồ sơ của bạn.
            Tin này chưa nằm trong số đó — chấm ngay nếu bạn quan tâm.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-3"
            loading={scoring}
            onClick={() => onScore(false)}
          >
            {!scoring && <Sparkle className="size-4" />}
            Chấm điểm tin này
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/** Thẻ khi có bản ghi mà chưa có điểm, kèm lý do và nút chấm lại. */
export function UnscoredCard({
  match,
  onScore,
  scoring,
}: ScoreAction & { match: JobMatchDetail }) {
  const failed = match.status === "FAILED";
  const waiting = match.status === "PENDING" || match.status === "RUNNING";
  const title = failed
    ? "Lần chấm điểm trước không thành công"
    : waiting
      ? "Tin này đang chờ chấm điểm"
      : "Kết quả chấm điểm chưa đầy đủ";
  const detail = failed
    ? match.failureKind
      ? failureMessage(match.failureKind)
      : "AI có thể đang quá tải hoặc trả kết quả sai định dạng. Hãy chấm lại."
    : waiting
      ? "Kết quả sẽ có sau khi hệ thống chấm xong. Bạn có thể chấm ngay thay vì chờ."
      : "AI chưa trả đủ điểm cho các chiều đánh giá. Hãy chấm lại.";

  return (
    <Card>
      <CardContent className="flex items-start gap-2.5 text-sm text-slate-600">
        <ArrowClockwise className="mt-0.5 size-4.5 shrink-0 text-slate-400" />
        <div>
          <p className="font-semibold text-slate-800">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">{detail}</p>
          <Button
            size="sm"
            variant="outline"
            className="mt-3"
            loading={scoring}
            onClick={() => onScore(match.status === "DONE")}
          >
            {!scoring && <ArrowClockwise className="size-4" />}
            {waiting ? "Chấm ngay" : "Chấm lại"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
