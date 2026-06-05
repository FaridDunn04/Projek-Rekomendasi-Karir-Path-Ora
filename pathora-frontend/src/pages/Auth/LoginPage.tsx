import AuthLayout from "../../components/layout/AuthLayout.tsx";
import LoginForm from "../../components/auth/LoginForm.tsx";
import { useAuth } from "../../hooks/useAuth.ts";

const LoginPage = () => {
    const { login, isSubmitting, error } = useAuth();

    return (
        <AuthLayout title="Masuk" subtitle="Masukkan detail akun Anda untuk melanjutkan">
            <LoginForm onSubmit={login} isSubmitting={isSubmitting} error={error} />
        </AuthLayout>
    );
};

export default LoginPage;
