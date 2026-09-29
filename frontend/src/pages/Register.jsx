import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

    const name = formData.name.trim();
    const email = formData.email.trim();

    if (!name || !email || !formData.password || !confirmPassword) {
      setError("Please complete all required fields.");
      return;
    }

    if (name.length < 2) {
      setError("Name must contain at least 2 characters.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (formData.password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await registerUser({
        name,
        email,
        password: formData.password,
        role: formData.role,
      });

      navigate("/login", {
        replace: true,
        state: {
          message:
            "Account created successfully. Please sign in to continue.",
        },
      });
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.message ||
        "Unable to create your account. Please try again.";

      setError(
        typeof message === "string"
          ? message
          : "Unable to create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">

        {/* Registration form */}
        <section className="order-2 flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:order-1">
          <div className="w-full max-w-lg">

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
                  Get started
                </span>

                <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  Create your account
                </h1>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Join the academic workspace as a student or teacher.
                </p>
              </div>

              {error && (
                <div className="mt-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <span className="mt-0.5">!</span>
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Full name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>

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
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Account type
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((previous) => ({
                          ...previous,
                          role: "student",
                        }))
                      }
                      className={`rounded-xl border p-4 text-left transition ${
                        formData.role === "student"
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-lg text-base ${
                            formData.role === "student"
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          S
                        </span>

                        {formData.role === "student" && (
                          <span className="text-sm font-bold text-blue-600">
                            ✓
                          </span>
                        )}
                      </div>

                      <p className="mt-3 text-sm font-semibold text-slate-900">
                        Student
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Submit work and track feedback.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setFormData((previous) => ({
                          ...previous,
                          role: "teacher",
                        }))
                      }
                      className={`rounded-xl border p-4 text-left transition ${
                        formData.role === "teacher"
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-lg text-base ${
                            formData.role === "teacher"
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          T
                        </span>

                        {formData.role === "teacher" && (
                          <span className="text-sm font-bold text-blue-600">
                            ✓
                          </span>
                        )}
                      </div>

                      <p className="mt-3 text-sm font-semibold text-slate-900">
                        Teacher
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Manage courses and grade submissions.
                      </p>
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="At least 8 characters"
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

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Confirm password
                  </label>

                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(event) => {
                        setConfirmPassword(event.target.value);
                        if (error) setError("");
                      }}
                      placeholder="Re-enter your password"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-12 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((value) => !value)
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-sm text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                      {showConfirmPassword ? "◉" : "○"}
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
                      Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </button>
              </form>

              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs text-slate-400">ALREADY A USER?</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <Link
                to="/login"
                className="flex h-12 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Sign in instead
              </Link>
            </div>

            <p className="mt-6 text-center text-xs text-slate-400">
              By creating an account, you agree to use the portal responsibly.
            </p>
          </div>
        </section>

        {/* Brand panel */}
        <section className="relative order-1 hidden overflow-hidden bg-slate-950 lg:order-2 lg:flex">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-20 h-[28rem] w-[28rem] rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">
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

            <div className="max-w-lg">
              <span className="inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
                BUILT FOR ACADEMIC WORKFLOWS
              </span>

              <h2 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
                Everything your
                <span className="block text-blue-400">
                  classroom needs.
                </span>
              </h2>

              <p className="mt-6 text-base leading-7 text-slate-400">
                A structured workspace connecting students and teachers for
                assignments, submissions, grading, and feedback.
              </p>

              <div className="mt-10 space-y-4">
                {[
                  ["✓", "Centralized assignment management"],
                  ["✓", "Submission and version tracking"],
                  ["✓", "Teacher grading and feedback"],
                ].map(([icon, text]) => (
                  <div
                    key={text}
                    className="flex items-center gap-3 text-sm text-slate-300"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                      {icon}
                    </span>
                    {text}
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-500">
              CloudAssign • Academic workflow platform
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Register;