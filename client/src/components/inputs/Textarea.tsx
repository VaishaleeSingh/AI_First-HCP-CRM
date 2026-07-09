import { forwardRef, TextareaHTMLAttributes } from "react";
import { cn } from "../../utils/helpers/classNames";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, ...props }, ref) => (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-semibold text-slate-700">
          {label}
        </span>
      )}
      <textarea
        ref={ref}
        className={cn(
          "min-h-28 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100",
          error && "border-rose-300 focus:border-rose-500 focus:ring-rose-100",
          className,
        )}
        {...props}
      />
      {error && (
        <span className="mt-1 block text-xs font-medium text-rose-600">
          {error}
        </span>
      )}
    </label>
  ),
);

Textarea.displayName = "Textarea";
