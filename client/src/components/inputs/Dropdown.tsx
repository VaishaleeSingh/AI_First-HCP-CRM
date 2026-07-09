import { SelectHTMLAttributes } from "react";
import { cn } from "../../utils/helpers/classNames";

interface Option {
  label: string;
  value: string | number;
}

interface DropdownProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Option[];
}

export const Dropdown = ({
  className,
  error,
  label,
  options,
  ...props
}: DropdownProps) => (
  <label className="block">
    {label && (
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
      </span>
    )}
    <select
      className={cn(
        "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100",
        error && "border-rose-300 focus:border-rose-500 focus:ring-rose-100",
        className,
      )}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && (
      <span className="mt-1 block text-xs font-medium text-rose-600">
        {error}
      </span>
    )}
  </label>
);
