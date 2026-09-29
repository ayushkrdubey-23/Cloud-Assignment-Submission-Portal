import { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import StatCard from "../components/StatCard";
import {
  createAssignment,
  createCourse,
  downloadSubmission,
  getAllAssignmentSubmissions,
  getAssignments,
  getMyCourses,
  gradeSubmission,
} from "../services/teacherService";

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

function isGraded(submission) {
  return (
    submission?.submission_status === "GRADED" ||
    (submission?.marks !== null &&
      submission?.marks !== undefined)
  );
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
    };
  }

  const difference = target.getTime() - now.getTime();
  const hoursRemaining =
    difference / (1000 * 60 * 60);

  if (difference < 0) {
    return {
      label: "Deadline passed",
      tone: "red",
      overdue: true,
      urgent: true,
    };
  }

  if (hoursRemaining <= 24) {
    return {
      label: "Due within 24 hours",
      tone: "red",
      overdue: false,
      urgent: true,
    };
  }

  if (hoursRemaining <= 72) {
    return {
      label: "Due within 3 days",
      tone: "amber",
      overdue: false,
      urgent: true,
    };
  }

  return {
    label: "Upcoming",
    tone: "blue",
    overdue: false,
    urgent: false,
  };
}

function GradeModal({
  submission,
  assignment,
  onClose,
  onSuccess,
}) {
  const [marks, setMarks] = useState(
    submission?.marks !== null &&
      submission?.marks !== undefined
      ? String(submission.marks)
      : ""
  );

  const [feedback, setFeedback] = useState(
    submission?.feedback || ""
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async () => {
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
      setError(
        "Unable to download the submitted file."
      );
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (marks === "") {
      setError("Please enter marks.");
      return;
    }

    const numericMarks = Number(marks);

    if (!Number.isFinite(numericMarks)) {
      setError("Marks must be a valid number.");
      return;
    }

    if (numericMarks < 0) {
      setError("Marks cannot be negative.");
      return;
    }

    if (numericMarks > Number(assignment.max_marks)) {
      setError(
        `Marks cannot exceed ${assignment.max_marks}.`
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const result = await gradeSubmission(
        submission.submission_id,
        {
          marks: numericMarks,
          feedback: feedback.trim() || null,
        }
      );

      onSuccess(result);
    } catch (err) {
      const detail =
        err?.response?.data?.detail ||
        err?.message ||
        "Unable to save the grade.";

      setError(
        typeof detail === "string"
          ? detail
          : "Unable to save the grade."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 p-6">
          <div className="min-w-0 pr-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              {isGraded(submission)
                ? "Update grade"
                : "Grade submission"}
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {assignment?.title || "Assignment"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Version {submission.version_number} •{" "}
              {submission.file_name}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={handleSave}
          className="space-y-6 p-6"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Student ID
              </p>

              <p className="mt-1 text-lg font-bold text-slate-800">
                #{submission.student_id}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Version
              </p>

              <p className="mt-1 text-lg font-bold text-slate-800">
                {submission.version_number}
              </p>
            </div>

            <div className="rounded-2xl bg-blue-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-500">
                Maximum marks
              </p>

              <p className="mt-1 text-lg font-bold text-blue-700">
                {assignment.max_marks}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Submitted file
                </p>

                <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                  {submission.file_name}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Submitted{" "}
                  {formatDateTime(
                    submission.submitted_at
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownload}
                className="h-10 shrink-0 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Download file
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="marks"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Marks
            </label>

            <div className="relative">
              <input
                id="marks"
                type="number"
                min="0"
                max={assignment.max_marks}
                value={marks}
                onChange={(event) => {
                  setMarks(event.target.value);
                  setError("");
                }}
                placeholder={`Enter marks out of ${assignment.max_marks}`}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-20 text-sm text-slate-900 transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />

              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                / {assignment.max_marks}
              </span>
            </div>
          </div>

          <div>
            <label
              htmlFor="feedback"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Feedback
            </label>

            <textarea
              id="feedback"
              rows={5}
              maxLength={5000}
              value={feedback}
              onChange={(event) => {
                setFeedback(event.target.value);
                setError("");
              }}
              placeholder="Write constructive feedback for the student..."
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 placeholder:text-slate-400 transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />

            <p className="mt-1 text-right text-xs text-slate-400">
              {feedback.length}/5000
            </p>
          </div>

          {error && (
            <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <span className="font-bold">!</span>
              <p>{error}</p>
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving...
                </>
              ) : isGraded(submission) ? (
                "Update grade"
              ) : (
                "Save grade"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TeacherDashboard() {
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  const [showCourseForm, setShowCourseForm] =
    useState(false);

  const [showAssignmentForm, setShowAssignmentForm] =
    useState(false);

  const [selectedSubmission, setSelectedSubmission] =
    useState(null);

  const [submissionFilter, setSubmissionFilter] =
    useState("all");

  const [courseName, setCourseName] = useState("");

  const [assignmentForm, setAssignmentForm] = useState({
    course_id: "",
    title: "",
    description: "",
    deadline: "",
    max_marks: "100",
    allowed_file_types: ".pdf,.docx",
    max_file_size_mb: "10",
    allow_late_submission: false,
  });

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [courseData, assignmentData] =
        await Promise.all([
          getMyCourses(),
          getAssignments(),
        ]);

      const safeCourses = Array.isArray(courseData)
        ? courseData
        : [];

      const safeAssignments = Array.isArray(
        assignmentData
      )
        ? assignmentData
        : [];

      setCourses(safeCourses);
      setAssignments(safeAssignments);

      const submissionData =
        await getAllAssignmentSubmissions(
          safeAssignments
        );

      setSubmissions(
        Array.isArray(submissionData)
          ? submissionData
          : []
      );
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Unable to load the teacher dashboard."
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

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [successMessage]);

  const gradedCount = useMemo(
    () => submissions.filter(isGraded).length,
    [submissions]
  );

  const pendingCount =
    submissions.length - gradedCount;

  const gradingPercentage = submissions.length
    ? Math.round(
        (gradedCount / submissions.length) * 100
      )
    : 0;

  const filteredSubmissions = useMemo(() => {
    if (submissionFilter === "pending") {
      return submissions.filter(
        (submission) => !isGraded(submission)
      );
    }

    if (submissionFilter === "graded") {
      return submissions.filter(isGraded);
    }

    return submissions;
  }, [submissions, submissionFilter]);

  const urgentAssignments = useMemo(() => {
    return assignments
      .filter((assignment) => {
        const info = getDeadlineInfo(
          assignment.deadline
        );

        return info.urgent;
      })
      .sort(
        (a, b) =>
          new Date(a.deadline) -
          new Date(b.deadline)
      )
      .slice(0, 4);
  }, [assignments]);

  const recentSubmissions = useMemo(() => {
    return [...submissions]
      .sort(
        (a, b) =>
          new Date(b.submitted_at) -
          new Date(a.submitted_at)
      )
      .slice(0, 5);
  }, [submissions]);

  const getAssignment = (assignmentId) =>
    assignments.find(
      (assignment) =>
        Number(assignment.assignment_id) ===
        Number(assignmentId)
    );

  const getCourse = (courseId) =>
    courses.find(
      (course) =>
        Number(course.course_id) ===
        Number(courseId)
    );

  const handleCreateCourse = async (event) => {
    event.preventDefault();

    if (!courseName.trim()) {
      setError("Please enter a course name.");
      return;
    }

    try {
      setError("");

      const course = await createCourse({
        course_name: courseName.trim(),
      });

      setCourses((previous) => [
        course,
        ...previous,
      ]);

      setCourseName("");
      setShowCourseForm(false);

      setSuccessMessage(
        "Course created successfully."
      );
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Unable to create the course."
      );
    }
  };

  const handleAssignmentChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setAssignmentForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleCreateAssignment = async (
    event
  ) => {
    event.preventDefault();

    if (!assignmentForm.course_id) {
      setError("Please select a course.");
      return;
    }

    if (!assignmentForm.title.trim()) {
      setError(
        "Please enter an assignment title."
      );
      return;
    }

    if (!assignmentForm.description.trim()) {
      setError(
        "Please enter an assignment description."
      );
      return;
    }

    if (!assignmentForm.deadline) {
      setError("Please select a deadline.");
      return;
    }

    try {
      setError("");

      const assignment =
        await createAssignment({
          course_id: Number(
            assignmentForm.course_id
          ),
          title: assignmentForm.title.trim(),
          description:
            assignmentForm.description.trim(),
          deadline: new Date(
            assignmentForm.deadline
          ).toISOString(),
          max_marks: Number(
            assignmentForm.max_marks
          ),
          allowed_file_types:
            assignmentForm.allowed_file_types.trim(),
          max_file_size_mb: Number(
            assignmentForm.max_file_size_mb
          ),
          allow_late_submission:
            assignmentForm.allow_late_submission,
        });

      setAssignments((previous) => [
        ...previous,
        assignment,
      ]);

      setShowAssignmentForm(false);

      setAssignmentForm({
        course_id: "",
        title: "",
        description: "",
        deadline: "",
        max_marks: "100",
        allowed_file_types: ".pdf,.docx",
        max_file_size_mb: "10",
        allow_late_submission: false,
      });

      setSuccessMessage(
        "Assignment created successfully."
      );
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Unable to create the assignment."
      );
    }
  };

  const handleGradeSuccess = async () => {
    setSelectedSubmission(null);

    setSuccessMessage(
      "Grade and feedback saved successfully."
    );

    await loadDashboard();
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Mobile heading */}
        <div className="lg:hidden">
          <p className="text-sm font-semibold text-blue-600">
            Academic Workspace
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Teacher Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage courses, assignments, submissions,
            and grading.
          </p>
        </div>

        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 shadow-sm sm:p-8">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />

          <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
                TEACHER WORKSPACE
              </span>

              <h2 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Manage your classroom workflow.
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Create courses and assignments, review
                student work, and provide marks and
                feedback from one workspace.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  setShowCourseForm(true)
                }
                className="h-10 rounded-xl bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                + Course
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowAssignmentForm(true)
                }
                disabled={!courses.length}
                className="h-10 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                + Assignment
              </button>
            </div>
          </div>
        </section>

        {/* Messages */}
        {successMessage && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 font-bold">
              ✓
            </span>

            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <div className="flex gap-3">
              <span className="font-bold">!</span>

              <span>{error}</span>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* Overview */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Monitor your teaching activity and
              grading workload.
            </p>
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white"
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Courses"
                value={courses.length}
                subtitle="Your courses"
                icon="▦"
                iconBg="bg-blue-50"
                iconColor="text-blue-600"
              />

              <StatCard
                title="Assignments"
                value={assignments.length}
                subtitle="Published assignments"
                icon="◫"
                iconBg="bg-indigo-50"
                iconColor="text-indigo-600"
              />

              <StatCard
                title="To grade"
                value={pendingCount}
                subtitle="Pending submissions"
                icon="◷"
                iconBg="bg-amber-50"
                iconColor="text-amber-600"
              />

              <StatCard
                title="Grading progress"
                value={`${gradingPercentage}%`}
                subtitle={`${gradedCount} of ${submissions.length} graded`}
                icon="✓"
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
              />
            </div>
          )}
        </section>

        {/* Grading progress */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-slate-900">
                Grading progress
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Track how much of your current
                submission workload is complete.
              </p>
            </div>

            <span className="text-lg font-bold text-blue-600">
              {gradingPercentage}%
            </span>
          </div>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{
                width: `${gradingPercentage}%`,
              }}
            />
          </div>

          <div className="mt-3 flex justify-between text-xs text-slate-400">
            <span>{gradedCount} graded</span>

            <span>{pendingCount} pending</span>
          </div>
        </section>

        {/* Deadline overview */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-slate-900">
                Assignment deadlines
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Keep track of assignments approaching
                their deadlines.
              </p>
            </div>

            {urgentAssignments.length > 0 && (
              <span className="w-fit rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                {urgentAssignments.length} need attention
              </span>
            )}
          </div>

          {urgentAssignments.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                ✓
              </div>

              <p className="mt-3 font-semibold text-slate-800">
                No urgent deadlines
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Your upcoming assignments are
                currently on schedule.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {urgentAssignments.map(
                (assignment) => {
                  const info = getDeadlineInfo(
                    assignment.deadline
                  );

                  return (
                    <div
                      key={assignment.assignment_id}
                      className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900">
                          {assignment.title}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          Deadline:{" "}
                          {formatDateTime(
                            assignment.deadline
                          )}
                        </p>
                      </div>

                      <span
                        className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${
                          info.tone === "red"
                            ? "bg-red-50 text-red-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {info.label}
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>

        {/* Recent submission activity */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="font-bold text-slate-900">
              Recent submission activity
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest student submissions requiring
              your attention.
            </p>
          </div>

          {recentSubmissions.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                ↑
              </div>

              <p className="mt-3 font-semibold text-slate-800">
                No submissions yet
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Student submissions will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentSubmissions.map(
                (submission) => {
                  const assignment =
                    getAssignment(
                      submission.assignment_id
                    );

                  const graded =
                    isGraded(submission);

                  return (
                    <div
                      key={submission.submission_id}
                      className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            graded
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {graded ? "✓" : "◷"}
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800">
                            Student #
                            {submission.student_id}
                          </p>

                          <p className="truncate text-sm text-slate-500">
                            {assignment?.title ||
                              `Assignment #${submission.assignment_id}`}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {submission.file_name}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Submitted{" "}
                            {formatDateTime(
                              submission.submitted_at
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            graded
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {graded
                            ? "Graded"
                            : "Pending"}
                        </span>

                        {assignment && (
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedSubmission({
                                submission,
                                assignment,
                              })
                            }
                            className="h-9 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-700"
                          >
                            Review
                          </button>
                        )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>

        {/* Student submissions */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-bold text-slate-900">
                Student submissions
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review submitted work and provide
                marks and feedback.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                ["all", "All"],
                ["pending", "Pending"],
                ["graded", "Graded"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setSubmissionFilter(value)
                  }
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    submissionFilter === value
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
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
          ) : filteredSubmissions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-400">
                ✓
              </div>

              <h3 className="mt-4 font-semibold text-slate-800">
                No submissions found
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                There are no submissions matching
                this filter.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredSubmissions.map(
                (submission) => {
                  const assignment =
                    getAssignment(
                      submission.assignment_id
                    );

                  const course = assignment
                    ? getCourse(
                        assignment.course_id
                      )
                    : null;

                  const graded =
                    isGraded(submission);

                  return (
                    <div
                      key={submission.submission_id}
                      className="p-5 transition hover:bg-slate-50"
                    >
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex min-w-0 gap-4">
                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg ${
                              graded
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-amber-50 text-amber-600"
                            }`}
                          >
                            {graded ? "✓" : "◷"}
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-slate-900">
                                {assignment?.title ||
                                  `Assignment #${submission.assignment_id}`}
                              </h3>

                              <span
                                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                  graded
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-amber-50 text-amber-700"
                                }`}
                              >
                                {graded
                                  ? "Graded"
                                  : "Pending"}
                              </span>
                            </div>

                            <p className="mt-1 text-sm text-slate-500">
                              {course?.course_name ||
                                "Course"}{" "}
                              • Student #
                              {submission.student_id}
                            </p>

                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                              <span>
                                {submission.file_name}
                              </span>

                              <span>
                                Version{" "}
                                {
                                  submission.version_number
                                }
                              </span>

                              <span>
                                Submitted{" "}
                                {formatDateTime(
                                  submission.submitted_at
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                          {graded && (
                            <div className="mr-1 rounded-xl bg-emerald-50 px-4 py-2 text-center">
                              <p className="text-[10px] font-semibold uppercase text-emerald-500">
                                Marks
                              </p>

                              <p className="font-bold text-emerald-700">
                                {submission.marks}
                                {assignment
                                  ? ` / ${assignment.max_marks}`
                                  : ""}
                              </p>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedSubmission({
                                submission,
                                assignment,
                              })
                            }
                            disabled={!assignment}
                            className="h-10 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                          >
                            {graded
                              ? "Review / Update"
                              : "Grade submission"}
                          </button>
                        </div>
                      </div>

                      {submission.feedback && (
                        <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-500">
                            Current feedback
                          </p>

                          <p className="mt-1 text-sm leading-6 text-indigo-900">
                            {submission.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>

        {/* Courses */}
        <section>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                My courses
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Courses you currently manage.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowCourseForm(true)
              }
              className="h-10 w-fit rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              + Create course
            </button>
          </div>

          {courses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <p className="font-semibold text-slate-700">
                No courses yet
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Create your first course to start
                publishing assignments.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {courses.map((course) => {
                const courseAssignments =
                  assignments.filter(
                    (assignment) =>
                      Number(
                        assignment.course_id
                      ) === Number(course.course_id)
                  );

                return (
                  <div
                    key={course.course_id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-600">
                      {course.course_name
                        ?.charAt(0)
                        ?.toUpperCase() || "C"}
                    </div>

                    <h3 className="mt-4 font-bold text-slate-900">
                      {course.course_name}
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      Created{" "}
                      {formatDate(
                        course.created_at
                      )}
                    </p>

                    <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 p-3">
                      <span className="text-xs text-slate-500">
                        Assignments
                      </span>

                      <span className="text-sm font-bold text-slate-800">
                        {courseAssignments.length}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Assignments */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Assignments
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage assignments published across
              your courses.
            </p>
          </div>

          {assignments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <p className="font-semibold text-slate-700">
                No assignments yet
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Create an assignment from the
                dashboard.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {assignments.map((assignment) => {
                const course = getCourse(
                  assignment.course_id
                );

                const assignmentSubmissionCount =
                  submissions.filter(
                    (submission) =>
                      Number(
                        submission.assignment_id
                      ) ===
                      Number(
                        assignment.assignment_id
                      )
                  ).length;

                const deadlineInfo =
                  getDeadlineInfo(
                    assignment.deadline
                  );

                return (
                  <article
                    key={assignment.assignment_id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                          {course?.course_name ||
                            "Course"}
                        </span>

                        <h3 className="mt-3 text-lg font-bold text-slate-900">
                          {assignment.title}
                        </h3>
                      </div>

                      <div className="shrink-0 rounded-xl bg-slate-50 px-3 py-2 text-center">
                        <p className="text-[10px] uppercase text-slate-400">
                          Max
                        </p>

                        <p className="font-bold text-slate-700">
                          {assignment.max_marks}
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
                      {assignment.description}
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[11px] uppercase text-slate-400">
                          Deadline
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {formatDate(
                            assignment.deadline
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[11px] uppercase text-slate-400">
                          Submissions
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {
                            assignmentSubmissionCount
                          }
                        </p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          deadlineInfo.tone ===
                          "red"
                            ? "bg-red-50 text-red-700"
                            : deadlineInfo.tone ===
                              "amber"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {deadlineInfo.label}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Create Course Modal */}
      {showCourseForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Course management
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Create a course
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCourseForm(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-400 hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleCreateCourse}
              className="space-y-5 p-6"
            >
              <div>
                <label
                  htmlFor="courseName"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Course name
                </label>

                <input
                  id="courseName"
                  value={courseName}
                  onChange={(event) => {
                    setCourseName(
                      event.target.value
                    );
                    setError("");
                  }}
                  placeholder="e.g. Machine Learning"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setShowCourseForm(false)
                  }
                  className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Create course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Assignment Modal */}
      {showAssignmentForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Assignment management
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Create an assignment
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowAssignmentForm(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-400 hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleCreateAssignment}
              className="space-y-5 p-6"
            >
              <div>
                <label
                  htmlFor="assignmentCourse"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Course
                </label>

                <select
                  id="assignmentCourse"
                  name="course_id"
                  value={
                    assignmentForm.course_id
                  }
                  onChange={
                    handleAssignmentChange
                  }
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">
                    Select a course
                  </option>

                  {courses.map((course) => (
                    <option
                      key={course.course_id}
                      value={course.course_id}
                    >
                      {course.course_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="assignmentTitle"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Assignment title
                </label>

                <input
                  id="assignmentTitle"
                  name="title"
                  value={assignmentForm.title}
                  onChange={
                    handleAssignmentChange
                  }
                  placeholder="e.g. Build a classification model"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="assignmentDescription"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Description
                </label>

                <textarea
                  id="assignmentDescription"
                  name="description"
                  rows={4}
                  value={
                    assignmentForm.description
                  }
                  onChange={
                    handleAssignmentChange
                  }
                  placeholder="Describe the assignment requirements..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="assignmentDeadline"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Deadline
                  </label>

                  <input
                    id="assignmentDeadline"
                    name="deadline"
                    type="datetime-local"
                    value={
                      assignmentForm.deadline
                    }
                    onChange={
                      handleAssignmentChange
                    }
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="maxMarks"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Maximum marks
                  </label>

                  <input
                    id="maxMarks"
                    name="max_marks"
                    type="number"
                    min="1"
                    value={
                      assignmentForm.max_marks
                    }
                    onChange={
                      handleAssignmentChange
                    }
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="allowedFileTypes"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Allowed file types
                  </label>

                  <input
                    id="allowedFileTypes"
                    name="allowed_file_types"
                    value={
                      assignmentForm.allowed_file_types
                    }
                    onChange={
                      handleAssignmentChange
                    }
                    placeholder=".pdf,.docx"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="maxFileSize"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Maximum file size (MB)
                  </label>

                  <input
                    id="maxFileSize"
                    name="max_file_size_mb"
                    type="number"
                    min="1"
                    max="100"
                    value={
                      assignmentForm.max_file_size_mb
                    }
                    onChange={
                      handleAssignmentChange
                    }
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <input
                  type="checkbox"
                  name="allow_late_submission"
                  checked={
                    assignmentForm.allow_late_submission
                  }
                  onChange={
                    handleAssignmentChange
                  }
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />

                <span>
                  <span className="block text-sm font-semibold text-slate-800">
                    Allow late submissions
                  </span>

                  <span className="mt-0.5 block text-xs text-slate-500">
                    Students can submit after the
                    deadline.
                  </span>
                </span>
              </label>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setShowAssignmentForm(false)
                  }
                  className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Create assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grade modal */}
      {selectedSubmission?.submission &&
        selectedSubmission?.assignment && (
          <GradeModal
            submission={
              selectedSubmission.submission
            }
            assignment={
              selectedSubmission.assignment
            }
            onClose={() =>
              setSelectedSubmission(null)
            }
            onSuccess={handleGradeSuccess}
          />
        )}
    </AppShell>
  );
}

export default TeacherDashboard;