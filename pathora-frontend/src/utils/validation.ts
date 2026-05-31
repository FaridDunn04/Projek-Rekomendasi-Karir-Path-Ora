import * as z from "zod";

// Skema Validasi Zod sesuai SRS VAL-002 (FR-2: Autentikasi)
export const loginSchema = z.object({
    email: z.string().min(1, { message: "Email is required" }).email({ message: "Invalid email format" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export type LoginFormInput = z.infer<typeof loginSchema>;

// Skema Validasi Zod sesuai SRS VAL-001 (FR-1: Autentikasi & Manajemen Sesi)
export const registerSchema = z
    .object({
        full_name: z.string().min(3, { message: "Full name must be at least 3 characters" }),
        email: z
            .string()
            .min(1, { message: "Email is required" })
            .email({ message: "Invalid email format" }),
        password: z.string().min(6, { message: "Password must be at least 6 characters" }),
        confirmPassword: z.string().min(1, { message: "Password confirmation is required" }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export type RegisterFormInput = z.infer<typeof registerSchema>;
