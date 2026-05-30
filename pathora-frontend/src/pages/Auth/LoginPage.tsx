import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Skema Validasi Zod sesuai SRS VAL-002
const loginSchema = z.object({
    email: z.string().min(1, { message: "Email wajib diisi" }).email({ message: "Format email tidak valid" }),
    password: z.string().min(6, { message: "Password wajib diisi" }), // Sesuai SRS login: password wajib diisi (tidak ada minimal karakter di form login)
});

type LoginFormInput = z.infer<typeof loginSchema>;

const LoginPage = () => {
    const navigate = useNavigate();
    
    const { 
        register, 
        handleSubmit, 
        formState: { errors, isSubmitting } 
    } = useForm<LoginFormInput>({
        resolver: zodResolver(loginSchema)
    });

    const handleLogin = async (data: LoginFormInput) => {
        try {
            /* 
             * [FETCH API BACKEND]
             * TODO: Buka (uncomment) baris di bawah ini dan isi dengan endpoint dari backend Anda (misal: "http://localhost:3000/api/v1/auth/login")
             */

            // const response = await fetch("MASUKKAN_ENDPOINT_BACKEND_ANDA_DI_SINI", {
            //     method: "POST",
            //     headers: {
            //         "Content-Type": "application/json",
            //     },
            //     body: JSON.stringify(data),
            // });
            // 
            // if (!response.ok) {
            //     throw new Error("Gagal login");
            // }
            //
            // const result = await response.json();
            // 
            // // TODO: Simpan Authorization Token ke State atau LocalStorage
            // // localStorage.setItem("token", result.data.token);
            //
            // navigate("/dashboard"); // Redirect ketika sukses


            // --- Hapus bagian simulasi ini (di dalam dashed line) ketika API sudah siap ---
            console.log("Submit data tersimulasi:", data);
            setTimeout(() => {
                navigate("/dashboard");
            }, 1000);
            // -----------------------------------------------------------------------------

        } catch (error) {
            console.error("Login failed", error);
            alert("Email atau password salah"); // Mengacu kepada SDD Error State login 401
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white p-8 border border-gray-200 rounded-lg shadow-sm">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Masuk ke Path`Ora</h1>
                    <p className="text-sm text-gray-600 mt-2">Silakan masukkan email dan kata sandi Anda</p>
                </div>
                
                <form className="space-y-4" onSubmit={handleSubmit(handleLogin)}>
                    
                    {/* Input Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email</label><br />
                        <input 
                            type="email" 
                            id="email" 
                            placeholder="Enter Your Email" 
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                            {...register("email")}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.email.message}
                            </p>
                        )}
                    </div>
                    
                    {/* Input Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">PASSWORD</label><br />
                        <input 
                            type="password" 
                            id="password" 
                            placeholder="••••••••" 
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                            {...register("password")} 
                        />
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Memproses..." : "Masuk"}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-600 mt-6">
                    Belum punya akun?{" "}
                    <Link to="/register" className="text-blue-600 font-medium hover:underline">
                        Daftar di sini
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;

