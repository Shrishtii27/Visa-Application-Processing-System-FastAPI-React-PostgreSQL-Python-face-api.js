import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { SiteLayout } from "./components/shared/SiteLayout";
import { HomePage } from "./pages/home/HomePage";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { WelcomePage } from "./pages/application/WelcomePage";
import { CountryPage } from "./pages/application/CountryPage";
import { UploadPage } from "./pages/application/UploadPage";
import { ScanResultPage } from "./pages/application/ScanResultPage";
import { VerifyFormPage } from "./pages/application/VerifyFormPage";
import { DocumentsPage } from "./pages/application/DocumentsPage";
import { CameraPage } from "./pages/application/CameraPage";
import { FaceResultPage } from "./pages/application/FaceResultPage";
import { ResultPage } from "./pages/application/ResultPage";
import { HistoryPage } from "./pages/application/HistoryPage";
import { AuthProvider } from "./context/AuthContext";
import { ApplicationProvider } from "./context/ApplicationContext";

function NotFoundPage() {
  return (
    <div className="flex min-h-[calc(100vh-152px)] items-center justify-center px-6 py-16 text-center sm:px-10 lg:px-16">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#ff7a3d]">
          404
        </p>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-[#18246f]">
          Page not found
        </h1>
        <p className="mt-3 text-base leading-7 text-slate-600">
          The page you requested does not exist in this flow.
        </p>
        <NavigateButton />
      </div>
    </div>
  );
}

function NavigateButton() {
  return (
    <Link
      to="/"
      className="mt-8 inline-flex h-12 items-center justify-center rounded-2xl bg-[#22348f] px-6 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(34,52,143,0.25)] transition hover:-translate-y-0.5 hover:bg-[#1b2d7b]"
    >
      Back to Home
    </Link>
  );
}


function App() {
  return (
    <AuthProvider>
      <ApplicationProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<SiteLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/welcome" element={<WelcomePage />} />
              <Route path="/country" element={<CountryPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/scan-result" element={<ScanResultPage />} />
              <Route path="/verify-form" element={<VerifyFormPage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/camera" element={<CameraPage />} />
              <Route path="/face-result" element={<FaceResultPage />} />
              <Route path="/result" element={<ResultPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ApplicationProvider>
    </AuthProvider>
  );
}

export default App;
