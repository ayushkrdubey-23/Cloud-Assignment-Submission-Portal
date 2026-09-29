import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getCurrentUser,
  getStoredUser,
  isAuthenticated,
  loginUser,
  logoutUser,
} from "../services/authService";


const AuthContext = createContext(null);


export function AuthProvider({ children }) {
  const [user, setUser] = useState(
    getStoredUser()
  );

  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const verifyAuthentication = async () => {
      if (!isAuthenticated()) {
        setLoading(false);
        return;
      }

      try {
        const currentUser =
          await getCurrentUser();

        setUser({
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role,
          user_id: currentUser.user_id,
        });
      } catch (error) {
        console.error(
          "Authentication verification failed:",
          error
        );

        logoutUser();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyAuthentication();
  }, []);


  const login = async (loginData) => {
    const data =
      await loginUser(loginData);

    const authenticatedUser = {
      name: data.name,
      role: data.role,
    };

    setUser(authenticatedUser);

    return data;
  };


  const logout = () => {
    logoutUser();
    setUser(null);
  };


  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    logout,
  };


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}