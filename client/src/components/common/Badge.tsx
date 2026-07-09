import { HTMLAttributes } from "react";
import { cn } from "../../utils/helpers/classNames";

type BadgeTone = "blue" | "green" | "amber" | "rose" | "slate";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const tones: Record<BadgeTone, string> = {
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  blue: "bg-brand-50 text-brand-700 ring-brand-100",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  rose: "bg-rose-50 text-rose-700 ring-rose-200",
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
};

export const Badge = ({
  children,
  className,
  tone = "blue",
  ...props
}: BadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
      tones[tone],
      className,
    )}
    {...props}
  >
    {children}
  </span>
);
