import { ReactNode } from "react";
import { cn } from "../../utils/helpers/classNames";

export interface TabItem<T extends string> {
  label: string;
  value: T;
  icon?: ReactNode;
}

interface TabsProps<T extends string> {
  items: Array<TabItem<T>>;
  value: T;
  onChange: (value: T) => void;
}

export const Tabs = <T extends string>({
  items,
  onChange,
  value,
}: TabsProps<T>) => (
  <div className="flex w-full flex-wrap gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 sm:inline-flex sm:w-auto">
    {items.map((item) => (
      <button
        className={cn(
          "inline-flex min-h-10 max-w-full flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-center text-sm font-semibold leading-5 transition sm:flex-none",
          item.value === value
            ? "bg-white text-brand-700 shadow-sm"
            : "text-slate-500 hover:text-slate-800",
        )}
        key={item.value}
        onClick={() => onChange(item.value)}
        type="button"
      >
        {item.icon && <span className="shrink-0">{item.icon}</span>}
        <span className="min-w-0 break-words">{item.label}</span>
      </button>
    ))}
  </div>
);
