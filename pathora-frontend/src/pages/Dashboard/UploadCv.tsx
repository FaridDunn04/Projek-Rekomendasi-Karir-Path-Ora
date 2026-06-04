import React from "react";
import { useNavigate } from "react-router-dom";
import {Upload} from "lucide-react";


const UploadCv: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="bg-[#061B0E] from-gray-900 to-black rounded-lg shadow-md p-6 flex flex-col justify-center items-center text-white cursor-pointer h-full hover:shadow-lg transition-shadow w-[250px]"
                     onClick={() => navigate("/upload")}>
                    <div className="text-5xl mb-4"><Upload /></div>
                    <h3 className="text-xl font-semibold text-center mb-2">Upload CV Baru</h3>
                    <p className="text-center text-xs text-gray-300 mb-4">
                        Analisis CV baru untuk mendapatkan rekomendasi karir yang lebih akurat
                    </p>
                    <div className="text-center text-xs font-semibold uppercase tracking-wider">
                        Mulai Analisis 
                    </div>
                </div>
    )
}
export default UploadCv;