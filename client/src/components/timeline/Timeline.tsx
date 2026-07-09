import { ReactNode } from "react";

export interface TimelineItem {
  id: string | number;
  title: string;
  description: string;
  meta: string;
  icon?: ReactNode;
}

export const Timeline = ({ items }: { items: TimelineItem[] }) => (
  <div className="space-y-4">
    {items.map((item) => (
      <div className="relative flex gap-3 pl-1" key={item.id}>
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 ring-1 ring-brand-100">
          {item.icon}
        </div>
        <div className="min-w-0 flex-1 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-950">{item.title}</p>
            <span className="text-xs font-medium text-slate-400">
              {item.meta}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">{item.description}</p>
        </div>
      </div>
    ))}
  </div>
);
