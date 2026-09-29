import { useState } from "react";
import { NavLink } from "react-router-dom";

import { useAuth } from "../context/AuthContext";


function Sidebar() {
  const { user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] =
    useState(false);


  const isTeacher =
    user?.role === "teacher";


  const navigationItems = isTeacher
    ? [
        {
          label: "Dashboard",
          path: "/teacher",
          icon: "▦",
        },
      ]
    : [
        {
          label: "Dashboard",
          path: "/student",
          icon: "▦",
        },
      ];


  const closeMobileMenu = () => {
    setMobileOpen(false);
  };


  const handleLogout = () => {
    closeMobileMenu();
    logout();
  };


  return (
    <>
      {/* =================================================
          MOBILE TOP BAR
          ================================================= */}

      <div className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur lg:hidden">

        <button
          type="button"
          onClick={() =>
            setMobileOpen(true)
          }
          aria-label="Open navigation menu"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-xl text-slate-700 transition hover:bg-slate-100"
        >
          ☰
        </button>


        <div className="flex items-center gap-2">

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-sm">
            CA
          </div>

          <span className="text-base font-bold text-slate-900">
            CloudAssign
          </span>

        </div>


        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
          {user?.name
            ?.charAt(0)
            ?.toUpperCase() || "U"}
        </div>

      </div>


      {/* =================================================
          MOBILE BACKDROP
          ================================================= */}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={closeMobileMenu}
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        />
      )}


      {/* =================================================
          SIDEBAR
          ================================================= */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 lg:translate-x-0 lg:shadow-none ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >

        {/* Brand */}

        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-600/20">
              CA
            </div>

            <div>
              <p className="text-base font-bold tracking-tight text-slate-900">
                CloudAssign
              </p>

              <p className="text-xs text-slate-500">
                Academic Portal
              </p>
            </div>

          </div>


          <button
            type="button"
            onClick={closeMobileMenu}
            aria-label="Close navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          >
            ×
          </button>

        </div>


        {/* User profile */}

        <div className="border-b border-slate-100 px-4 py-5">

          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
              {user?.name
                ?.charAt(0)
                ?.toUpperCase() || "U"}
            </div>


            <div className="min-w-0">

              <p className="truncate text-sm font-semibold text-slate-900">
                {user?.name || "User"}
              </p>

              <p className="mt-0.5 text-xs capitalize text-slate-500">
                {user?.role || "User"}
              </p>

            </div>

          </div>

        </div>


        {/* Navigation */}

        <nav className="flex-1 overflow-y-auto px-4 py-5">

          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Main Menu
          </p>


          <div className="space-y-1">

            {navigationItems.map(
              (item) => (

                <NavLink
                  key={item.path}
                  to={item.path}
                  end
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-blue-50 text-blue-700 shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`
                  }
                >

                  {({ isActive }) => (
                    <>
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-lg text-base transition ${
                          isActive
                            ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                            : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700"
                        }`}
                      >
                        {item.icon}
                      </span>

                      <span>
                        {item.label}
                      </span>

                      {isActive && (
                        <span className="ml-auto h-2 w-2 rounded-full bg-blue-600" />
                      )}
                    </>
                  )}

                </NavLink>

              )
            )}

          </div>


          {/* Coming soon sections */}

          <p className="mb-3 mt-8 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Workspace
          </p>


          <div className="space-y-1">

            <button
              type="button"
              disabled
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-400"
            >

              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                ◫
              </span>

              <span>
                {isTeacher
                  ? "Submissions"
                  : "Assignments"}
              </span>

              <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                Soon
              </span>

            </button>


            <button
              type="button"
              disabled
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-400"
            >

              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                ◷
              </span>

              <span>
                {isTeacher
                  ? "Analytics"
                  : "Feedback"}
              </span>

              <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                Soon
              </span>

            </button>

          </div>

        </nav>


        {/* Bottom area */}

        <div className="border-t border-slate-100 p-4">

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >

            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-base">
              ↪
            </span>

            <span>
              Sign Out
            </span>

          </button>


          <p className="mt-3 text-center text-[11px] text-slate-400">
            CloudAssign • v1.0
          </p>

        </div>

      </aside>


      {/* =================================================
          DESKTOP CONTENT SPACER
          ================================================= */}

      <div className="hidden w-72 shrink-0 lg:block" />

    </>
  );
}


export default Sidebar;