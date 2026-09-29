import api from "./api";

export const getMyCourses = async () => {
  const response = await api.get("/api/courses/my-courses");
  return response.data;
};

export const createCourse = async (courseData) => {
  const response = await api.post("/api/courses/", courseData);
  return response.data;
};

export const getAssignments = async () => {
  const response = await api.get("/api/assignments/");
  return response.data;
};

export const createAssignment = async (assignmentData) => {
  const response = await api.post("/api/assignments/", assignmentData);
  return response.data;
};

export const getAssignmentSubmissions = async (assignmentId) => {
  const response = await api.get(
    `/api/grading/assignment/${assignmentId}`
  );
  return response.data;
};

export const getAllAssignmentSubmissions = async (assignments) => {
  if (!assignments.length) return [];

  const responses = await Promise.all(
    assignments.map((assignment) =>
      getAssignmentSubmissions(assignment.assignment_id)
    )
  );

  return responses.flat();
};

export const getSubmissionForGrading = async (submissionId) => {
  const response = await api.get(
    `/api/grading/submission/${submissionId}`
  );

  return response.data;
};

export const gradeSubmission = async (submissionId, gradingData) => {
  const response = await api.put(
    `/api/grading/submission/${submissionId}`,
    gradingData
  );

  return response.data;
};

export const downloadSubmission = async (submissionId) => {
  const response = await api.get(
    `/api/submissions/${submissionId}/download`,
    {
      responseType: "blob",
    }
  );

  return response;
};