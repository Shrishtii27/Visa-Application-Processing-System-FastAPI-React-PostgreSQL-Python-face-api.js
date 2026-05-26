import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Footer from "./components/shared/Footer";
import Navbar from "./components/shared/Navbar";
import Login from "./components/auth/Login";
import SignUp from "./components/auth/SignUp";
import Dashboard from "./components/dashboard/Dashboard";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/shared/ProtectedRoute";

function HomePage() {
  return (
    <>
      <Navbar />
      <Home />
      <Footer />
    </>
  );
}

function LoginPage() {
  return (
    <>
      <Navbar />
      <Login />
      <Footer />
    </>
  );
}

function RegisterPage() {
  return (
    <>
      <Navbar />
      <SignUp />
    </>
  );
}

function DashboardPage() {
  return (
    <>
      <Navbar />
      <Dashboard />
      <Footer />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
