import {
  Bell,
  CalendarClock,
  ClipboardList,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  UsersRound,
} from "lucide-react";
import { FormEvent, KeyboardEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector } from "../../hooks/redux";
import { Avatar } from "../common/Avatar";
import { Button } from "../buttons/Button";
import { Input } from "../inputs/Input";

interface NavbarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const Navbar = ({ sidebarOpen, onToggleSidebar }: NavbarProps) => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const summary = useAppSelector((state) => state.dashboard.summary);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const userName = user?.name ?? "Field Representative";
  const roleLabel = user?.role?.replace("_", " ") ?? "field representative";
  const notificationItems = [
    {
      description: `${summary.pendingFollowUps} follow-up item${summary.pendingFollowUps === 1 ? "" : "s"} need review`,
      icon: ClipboardList,
      path: "/dashboard#recent-interactions",
      title: "Pending follow-ups",
    },
    {
      description: `${summary.upcomingMeetings} upcoming HCP meeting${summary.upcomingMeetings === 1 ? "" : "s"}`,
      icon: CalendarClock,
      path: "/hcp?sort=follow_up_asc",
      title: "Upcoming meetings",
    },
    {
      description: "Open AI chat mode to log a field conversation",
      icon: UsersRound,
      path: "/interactions/new?mode=ai",
      title: "AI interaction logging",
    },
  ];

  const runSearch = () => {
    const query = searchTerm.trim();
    navigate(query ? `/hcp?search=${encodeURIComponent(query)}` : "/hcp");
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    runSearch();
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      runSearch();
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
        <Button
          aria-label="Toggle navigation"
          className="h-9 w-9 shrink-0 px-0"
          leftIcon={
            <>
              <Menu className="h-4 w-4 lg:hidden" />
              {sidebarOpen ? (
                <PanelLeftClose className="hidden h-4 w-4 lg:block" />
              ) : (
                <PanelLeftOpen className="hidden h-4 w-4 lg:block" />
              )}
            </>
          }
          onClick={onToggleSidebar}
          variant="ghost"
        >
          <span className="sr-only">Toggle navigation</span>
        </Button>
        <form
          className="relative hidden w-full max-w-md sm:block"
          onSubmit={handleSearch}
        >
          <Input
            aria-label="Search CRM"
            className="pl-10 pr-10"
            onKeyDown={handleSearchKeyDown}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search doctors, hospitals, interactions"
            value={searchTerm}
          />
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <button
            aria-label="Run CRM search"
            className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-brand-700"
            type="submit"
          >
            <Search className="h-4 w-4" />
          </button>
        </form>
        <div className="ml-auto flex items-center gap-3">
          <div className="relative">
            <Button
              aria-expanded={notificationsOpen}
              aria-label="Notifications"
              className="relative h-9 w-9 px-0"
              leftIcon={<Bell className="h-4 w-4" />}
              onClick={() => setNotificationsOpen((current) => !current)}
              variant="ghost"
            >
              <span className="sr-only">Notifications</span>
            </Button>
            <span className="pointer-events-none absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            {notificationsOpen && (
              <div className="absolute right-0 top-11 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-panel">
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-bold text-slate-950">
                    Notifications
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    CRM activity shortcuts
                  </p>
                </div>
                <div className="divide-y divide-slate-100">
                  {notificationItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <Link
                        className="flex gap-3 px-4 py-3 text-sm transition hover:bg-brand-50"
                        key={item.title}
                        onClick={() => setNotificationsOpen(false)}
                        to={item.path}
                      >
                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="block font-semibold text-slate-800">
                            {item.title}
                          </span>
                          <span className="mt-0.5 block break-words text-xs leading-5 text-slate-500">
                            {item.description}
                          </span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-slate-950">{userName}</p>
            <p className="text-xs capitalize text-slate-500">
              {user?.territory ?? "Assigned territory"} | {roleLabel}
            </p>
          </div>
          <Avatar name={userName} />
        </div>
      </div>
    </header>
  );
};
