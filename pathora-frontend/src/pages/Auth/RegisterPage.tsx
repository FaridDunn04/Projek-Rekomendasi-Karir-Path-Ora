import AuthLayout from "../../components/layout/AuthLayout.tsx";
import RegisterForm from "../../components/auth/RegisterForm.tsx";
import { useAuth } from "../../hooks/useAuth.ts";

const RegisterPage = () => {
    const { register, isSubmitting, error } = useAuth();

    return (
        <AuthLayout title="Daftar" subtitle="Masukkan detail Anda untuk membuat akun baru">
            <RegisterForm onSubmit={register} isSubmitting={isSubmitting} error={error} />
        </AuthLayout>
    );
};

export default RegisterPage;
