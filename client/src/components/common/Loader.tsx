import { Loader2 } from "lucide-react";

export const Loader = ({ label = "Loading" }: { label?: string }) => (
  <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
    <Loader2 className="h-4 w-4 animate-spin" />
    {label}
  </div>
);
