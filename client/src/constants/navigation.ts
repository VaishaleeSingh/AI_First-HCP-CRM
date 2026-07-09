import {
  CalendarCheck,
  LayoutDashboard,
  Settings,
  Stethoscope,
  UserRoundPlus,
} from "lucide-react";

export const navigationItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "HCP List", path: "/hcp", icon: Stethoscope },
  { label: "Log Interaction", path: "/interactions/new", icon: CalendarCheck },
  { label: "Add HCP", path: "/hcp/new", icon: UserRoundPlus },
  { label: "Settings", path: "/settings", icon: Settings },
];
