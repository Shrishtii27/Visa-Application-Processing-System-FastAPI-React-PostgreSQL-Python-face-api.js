import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Footer from "./components/shared/Footer";
import Navbar from "./components/shared/Navbar";
import Login from "./components/auth/Login";
import SignUp from "./components/auth/SignUp";

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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
