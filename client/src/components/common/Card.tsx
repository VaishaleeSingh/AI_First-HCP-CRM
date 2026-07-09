import { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/helpers/classNames";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  action?: ReactNode;
}

export const Card = ({
  action,
  children,
  className,
  description,
  title,
  ...props
}: CardProps) => (
  <section
    className={cn(
      "rounded-lg border border-slate-200 bg-white shadow-panel",
      className,
    )}
    {...props}
  >
    {(title || description || action) && (
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
        <div>
          {title && (
            <h2 className="text-base font-semibold text-slate-950">{title}</h2>
          )}
          {description && (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          )}
        </div>
        {action}
      </div>
    )}
    {children}
  </section>
);
