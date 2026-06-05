import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { userService } from "../services/user.service";
import { useAuthStore } from "../store/auth.store";

interface PublicRouteProps {
  children: ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const { token, user, setToken, setUser } = useAuthStore();
  const [isChecking, setIsChecking] = useState(Boolean(token && !user));
  const [hasValidToken, setHasValidToken] = useState(Boolean(token && user));

  useEffect(() => {
    let isMounted = true;

    const validateToken = async () => {
      if (!token) {
        setHasValidToken(false);
        setIsChecking(false);
        return;
      }

      if (user) {
        setHasValidToken(true);
        setIsChecking(false);
        return;
      }

      setIsChecking(true);

      try {
        const profile = await userService.getProfile();
        if (!isMounted) return;
        setUser(profile);
        setHasValidToken(true);
      } catch {
        if (!isMounted) return;
        setToken(null);
        setHasValidToken(false);
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };

    validateToken();

    return () => {
      isMounted = false;
    };
  }, [setToken, setUser, token, user]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#f5f8f3] dark:bg-[#051b0f] flex items-center justify-center px-6">
        <div className="rounded-xl bg-white px-5 py-4 text-sm font-medium text-[#102619] shadow-sm dark:bg-[#0b2a18] dark:text-[#d1d5d1]">
          Memeriksa sesi...
        </div>
      </div>
    );
  }

  if (hasValidToken) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
