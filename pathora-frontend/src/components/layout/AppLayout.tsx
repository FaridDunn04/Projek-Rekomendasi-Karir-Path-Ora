import React from "react";
import Navbar from "./Navbar.tsx";
import Sidebar from "./Sidebar.tsx";
import FooterLayout from "./FooterLayout.tsx";

interface AppLayoutProps {
    children: React.ReactNode;
}

/**
 * AppLayout - Layout wrapper untuk halaman privat (setelah login)
 * 
 * Struktur:
 * ┌──────────────────┬──────────────────┐
 * │                  │   NAVBAR (top)   │ height: 64px (h-16)
 * │                  ├──────────────────┤
 * │                  │                  │
 * │    SIDEBAR       │  MAIN CONTENT    │ {children}
 * │   (fixed left)   │  (scrollable)    │
 * │   full height    │                  │
 * │                  ├──────────────────┤
 * │                  │     FOOTER       │
 * └──────────────────┴──────────────────┘
 * 
 * Fungsi:
 * - Sidebar terpisah penuh di sebelah kiri (fixed, full height)
 * - Navbar + Main Content + Footer dalam satu container di sebelah kanan
 * - Navbar di atas dalam container sebelah kanan
 * - Main content area scrollable
 * - Footer di bawah main content
 * - Reusable component
 * 
 * Digunakan di:
 * - /dashboard (DashboardPage)
 * - /upload (UploadPage)
 * - /profile (ProfilePage)
 * - /analysis/:id (AnalysisPage)
 * - /career-recommendations/:id (CareerRecsPage)
 */
const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar (Fixed Left) */}
            <Sidebar />

            {/* Right Container: Navbar + Main + Footer */}
            <div className="flex-1 ml-64 flex flex-col">
                {/* Navbar */}
                <Navbar />

                {/* Main Content Area (Scrollable) */}
                <main className="flex-1 overflow-y-auto bg-[#F4F9F4]">
                    <div className="p-6 max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>

                {/* Footer */}
                <FooterLayout />
            </div>
        </div>
    );
};

export default AppLayout;
