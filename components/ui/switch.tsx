import { cn } from "@/lib/cn";

/** Công tắc bật/tắt (role="switch"); `label` là tên đọc cho trình đọc màn hình. */
export function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        "relative h-6 w-10 shrink-0 cursor-pointer rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        checked ? "bg-primary-600" : "bg-slate-300",
      )}
    >
      <span
        className={cn(
          "absolute top-[3px] size-[18px] rounded-full bg-white shadow-sm transition-[left]",
          checked ? "left-[19px]" : "left-[3px]",
        )}
      />
    </button>
  );
}
