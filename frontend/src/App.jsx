import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";

import ProtectedRoute from "./components/ProtectedRoute";


function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* Public routes */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* Student routes */}

        <Route
          element={
            <ProtectedRoute allowedRole="student" />
          }
        >

          <Route
            path="/student"
            element={<StudentDashboard />}
          />

        </Route>


        {/* Teacher routes */}

        <Route
          element={
            <ProtectedRoute allowedRole="teacher" />
          }
        >

          <Route
            path="/teacher"
            element={<TeacherDashboard />}
          />

        </Route>


        {/* Unknown routes */}

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}


export default App;