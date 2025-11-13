import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminLogin from "./pages/AdminLogin";
import ForgotPassword from "./pages/ForgotPassword";
import AdminResetPassword from "./pages/AdminResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import ApplicationDetailsWrapper from "./pages/ApplicationDetails";



function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<AdminResetPassword />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        <Route
          path="/admin/application/:studentId"
          element={<ApplicationDetailsWrapper />}
        />
        
      </Routes>
    </Router>
  );
}

export default App;
