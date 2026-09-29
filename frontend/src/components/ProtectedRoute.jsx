import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";


function ProtectedRoute({ allowedRole }) {
  const {
    user,
    loading,
    isAuthenticated,
  } = useAuth();


  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="text-slate-600">
          Loading...
        </p>
      </div>
    );
  }


  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  if (
    allowedRole &&
    user.role !== allowedRole
  ) {
    if (user.role === "teacher") {
      return (
        <Navigate
          to="/teacher"
          replace
        />
      );
    }

    return (
      <Navigate
        to="/student"
        replace
      />
    );
  }


  return <Outlet />;
}


export default ProtectedRoute;
