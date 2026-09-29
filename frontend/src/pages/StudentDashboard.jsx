import { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import StatCard from "../components/StatCard";
import {
  downloadSubmission,
  getAssignments,
  getMySubmissions,
  getSubmissionHistory,
  submitAssignment,
} from "../services/studentService";

function formatDate(dateValue) {
  if (!dateValue) return "—";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(dateValue) {
  if (!dateValue) return "—";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDeadlineInfo(deadline) {
  const now = new Date();
  const target = new Date(deadline);

  if (Number.isNaN(target.getTime())) {
    return {
      label: "Unknown",
      tone: "slate",
      overdue: false,
      urgent: false,
      hoursRemaining: null,
    };
  }

  const difference = target.getTime() - now.getTime();
  const hoursRemaining = difference / (1000 * 60 * 60);

  if (difference < 0) {
    return {
      label: "Deadline passed",
      tone: "red",
      overdue: true,
      urgent: true,
      hoursRemaining,
    };
  }

  if (hoursRemaining <= 24) {
    return {
      label: "Due within 24 hours",
      tone: "red",
      overdue: false,
      urgent: true,
      hoursRemaining,
    };
  }

  if (hoursRemaining <= 72) {
    return {
      label: "Due within 3 days",
      tone: "amber",
      overdue: false,
      urgent: true,
      hoursRemaining,
    };
  }

  return {
    label: `Due ${formatDate(deadline)}`,
    tone: "blue",
    overdue: false,
    urgent: false,
    hoursRemaining,
  };
}

function getStatus(submission) {
  if (!submission) {
    return {
      label: "Not submitted",
      className: "bg-slate-100 text-slate-600",
      icon: "○",
    };
  }

  if (
    submission.submission_status === "GRADED" ||
    submission.marks !== null &&
      submission.marks !== undefined
  ) {
    return {
      label: "Graded",
      className: "bg-emerald-50 text-emerald-700",
      icon: "✓",
    };
  }

  return {
    label: "Submitted",
    className: "bg-blue-50 text-blue-700",
    icon: "↑",
  };
}

function SubmissionModal({
  assignment,
  existingSubmission,
  onClose,
  onSuccess,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const allowedExtensions = useMemo(() => {
    return (assignment.allowed_file_types || "")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);
  }, [assignment]);

  const validateFile = (file) => {
    if (!file) return "Please select a file.";

    const extension =
      "." +
      file.name
        .split(".")
        .pop()
        .toLowerCase();

    if (
      allowedExtensions.length &&
      !allowedExtensions.includes(extension)
    ) {
      return `File type ${extension} is not allowed. Allowed types: ${allowedExtensions.join(
        ", "
      )}`;
    }

    const maxBytes =
      Number(assignment.max_file_size_mb || 10) *
      1024 *
      1024;

    if (file.size > maxBytes) {
      return `File size must be ${assignment.max_file_size_mb} MB or less.`;
    }

    return "";
  };

  const chooseFile = (file) => {
    const validationError = validateFile(file);

    if (validationError) {
      setSelectedFile(null);
      setError(validationError);
      return;
    }

    setSelectedFile(file);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      setError("Please select a file first.");
      return;
    }

    try {
      setUploading(true);
      setError("");

      const result = await submitAssignment(
        assignment.assignment_id,
        selectedFile
      );

      onSuccess(result);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Unable to submit the assignment."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              {existingSubmission
                ? "Resubmission"
                : "Assignment submission"}
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {assignment.title}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Due {formatDateTime(assignment.deadline)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-900">
              Submission requirements
            </p>

            <div className="mt-2 grid gap-2 text-xs text-blue-700 sm:grid-cols-2">
              <span>
                File types:{" "}
                {assignment.allowed_file_types || "Any"}
              </span>

              <span>
                Maximum size:{" "}
                {assignment.max_file_size_mb} MB
              </span>

              <span>
                Maximum marks: {assignment.max_marks}
              </span>

              <span>
                Late submission:{" "}
                {assignment.allow_late_submission
                  ? "Allowed"
                  : "Not allowed"}
              </span>
            </div>
          </div>

          <label
            htmlFor="submission-file"
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              chooseFile(event.dataTransfer.files?.[0]);
            }}
            className={`flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition ${
              dragging
                ? "border-blue-500 bg-blue-50"
                : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50"
            }`}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
              ↑
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-800">
              {selectedFile
                ? selectedFile.name
                : "Drop your file here or click to browse"}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {selectedFile
                ? `${(
                    selectedFile.size /
                    (1024 * 1024)
                  ).toFixed(2)} MB`
                : "Upload your assignment file"}
            </p>

            <input
              id="submission-file"
              type="file"
              className="hidden"
              onChange={(event) =>
                chooseFile(event.target.files?.[0])
              }
            />
          </label>

          {existingSubmission && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Your current submission is version{" "}
              <strong>
                {existingSubmission.version_number}
              </strong>
              . Uploading another file will create a new
              submission version.
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={uploading}
              className="flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Submit assignment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function HistoryModal({
  assignment,
  onClose,
}) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await getSubmissionHistory(
          assignment.assignment_id
        );

        setHistory(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(
          err?.response?.data?.detail ||
            "Unable to load submission history."
        );
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [assignment]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Submission history
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {assignment.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-400 hover:bg-slate-100"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-20 animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            history.length === 0 && (
              <div className="py-10 text-center">
                <p className="font-semibold text-slate-700">
                  No submission history
                </p>
              </div>
            )}

          {!loading && !error && history.length > 0 && (
            <div className="space-y-3">
              {history.map((submission) => {
                const graded = getStatus(submission);

                return (
                  <div
                    key={submission.submission_id}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-slate-800">
                            Version{" "}
                            {submission.version_number}
                          </span>

                          <span
                            className={`rounded-full px-2 py-1 text-[11px] font-semibold ${graded.className}`}
                          >
                            {graded.label}
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          {submission.file_name}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {formatDateTime(
                            submission.submitted_at
                          )}
                        </p>
                      </div>

                      {submission.marks !== null &&
                        submission.marks !== undefined && (
                          <div className="rounded-xl bg-emerald-50 px-4 py-3 text-center">
                            <p className="text-[10px] uppercase text-emerald-500">
                              Marks
                            </p>

                            <p className="font-bold text-emerald-700">
                              {submission.marks}
                            </p>
                          </div>
                        )}
                    </div>

                    {submission.feedback && (
                      <div className="mt-3 rounded-xl bg-slate-50 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                          Teacher feedback
                        </p>

                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {submission.feedback}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StudentDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [selectedAssignment, setSelectedAssignment] =
    useState(null);

  const [historyAssignment, setHistoryAssignment] =
    useState(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [assignmentData, submissionData] =
        await Promise.all([
          getAssignments(),
          getMySubmissions(),
        ]);

      setAssignments(
        Array.isArray(assignmentData)
          ? assignmentData
          : []
      );

      setSubmissions(
        Array.isArray(submissionData)
          ? submissionData
          : []
      );
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Unable to load the student dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (!successMessage) return;

    const timer = setTimeout(
      () => setSuccessMessage(""),
      4000
    );

    return () => clearTimeout(timer);
  }, [successMessage]);

  const latestSubmissionByAssignment = useMemo(() => {
    const map = new Map();

    submissions.forEach((submission) => {
      const current = map.get(
        submission.assignment_id
      );

      if (
        !current ||
        submission.version_number >
          current.version_number
      ) {
        map.set(
          submission.assignment_id,
          submission
        );
      }
    });

    return map;
  }, [submissions]);

  const assignmentRows = useMemo(() => {
    return assignments.map((assignment) => {
      const submission =
        latestSubmissionByAssignment.get(
          assignment.assignment_id
        );

      return {
        assignment,
        submission,
        deadlineInfo: getDeadlineInfo(
          assignment.deadline
        ),
        status: getStatus(submission),
      };
    });
  }, [assignments, latestSubmissionByAssignment]);

  const upcomingAssignments = useMemo(() => {
    return assignmentRows
      .filter(
        ({ assignment, submission }) => {
          if (submission) return false;

          const deadline = new Date(
            assignment.deadline
          );

          return (
            !Number.isNaN(deadline.getTime()) &&
            deadline.getTime() > Date.now()
          );
        }
      )
      .sort(
        (a, b) =>
          new Date(a.assignment.deadline) -
          new Date(b.assignment.deadline)
      )
      .slice(0, 4);
  }, [assignmentRows]);

  const pendingCount = assignmentRows.filter(
    ({ submission }) => !submission
  ).length;

  const submittedCount = assignmentRows.filter(
    ({ submission }) =>
      submission &&
      !(
        submission.submission_status === "GRADED" ||
        submission.marks !== null &&
          submission.marks !== undefined
      )
  ).length;

  const gradedCount = assignmentRows.filter(
    ({ submission }) =>
      submission &&
      (
        submission.submission_status === "GRADED" ||
        submission.marks !== null &&
          submission.marks !== undefined
      )
  ).length;

  const feedbackCount = submissions.filter(
    (submission) => Boolean(submission.feedback)
  ).length;

  const handleSubmissionSuccess = async () => {
    setSelectedAssignment(null);
    setSuccessMessage(
      "Assignment submitted successfully."
    );

    await loadDashboard();
  };

  const handleDownload = async (submission) => {
    try {
      const response = await downloadSubmission(
        submission.submission_id
      );

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);

      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download =
        submission.file_name || "submission";

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.URL.revokeObjectURL(url);
    } catch {
      setError("Unable to download your submission.");
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">

        {/* Mobile heading */}
        <div className="lg:hidden">
          <p className="text-sm font-semibold text-blue-600">
            Student Workspace
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Student Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Track assignments, deadlines, submissions, and feedback.
          </p>
        </div>

        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 shadow-sm sm:p-8">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />

          <div className="relative z-10">
            <span className="inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
              STUDENT WORKSPACE
            </span>

            <h2 className="mt-4 max-w-3xl text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Stay ahead of every assignment deadline.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              See what is due, what you have submitted, and
              where teacher feedback is available.
            </p>
          </div>
        </section>

        {/* Messages */}
        {successMessage && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 font-bold">
              ✓
            </span>
            {successMessage}
          </div>
        )}

        {error && (
          <div className="flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
            >
              ×
            </button>
          </div>
        )}

        {/* Stats */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Your progress
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              A quick view of your current assignment status.
            </p>
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-32 animate-pulse rounded-2xl bg-white"
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="To submit"
                value={pendingCount}
                subtitle="Assignments awaiting submission"
                icon="○"
                iconBg="bg-slate-100"
                iconColor="text-slate-600"
              />

              <StatCard
                title="Submitted"
                value={submittedCount}
                subtitle="Waiting for grading"
                icon="↑"
                iconBg="bg-blue-50"
                iconColor="text-blue-600"
              />

              <StatCard
                title="Graded"
                value={gradedCount}
                subtitle="Completed assignments"
                icon="✓"
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
              />

              <StatCard
                title="Feedback"
                value={feedbackCount}
                subtitle="Submissions with feedback"
                icon="✦"
                iconBg="bg-indigo-50"
                iconColor="text-indigo-600"
              />
            </div>
          )}
        </section>

        {/* Deadline alerts */}
        <section>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Upcoming deadlines
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Prioritize assignments that are due soon.
              </p>
            </div>

            {upcomingAssignments.some(
              ({ deadlineInfo }) => deadlineInfo.urgent
            ) && (
              <span className="w-fit rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
                Deadline attention required
              </span>
            )}
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="h-32 animate-pulse rounded-2xl bg-white"
                />
              ))}
            </div>
          ) : upcomingAssignments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                ✓
              </div>

              <h3 className="mt-3 font-semibold text-slate-800">
                You are all caught up
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                No unsubmitted upcoming assignments are currently due.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {upcomingAssignments.map(
                ({
                  assignment,
                  deadlineInfo,
                }) => (
                  <div
                    key={assignment.assignment_id}
                    className={`rounded-2xl border bg-white p-5 shadow-sm ${
                      deadlineInfo.tone === "red"
                        ? "border-red-200"
                        : deadlineInfo.tone === "amber"
                        ? "border-amber-200"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900">
                          {assignment.title}
                        </h3>

                        <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                          {assignment.description}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          deadlineInfo.tone === "red"
                            ? "bg-red-50 text-red-700"
                            : deadlineInfo.tone === "amber"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {deadlineInfo.label}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-slate-400">
                        Deadline:{" "}
                        {formatDateTime(
                          assignment.deadline
                        )}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedAssignment(
                            assignment
                          )
                        }
                        className="h-9 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-700"
                      >
                        Submit now
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>

        {/* All assignments */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="font-bold text-slate-900">
              All assignments
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              View status, deadlines, grades, and feedback.
            </p>
          </div>

          {loading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-24 animate-pulse rounded-2xl bg-slate-100"
                />
              ))}
            </div>
          ) : assignmentRows.length === 0 ? (
            <div className="p-12 text-center">
              <p className="font-semibold text-slate-700">
                No assignments available
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Your teacher has not published any assignments yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {assignmentRows.map(
                ({
                  assignment,
                  submission,
                  deadlineInfo,
                  status,
                }) => (
                  <div
                    key={assignment.assignment_id}
                    className="p-5 transition hover:bg-slate-50"
                  >
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                      <div className="flex min-w-0 gap-4">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg ${
                            status.label === "Graded"
                              ? "bg-emerald-50 text-emerald-600"
                              : status.label === "Submitted"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {status.icon}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-slate-900">
                              {assignment.title}
                            </h3>

                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.className}`}
                            >
                              {status.label}
                            </span>
                          </div>

                          <p className="mt-1 text-sm text-slate-500">
                            Due{" "}
                            {formatDateTime(
                              assignment.deadline
                            )}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                            <span>
                              Max marks:{" "}
                              {assignment.max_marks}
                            </span>

                            {submission && (
                              <span>
                                Version{" "}
                                {submission.version_number}
                              </span>
                            )}

                            {submission?.feedback && (
                              <span className="font-semibold text-indigo-500">
                                Feedback available
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                        {submission?.marks !== null &&
                          submission?.marks !== undefined && (
                            <div className="rounded-xl bg-emerald-50 px-4 py-2 text-center">
                              <p className="text-[10px] font-semibold uppercase text-emerald-500">
                                Score
                              </p>

                              <p className="font-bold text-emerald-700">
                                {submission.marks} /{" "}
                                {assignment.max_marks}
                              </p>
                            </div>
                          )}

                        {submission && (
                          <button
                            type="button"
                            onClick={() =>
                              handleDownload(
                                submission
                              )
                            }
                            className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Download
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            setHistoryAssignment(
                              assignment
                            )
                          }
                          className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          History
                        </button>

                        {!submission && (
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedAssignment(
                                assignment
                              )
                            }
                            className="h-10 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
                          >
                            Submit
                          </button>
                        )}

                        {submission &&
                          submission.submission_status !==
                            "GRADED" &&
                          submission.marks === null && (
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedAssignment(
                                  assignment
                                )
                              }
                              className="h-10 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
                            >
                              Resubmit
                            </button>
                          )}
                      </div>
                    </div>

                    {submission?.feedback && (
                      <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-500">
                          Teacher feedback
                        </p>

                        <p className="mt-1 text-sm leading-6 text-indigo-900">
                          {submission.feedback}
                        </p>
                      </div>
                    )}

                    {!submission &&
                      deadlineInfo.overdue && (
                        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-medium text-red-700">
                          This assignment deadline has passed.
                        </div>
                      )}
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </div>

      {selectedAssignment && (
        <SubmissionModal
          assignment={selectedAssignment}
          existingSubmission={latestSubmissionByAssignment.get(
            selectedAssignment.assignment_id
          )}
          onClose={() => setSelectedAssignment(null)}
          onSuccess={handleSubmissionSuccess}
        />
      )}

      {historyAssignment && (
        <HistoryModal
          assignment={historyAssignment}
          onClose={() => setHistoryAssignment(null)}
        />
      )}
    </AppShell>
  );
}

export default StudentDashboard;