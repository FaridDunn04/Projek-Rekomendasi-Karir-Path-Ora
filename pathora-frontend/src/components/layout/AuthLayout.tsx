import React from "react";

interface AuthLayoutProps {
    title: string;
    subtitle: string;
    children: React.ReactNode;
}

const AuthLayout = ({ title, subtitle, children }: AuthLayoutProps) => {
    return (
        <div className="min-h-screen flex flex-col bg-[#F4F9F4]">
            <header className="w-full bg-[#F4F9F4] py-4 shadow-md">
                <h1 className="text-center text-3xl font-bold font-['Newsreader'] text-gray-900">
                    Path`Ora
                </h1>
            </header>

            <div className="flex-1 flex items-center justify-center px-4 py-8">
                <div className="max-w-sm w-full bg-white p-8 border border-gray-200 rounded-lg shadow-sm">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold font-['Newsreader',_serif] text-gray-900">
                            {title}
                        </h1>
                        <p className="text-xs text-gray-600 mt-2">
                            {subtitle}
                        </p>
                    </div>

                    {children}
                </div>
            </div>
                <footer className="flex justify-between items-center px-8 py-6 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] border-t text-xs text-gray-600 font-['Manrope',_sans-serif] ">
                    <div>
                        &copy; {new Date().getFullYear()} Path`Ora. All rights reserved.
                    </div>
                    <div className="flex gap-6">
                        <a href="" className=" hover:underline">Terms of Service</a>
                        <a href="" className=" hover:underline">Privacy Policy</a>
                        <a href="" className=" hover:underline">Support</a>
                    </div>
                    
                </footer>
        </div>
    );
};

export default AuthLayout;
