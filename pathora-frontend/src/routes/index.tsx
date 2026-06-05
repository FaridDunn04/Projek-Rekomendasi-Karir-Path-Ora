import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../pages/Auth/LoginPage.tsx";
import RegisterPage from "../pages/Auth/RegisterPage.tsx";
import LandingPage from "../pages/LandingPage/LandingPage.tsx";
import DashboardPage from "../pages/Dashboard/DashboardPage.tsx";
import UploadPage from "../pages/Upload/UploadPage.tsx";
import CareerRecommendationsPage from "../pages/CareerRecommendations/CareerRecommendationsPage.tsx";
import AnalysisPage from "../pages/Analysis/AnalysisPage.tsx";
import ProfilePage from "../pages/Profile/ProfilePage.tsx";
import NotFoundPage from "../pages/NotFound/NotFoundPage.tsx";
import ProtectedRoute from "./ProtectedRoute.tsx";
import PublicRoute from "./PublicRoute.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicRoute>
        <RegisterPage />
      </PublicRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/upload",
    element: (
      <ProtectedRoute>
        <UploadPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/career-recommendations",
    element: (
      <ProtectedRoute>
        <CareerRecommendationsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/career-recommendations/:analysisId",
    element: (
      <ProtectedRoute>
        <CareerRecommendationsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/analysis",
    element: (
      <ProtectedRoute>
        <AnalysisPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/analysis/:analysisId",
    element: (
      <ProtectedRoute>
        <AnalysisPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default router;
