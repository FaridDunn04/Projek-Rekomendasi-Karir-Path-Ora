import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../pages/Auth/LoginPage.tsx";
import RegisterPage from "../pages/Auth/RegisterPage.tsx";
import LandingPage from "../pages/LandingPage/LandingPage.tsx";
import DashboardPage from "../pages/Dashboard/DashboardPage.tsx";
import UploadPage from "../pages/Upload/UploadPage.tsx";
import CareerRecommendationsPage from "../pages/CareerRecommendations/CareerRecommendationsPage.tsx";
import AnalysisPage from "../pages/Analysis/AnalysisPage.tsx";
import ProfilePage from "../pages/Profile/ProfilePage.tsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <LandingPage />
    },
    {
        path: "/login",
        element: <LoginPage />
    },
    {
        path: "/register",
        element: <RegisterPage />
    },
    {
        path: "/dashboard",
        element: <DashboardPage />
    },
    {
        path: "/upload",
        element: <UploadPage />
    },
    {
        path: "/career-recommendations",
        element: <CareerRecommendationsPage />
    },
    {
        path: "/analysis",
        element: <AnalysisPage />
    },
    {
        path: "/profile",
        element: <ProfilePage />
    }
]);

export default router;