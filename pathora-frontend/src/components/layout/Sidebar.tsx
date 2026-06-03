import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store.ts";
import logo from "../../images/logo.png";
import {LayoutDashboard,Upload,ChartColumn,Route,User,CircleHelp,LogOut} from "lucide-react";
/**
 * Sidebar Navigation Component
 * 
 * Fungsi:
 * - Menampilkan menu navigasi utama (Dashboard, Upload, Profile, etc.)
 * - Active state untuk highlight menu yang sedang aktif
 * - Logout button
 * 
 * Digunakan di: AppLayout
 */
const Sidebar: React.FC = () => {
    const location = useLocation();
    const { logout } = useAuthStore();

    // Menu items sesuai PRD §3.0 Sitemap
    const menuItems = [
        {
            label: "Dashboard",
            path: "/dashboard",
            icon: <LayoutDashboard size={18}/>,
        },
        {
            label: "Upload CV",
            path: "/upload",
            icon: <Upload size={18}/>,
        },
        {
            label: "Analysis",
            path: "/analysis",
            icon: <ChartColumn size={18}/>,
        },
        {
            label: "Career Recs",
            path: "/career-recommendations",
            icon: <Route size={18}/>,
        },
        {
            label: "Profile",
            path: "/profile",
            icon: <User size={18}/>,
        },
        
        
    ];

    const isActive = (path: string) => location.pathname.startsWith(path);

    const handleSupport = () => {
        window.open("https://wa.me/6281234567890?text=Hello%20Path'Ora%20Support", "_blank");
    };

    const handleLogout = () => {
        logout();
        window.location.href = "/login";
    };

    return (
        <aside className="w-64  text-white bg-[#FFFFFF] h-screen flex flex-col fixed left-0 top-0 shadow-lg">
            {/* Logo Section */}
            <div className="flex items-center gap-4 py-6 px-8 border-gray-200">
                <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center">
                    <img src={logo} alt="Path'Ora Logo" className="w-9 h-9" />
                </div>
                

                <h1 className="text-2xl font-bold font-['Newsreader'] text-gray-900">
                    Path'Ora
                </h1>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors font-['Manrope',_sans-serif ${
                            isActive(item.path)
                                ? "bg-[#CFE9D3] text-[#0A2012]"
                                : "text-gray-700 hover:bg-[#CFE9D3] hover:text-[#0A2012]"
                        }`}
                    >
                        <span className="text-lg">{item.icon}</span>
                        <span className="font-medium text-sm">{item.label}</span>
                    </Link>
                ))}
            </nav>

            {/* Logout Button */}
            <div className=" border-green-300 p-4">

                <button
                    onClick={handleSupport}
                    className="w-full flex items-center gap-3 hover:bg-red-700 text-[#0A2012] font-['Manrope',_sans-serif] py-2 px-4  transition-colors text-sm"
                >
                    <CircleHelp size={18}/>
                    <span>Support</span>
                </button>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 hover:bg-red-700 text-[#0A2012] font-['Manrope',_sans-serif] py-2 px-4  transition-colors text-sm"
                >
                    <LogOut size={18}/>
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
