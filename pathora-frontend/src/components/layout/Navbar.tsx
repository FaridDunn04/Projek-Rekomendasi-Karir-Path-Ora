import React from "react";
import { useAuthStore } from "../../store/auth.store.ts";
import { Languages,Sun,Moon } from "lucide-react";

/**
 * Navbar (Top Navigation) Component
 * 
 * Fungsi:
 * - Logo/branding Path`Ora
 * - Display user name & profile info
 * - Quick actions (notifications, settings, etc.)
 * 
 * Digunakan di: AppLayout (tetap di atas, tidak scrollable)
 */
const Navbar: React.FC = () => {
    const user = useAuthStore((state) => state.user);

    return (
        <nav className="h-16 bg-[#F4F9F4] border-b border-gray-150 shadow-2xl flex items-center px-6 ">
            <div className="flex items-center gap-4 ml-auto">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Languages size={18}/>
                </button>

                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Sun size={18}/>
                </button>

                {/* User Profile */}
                <div className="flex items-center gap-3 pl-4  border-gray-200">
                    <div className="flex flex-col items-end">
                        <p className="text-sm font-medium text-gray-900">
                            {user?.full_name || "User"}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email || "email@example.com"}</p>
                    </div>
                    {/* User Avatar */}
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
