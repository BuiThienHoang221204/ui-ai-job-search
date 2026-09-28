import type { ReactNode } from "react";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/utils";

interface SectionCardProps {
  title: ReactNode;
  description?: ReactNode;
  icon?: PhosphorIcon;
  iconClassName?: string;
  actions?: ReactNode;
  compact?: boolean;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}

/** Thẻ có tiêu đề — bố cục lặp lại ở gần như mọi trang. */
export function SectionCard({
  title,
  description,
  icon: Icon,
  iconClassName,
  actions,
  compact = false,
  className,
  contentClassName,
  children,
}: SectionCardProps) {
  return (
    <Card className={className}>
      <CardHeader
        className={cn(
          compact && "border-b border-slate-100 pb-3",
          actions &&
            "flex-col items-start gap-3 space-y-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4",
        )}
      >
        <div className="min-w-0">
          <CardTitle
            className={cn("flex items-center gap-2", compact && "text-sm")}
          >
            {Icon && (
              <Icon
                className={cn("text-primary-600 size-5", iconClassName)}
              />
            )}
            {title}
          </CardTitle>
          {description && (
            <CardDescription className={cn("mt-1", compact && "text-xs")}>
              {description}
            </CardDescription>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        )}
      </CardHeader>
      <CardContent className={cn("space-y-4", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
