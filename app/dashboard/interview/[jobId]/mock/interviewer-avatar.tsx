import { UserSound } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/cn";

/** Avatar tròn của người phỏng vấn ảo; `active` tô đậm cho câu đang chờ trả lời. */
export function InterviewerAvatar({ active }: { active?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-8.5 shrink-0 items-center justify-center rounded-full",
        active ? "bg-primary-600 text-white" : "bg-primary-50 text-primary-600",
      )}
    >
      <UserSound className="size-4.5" weight="fill" />
    </span>
  );
}
