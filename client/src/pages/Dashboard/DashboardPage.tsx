import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FileText,
  Plus,
  UsersRound,
} from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../../components/common/Badge";
import { Card } from "../../components/common/Card";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchDashboardSummary } from "../../redux/slices/dashboardSlice";
import { formatShortDate } from "../../utils/formatters/date";

const statCards = [
  {
    label: "Today's Visits",
    valueKey: "todaysVisits",
    icon: CalendarClock,
    path: "/dashboard#recent-interactions",
    tone: "blue",
  },
  {
    label: "Upcoming Meetings",
    valueKey: "upcomingMeetings",
    icon: UsersRound,
    path: "/hcp?sort=follow_up_asc",
    tone: "green",
  },
  {
    label: "Pending Follow-ups",
    valueKey: "pendingFollowUps",
    icon: ClipboardList,
    path: "/dashboard#recent-interactions",
    tone: "amber",
  },
  {
    label: "Completion Rate",
    valueKey: "completionRate",
    icon: CheckCircle2,
    path: "/dashboard#quick-actions",
    tone: "blue",
  },
] as const;

export const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const { error, loading, summary } = useAppSelector(
    (state) => state.dashboard,
  );
  const fallbackInteractions = useAppSelector(
    (state) => state.interaction.interactions,
  );
  const interactions =
    summary.recentInteractions.length > 0
      ? summary.recentInteractions
      : fallbackInteractions;

  useEffect(() => {
    dispatch(fetchDashboardSummary());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700">
            Field Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Territory activity
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Review visits, follow-ups, and AI-assisted interaction quality
            across your HCP panel.
          </p>
        </div>
        <Link
          className="inline-flex h-10 max-w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-center text-sm font-semibold leading-5 text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          to="/interactions/new"
        >
          <Plus className="h-4 w-4 shrink-0" />
          <span className="min-w-0 truncate">Log Interaction</span>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const value = summary[stat.valueKey];

          return (
            <Link
              className="rounded-lg transition hover:-translate-y-0.5 hover:shadow-panel focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
              key={stat.label}
              to={stat.path}
            >
              <Card className="h-full p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-slate-950">
                      {stat.valueKey === "completionRate" ? `${value}%` : value}
                    </p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {(loading || error) && (
        <Card className="p-5">
          <p
            className={`text-sm font-semibold ${
              error ? "text-rose-600" : "text-slate-500"
            }`}
          >
            {error ?? "Loading dashboard data..."}
          </p>
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Card
          id="recent-interactions"
          title="Recent Interactions"
          description="Latest HCP conversations and outcomes"
        >
          <div className="divide-y divide-slate-100">
            {interactions.map((interaction) => (
              <div
                className="flex items-start justify-between gap-4 px-5 py-4"
                key={interaction.id}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-950">
                      {interaction.doctorName}
                    </p>
                    <Badge
                      tone={
                        interaction.sentiment === "positive" ? "green" : "slate"
                      }
                    >
                      {interaction.sentiment}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {interaction.summary}
                  </p>
                  <p className="mt-2 text-xs font-semibold text-slate-400">
                    {formatShortDate(interaction.meetingDate)} at{" "}
                    {interaction.hospitalName}
                  </p>
                </div>
                <Badge>
                  {Math.round(interaction.confidenceScore * 100)}% AI confidence
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card
          id="quick-actions"
          title="Quick Actions"
          description="Common CRM workflows"
        >
          <div className="space-y-3 p-5">
            {[
              {
                label: "Log structured visit",
                path: "/interactions/new?mode=manual",
                icon: FileText,
              },
              {
                label: "Start AI conversation",
                path: "/interactions/new?mode=ai",
                icon: ClipboardList,
              },
              { label: "Review HCP panel", path: "/hcp", icon: UsersRound },
            ].map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-brand-200 hover:bg-brand-50"
                  key={action.label}
                  to={action.path}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-brand-700" />
                    {action.label}
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </Link>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};
