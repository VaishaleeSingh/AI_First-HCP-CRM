import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { navigationItems } from "../../constants/navigation";
import { cn } from "../../utils/helpers/classNames";

interface SidebarProps {
  isExpanded: boolean;
  isMobileOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

export const Sidebar = ({
  isExpanded,
  isMobileOpen,
  onClose,
  onToggle,
}: SidebarProps) => {
  const closeOnMobile = () => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 1023px)").matches
    ) {
      onClose();
    }
  };

  return (
    <>
      <button
        aria-label="Close navigation overlay"
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/35 transition-opacity lg:hidden",
          isMobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        type="button"
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex min-h-screen w-72 shrink-0 flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-200 lg:sticky lg:top-0 lg:z-20 lg:shadow-none",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isExpanded ? "lg:w-64" : "lg:w-20",
        )}
      >
        <div
          className={cn(
            "flex min-h-20 items-center border-b border-slate-100 px-4",
            isExpanded
              ? "justify-between"
              : "justify-between lg:justify-center",
          )}
        >
          <div className={cn("min-w-0", !isExpanded && "lg:hidden")}>
            <p className="break-words text-xs font-bold uppercase tracking-[0.18em] text-brand-600">
              AI-First CRM
            </p>
            <h1 className="mt-1 break-words text-lg font-bold leading-6 text-slate-950">
              HCP Module
            </h1>
          </div>
          <button
            aria-label="Close navigation"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
          <button
            aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
            className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:inline-flex"
            onClick={onToggle}
            type="button"
          >
            {isExpanded ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </div>
        <nav className="space-y-1 px-3 py-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                className={({ isActive }) =>
                  cn(
                    "flex min-h-11 items-center rounded-lg px-3 py-2.5 text-sm font-semibold leading-5 transition",
                    isExpanded ? "gap-3" : "gap-3 lg:justify-center lg:gap-0",
                    isActive
                      ? "bg-brand-50 text-brand-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                  )
                }
                key={item.path}
                onClick={closeOnMobile}
                end={item.path === "/hcp"}
                title={item.label}
                to={item.path}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span
                  className={cn(
                    "min-w-0 break-words",
                    !isExpanded && "lg:hidden",
                  )}
                >
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
