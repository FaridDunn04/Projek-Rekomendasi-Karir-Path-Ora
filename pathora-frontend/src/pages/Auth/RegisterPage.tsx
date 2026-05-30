import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Skema Validasi Zod sesuai SRS VAL-001
const registerSchema = z.object({
    full_name: z.string().min(3, { message: "Nama lengkap minimal 3 karakter" }),
    email: z.string().min(1, { message: "Email wajib diisi" }).email({ message: "Format email tidak valid" }),
    password: z.string().min(6, { message: "Password minimal 6 karakter" }),
    confirmPassword: z.string().min(1, { message: "Konfirmasi kata sandi wajib diisi" })
}).refine((data) => data.password === data.confirmPassword, {
    message: "Kata sandi tidak cocok",
    path: ["confirmPassword"] // Menempatkan pesan error pada field confirmPassword
});

type RegisterFormInput = z.infer<typeof registerSchema>;

const RegisterPage = () => {
    const navigate = useNavigate();
    
    const { 
        register, 
        handleSubmit, 
        formState: { errors, isSubmitting } 
    } = useForm<RegisterFormInput>({
        resolver: zodResolver(registerSchema)
    });

    const handleRegister = async (data: RegisterFormInput) => {
        try {
            /* 
             * [FETCH API BACKEND]
             * TODO: Buka (uncomment) baris di bawah ini dan isi dengan endpoint dari backend Anda (misal: "http://localhost:3000/api/v1/auth/register")
             */

            // const payload = {
            //     full_name: data.full_name,
            //     email: data.email,
            //     password: data.password
            // };
            //
            // const response = await fetch("MASUKKAN_ENDPOINT_BACKEND_ANDA_DI_SINI", {
            //     method: "POST",
            //     headers: {
            //         "Content-Type": "application/json",
            //     },
            //     body: JSON.stringify(payload),
            // });
            // 
            // if (!response.ok) {
            //     // Bisa ditangkap apakah 409 Email duplikat, dll sesuai SRS
            //     throw new Error("Gagal registrasi");
            // }
            //
            // alert("Registrasi berhasil, silakan masuk.");
            // navigate("/login");


            // --- Hapus bagian simulasi ini (di dalam dashed line) ketika API sudah siap ---
            console.log("Submit data registrasi:", data);
            setTimeout(() => {
                alert("Registrasi berhasil (Simulasi), silakan masuk.");
                navigate("/login");
            }, 1000);
            // -----------------------------------------------------------------------------

        } catch (error) {
            console.error("Register failed", error);
            alert("Terjadi kesalahan saat mencoba mendaftar. Email mungkin sudah digunakan.");
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <header className="w-full bg-[#F4F9F4] py-4 shadow-sm">
                <h1 className="text-center text-3xl font-bold font-['Newsreader',_serif] text-gray-900">
                    Path`Ora
                </h1>
            </header>
            
            <div className="flex-1 flex items-center justify-center px-4 py-8">
                <div className="max-w-md w-full bg-white p-8 border border-gray-200 rounded-lg shadow-sm">
                    <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold font-['Newsreader',_serif] text-gray-900">Register</h1>
                    <p className="text-sm text-gray-600 mt-2">Please enter your details to sign up your account</p>
                </div>
                
                <form className="space-y-4" onSubmit={handleSubmit(handleRegister)}>
                    
                    {/* Input Nama Lengkap */}
                    <div>
                        <label className="block text-sm font-medium font-['Manrope',_serif] text-gray-700 mb-1" htmlFor="full_name" >
                            NAME
                        </label>
                        <input 
                            type="text" 
                            id="full_name" 
                            placeholder="Enter Your Name" 
                            className={`w-full px-3 py-2 border  focus:outline-none focus:ring-2 bg-[#F4F9F4] focus:ring-blue-500 ${errors.full_name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                            {...register("full_name")}
                        />
                        {errors.full_name && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.full_name.message}
                            </p>
                        )}
                    </div>

                    {/* Input Email */}
                    <div>
                        <label className="block text-sm font-medium font-['Manrope',_serif] text-gray-700 mb-1" htmlFor="email">EMAIL</label>
                        <input 
                            type="email" 
                            id="email" 
                            placeholder="Enter Your Email" 
                            className={`w-full px-3 py-2 border bg-[#F4F9F4] focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
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
                        <label className="block text-sm font-medium font-['Manrope',_serif] text-gray-700 mb-1" htmlFor="password">PASSWORD</label>
                        <input 
                            type="password" 
                            id="password" 
                            placeholder="........" 
                            className={`w-full px-3 py-2 border bg-[#F4F9F4] focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                            {...register("password")} 
                        />
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    {/* Input Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium font-['Manrope',_serif] text-gray-700 mb-1" htmlFor="confirmPassword">CONFIRM PASSWORD</label>
                        <input 
                            type="password" 
                            id="confirmPassword" 
                            placeholder="........." 
                            className={`w-full px-3 py-2 border bg-[#F4F9F4] focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                            {...register("confirmPassword")} 
                        />
                        {errors.confirmPassword && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.confirmPassword.message}
                            </p>
                        )}
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-black text-white font-medium font-['Manrope',_serif] py-2 px-4  hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        {isSubmitting ? "Memproses..." : "SIGN UP"}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-600 mt-6">
                    Sudah punya akun?{" "}
                    <Link to="/login" className="text-blue-600 font-medium hover:underline">
                        Masuk di sini
                    </Link>
                </p>
            </div>
            </div>
        </div>
    );
};

export default RegisterPage;