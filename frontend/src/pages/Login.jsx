import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(
    location.state?.message || ""
  );

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      const storedUser = localStorage.getItem("user");

      try {
        const user = storedUser ? JSON.parse(storedUser) : null;
        navigate(user?.role === "teacher" ? "/teacher" : "/student", {
          replace: true,
        });
      } catch {
        navigate("/student", { replace: true });
      }
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (location.state?.message) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.email.trim() || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      const role = result?.role;

      if (role === "teacher") {
        navigate("/teacher", { replace: true });
      } else {
        navigate("/student", { replace: true });
      }
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.message ||
        "Unable to sign in. Please check your credentials.";

      setError(
        typeof message === "string"
          ? message
          : "Unable to sign in. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">

        {/* Brand panel */}
        <section className="relative hidden overflow-hidden bg-slate-950 lg:flex">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute -bottom-40 -right-20 h-[28rem] w-[28rem] rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-600/30">
                  CA
                </div>

                <div>
                  <p className="font-bold tracking-tight text-white">
                    CloudAssign
                  </p>
                  <p className="text-xs text-slate-400">
                    Academic Portal
                  </p>
                </div>
              </div>

              <div className="mt-24 max-w-xl">
                <span className="inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
                  CLOUD-BASED ACADEMIC WORKSPACE
                </span>

                <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
                  One place to manage
                  <span className="block text-blue-400">
                    assignments & feedback.
                  </span>
                </h1>

                <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">
                  Submit assignments, manage courses, track deadlines, and
                  exchange feedback through a simple academic workspace.
                </p>
              </div>

              <div className="mt-12 grid max-w-xl grid-cols-3 gap-4">
                {[
                  ["01", "Assignments"],
                  ["02", "Submissions"],
                  ["03", "Feedback"],
                ].map(([number, label]) => (
                  <div
                    key={number}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                  >
                    <p className="text-xs font-bold text-blue-400">
                      {number}
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-200">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Secure academic workflow • Local-first • Cloud-ready
            </p>
          </div>
        </section>

        {/* Login panel */}
        <section className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
          <div className="w-full max-w-md">

            {/* Mobile brand */}
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-600/20">
                CA
              </div>

              <div>
                <p className="font-bold tracking-tight text-slate-900">
                  CloudAssign
                </p>
                <p className="text-xs text-slate-500">
                  Academic Portal
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div>
                <span className="text-sm font-semibold text-blue-600">
                  Welcome back
                </span>

                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  Sign in to your account
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Access your academic dashboard and continue your work.
                </p>
              </div>

              {successMessage && (
                <div className="mt-6 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                  <span className="mt-0.5">✓</span>
                  <p>{successMessage}</p>
                </div>
              )}

              {error && (
                <div className="mt-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <span className="mt-0.5">!</span>
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Email address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-sm font-semibold text-slate-700"
                    >
                      Password
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-12 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-sm text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                      {showPassword ? "◉" : "○"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </button>
              </form>

              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs text-slate-400">NEW USER?</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <Link
                to="/register"
                className="flex h-12 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Create an account
              </Link>
            </div>

            <p className="mt-6 text-center text-xs text-slate-400">
              CloudAssign Academic Portal • v1.0
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Login;