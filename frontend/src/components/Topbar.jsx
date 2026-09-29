import { useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";


function Topbar() {
  const { user } = useAuth();
  const location = useLocation();


  const getPageInfo = () => {
    if (location.pathname.startsWith("/teacher")) {
      return {
        title: "Teacher Dashboard",
        description:
          "Manage your courses, assignments, and student submissions.",
      };
    }

    if (location.pathname.startsWith("/student")) {
      return {
        title: "Student Dashboard",
        description:
          "Track assignments, submissions, deadlines, and feedback.",
      };
    }

    return {
      title: "Dashboard",
      description:
        "Welcome to your academic workspace.",
    };
  };


  const pageInfo = getPageInfo();


  return (
    <header className="sticky top-0 z-30 hidden border-b border-slate-200 bg-white/90 backdrop-blur lg:block">

      <div className="flex h-20 items-center justify-between px-8">

        {/* Page information */}

        <div className="min-w-0">

          <h1 className="truncate text-xl font-bold tracking-tight text-slate-900">
            {pageInfo.title}
          </h1>

          <p className="mt-1 truncate text-sm text-slate-500">
            {pageInfo.description}
          </p>

        </div>


        {/* Right controls */}

        <div className="ml-8 flex items-center gap-4">

          {/* Search */}

          <div className="relative hidden xl:block">

            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              ⌕
            </span>

            <input
              type="search"
              placeholder="Search..."
              aria-label="Search"
              className="h-10 w-56 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />

          </div>


          {/* Notifications */}

          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
          >
            ♢

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
          </button>


          {/* Divider */}

          <div className="h-9 w-px bg-slate-200" />


          {/* User */}

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
              {user?.name
                ?.charAt(0)
                ?.toUpperCase() || "U"}
            </div>


            <div className="hidden text-left xl:block">

              <p className="max-w-32 truncate text-sm font-semibold text-slate-900">
                {user?.name || "User"}
              </p>

              <p className="text-xs capitalize text-slate-500">
                {user?.role || "User"}
              </p>

            </div>

          </div>

        </div>

      </div>

    </header>
  );
}


export default Topbar;