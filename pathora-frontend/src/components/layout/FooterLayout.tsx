import React from "react";

/**
 * FooterLayout Component
 * 
 * Fungsi:
 * - Menampilkan footer dengan copyright dan links
 * - Digunakan di AppLayout
 */
const FooterLayout: React.FC = () => {
    return (
        <footer className="bg-[#F4F9F4] border-t border-gray-200 py-6 px-6 shadow-[0_-2px_8px_rgba(0,0,0,0.08)]">
            <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-gray-600">
                <p>&copy; {new Date().getFullYear()} Path`Ora. All rights reserved.</p>
                <div className="flex gap-6">
                    <a href="#" className="hover:text-gray-900 transition-colors">
                        Privacy Policy
                    </a>
                    <a href="#" className="hover:text-gray-900 transition-colors">
                        Terms of Service
                    </a>
                    <a href="#" className="hover:text-gray-900 transition-colors">
                        Support
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default FooterLayout;