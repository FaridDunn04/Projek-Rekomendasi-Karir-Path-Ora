import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store.ts";
import { authService } from "../services/auth.service.ts";
import { parseApiError } from "../utils/error.ts";
import { LoginRequest, RegisterRequest } from "../types/auth.ts";

export function useAuth() {
    const { setToken, setUser, logout: storeLogout, user, isAuthenticated } = useAuthStore();
    const [isSubmitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const login = async (payload: LoginRequest) => {
        setSubmitting(true);
        setError(null);
        try {
            const res = await authService.login(payload);
            setToken(res.token);
            setUser(res.user);
            navigate("/dashboard", { replace: true });
        } catch (e) {
            setError(parseApiError(e));
        } finally {
            setSubmitting(false);
        }
    };

    const register = async (payload: RegisterRequest) => {
        setSubmitting(true);
        setError(null);
        try {
            const res = await authService.register(payload);
            setToken(res.token);
            setUser(res.user);
            navigate("/dashboard", { replace: true });
        } catch (e) {
            setError(parseApiError(e));
        } finally {
            setSubmitting(false);
        }
    };

    const logout = () => {
        authService.logout();
        storeLogout();
        navigate("/login", { replace: true });
    };

    return {
        login,
        register,
        logout,
        currentUser: user,
        isAuthenticated,
        isSubmitting,
        error,
    };
}
