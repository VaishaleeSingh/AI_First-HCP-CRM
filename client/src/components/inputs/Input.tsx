import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "../../utils/helpers/classNames";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, ...props }, ref) => (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-semibold text-slate-700">
          {label}
        </span>
      )}
      <input
        ref={ref}
        className={cn(
          "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100",
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

Input.displayName = "Input";
