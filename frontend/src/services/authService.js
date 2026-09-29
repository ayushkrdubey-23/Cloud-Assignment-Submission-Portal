import api from "./api";

/**
 * Register a new user.
 */
export const registerUser = async (userData) => {
  const response = await api.post(
    "/api/auth/register",
    userData
  );

  return response.data;
};


/**
 * Login an existing user.
 */
export const loginUser = async (loginData) => {
  const response = await api.post(
    "/api/auth/login",
    loginData
  );

  const data = response.data;

  // Store authentication information
  localStorage.setItem(
    "access_token",
    data.access_token
  );

  localStorage.setItem(
    "user",
    JSON.stringify({
      name: data.name,
      role: data.role,
    })
  );

  return data;
};


/**
 * Get the currently authenticated user's profile.
 */
export const getCurrentUser = async () => {
  const response = await api.get(
    "/api/auth/me"
  );

  return response.data;
};


/**
 * Logout the current user.
 */
export const logoutUser = () => {
  localStorage.removeItem(
    "access_token"
  );

  localStorage.removeItem(
    "user"
  );
};


/**
 * Check whether an access token exists.
 */
export const isAuthenticated = () => {
  return Boolean(
    localStorage.getItem("access_token")
  );
};


/**
 * Get the locally stored user information.
 */
export const getStoredUser = () => {
  const user = localStorage.getItem("user");

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
};