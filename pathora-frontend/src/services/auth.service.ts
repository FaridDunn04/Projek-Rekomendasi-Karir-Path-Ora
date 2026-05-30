import type {ILogin} from "../types/auth.ts";
export const Login = async (payload: ILogin) => {
    const result = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    return await result.json();
};

export default Login;