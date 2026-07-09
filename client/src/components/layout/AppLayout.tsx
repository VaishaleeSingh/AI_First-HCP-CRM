import { Outlet } from "react-router-dom";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { toggleSidebar } from "../../redux/slices/uiSlice";
import { ToastStack } from "../common/Toast";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export const AppLayout = () => {
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 1023px)").matches
    ) {
      setMobileSidebarOpen(true);
      return;
    }

    dispatch(toggleSidebar());
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900">
      <div className="flex">
        <Sidebar
          isExpanded={sidebarOpen}
          isMobileOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          onToggle={() => dispatch(toggleSidebar())}
        />
        <div className="min-w-0 flex-1">
          <Navbar
            onToggleSidebar={handleToggleSidebar}
            sidebarOpen={sidebarOpen}
          />
          <main className="px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
      <ToastStack />
    </div>
  );
};
