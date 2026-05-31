import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../pages/Auth/LoginPage.tsx";
import RegisterPage from "../pages/Auth/RegisterPage.tsx";
import LandingPage from "../pages/LandingPage/LandingPage.tsx";
import DashboardPage from "../pages/Dashboard/DashboardPage.tsx";

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
    }
]);

export default router;