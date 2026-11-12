import Image from "next/image";
import { cn } from "@/lib/cn";

export interface Step {
  label: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  current: number;
  onStepClick?: (index: number) => void;
  className?: string;
}

const labelColors = {
  active: "text-primary-700",
  done: "text-slate-700",
  todo: "text-slate-400",
};

/** Thanh các bước tiến trình, bấm được để quay lại bước đã qua. */
export function Stepper({ steps, current, onStepClick, className }: StepperProps) {
  const last = steps.length - 1;
  return (
    <ol className={cn("flex w-full items-start", className)}>
      {steps.map((step, index) => {
        let state: "done" | "active" | "todo" = "todo";
        if (index < current) state = "done";
        else if (index === current) state = "active";

        return (
          <li key={step.label} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              <div
                className={cn(
                  "mr-2 h-0.5 flex-1 rounded transition-colors",
                  index === 0 && "invisible",
                  index <= current ? "bg-primary-500" : "bg-slate-200",
                )}
              />
              <button
                type="button"
                disabled={!onStepClick || index > current}
                onClick={() => onStepClick?.(index)}
                aria-current={state === "active" ? "step" : undefined}
                className={cn(
                  "z-10 flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                  state !== "done" && "border-2",
                  state === "active" &&
                    "border-primary-600 bg-white text-primary-700 ring-4 ring-primary-100",
                  state === "todo" && "border-slate-300 bg-white text-slate-400",
                  onStepClick && index <= current && "cursor-pointer",
                )}
              >
                {state === "done" ? (
                  <Image
                    src="/icons/step-done.png"
                    alt="Đã xong"
                    width={36}
                    height={36}
                    className="size-9"
                  />
                ) : (
                  index + 1
                )}
              </button>
              <div
                className={cn(
                  "ml-2 h-0.5 flex-1 rounded transition-colors",
                  index === last && "invisible",
                  index < current ? "bg-primary-500" : "bg-slate-200",
                )}
              />
            </div>
            <span
              className={cn(
                "mt-2 hidden text-center text-xs font-medium sm:block",
                labelColors[state],
              )}
            >
              {step.label}
            </span>
            {step.description && (
              <span className="text-2xs mt-0.5 hidden text-center text-slate-500 sm:block">
                {step.description}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
