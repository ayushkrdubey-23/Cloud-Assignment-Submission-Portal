import api, { API_BASE_URL } from "./api";

export const getAssignments = async () => {
  const response = await api.get("/api/assignments/");
  return response.data;
};

export const getMySubmissions = async () => {
  const response = await api.get("/api/submissions/my-submissions");
  return response.data;
};

export const getSubmissionHistory = async (assignmentId) => {
  const response = await api.get(
    `/api/submissions/assignment/${assignmentId}/history`
  );

  return response.data;
};

export const submitAssignment = async (assignmentId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(
    `/api/submissions/assignment/${assignmentId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
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

export const getSubmissionDownloadUrl = (submissionId) => {
  return `${API_BASE_URL}/api/submissions/${submissionId}/download`;
};