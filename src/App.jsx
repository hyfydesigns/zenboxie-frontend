import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { GlobalStyles, Spinner } from "./components/ui";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AppPage from "./pages/AppPage";
import AccountPage from "./pages/AccountPage";
import PricingPage from "./pages/PricingPage";
import AutoCleanPage from "./pages/AutoCleanPage";
import RetentionPage from "./pages/RetentionPage";
import TeamPage from "./pages/TeamPage";
import HelpPage from "./pages/HelpPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import LandingPage from "./pages/LandingPage";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #f0fdfd, #e6f9f9)" }}>
        <Spinner color="#0cb8b6" size={32} />
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
}

// Show landing page for guests, app for logged-in users
function RootRoute() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #f0fdfd, #e6f9f9)" }}>
        <Spinner color="#0cb8b6" size={32} />
      </div>
    );
  }
  return user ? <AppPage /> : <LandingPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <GlobalStyles />
        <Routes>
          <Route path="/" element={<RootRoute />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/verify" element={<VerifyEmailPage />} />
          <Route path="/autoclean" element={<PrivateRoute><AutoCleanPage /></PrivateRoute>} />
          <Route path="/retention" element={<PrivateRoute><RetentionPage /></PrivateRoute>} />
          <Route path="/team" element={<PrivateRoute><TeamPage /></PrivateRoute>} />
          <Route path="/account" element={<PrivateRoute><AccountPage /></PrivateRoute>} />
          <Route path="/*" element={<PrivateRoute><AppPage /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
