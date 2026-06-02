import React from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout.tsx";
import { MapPin } from "lucide-react";
import JobRecommendationCard from "./Job.tsx";


interface JobRecommendation {
    id: number;
    title: string;
    category: string;
    matchPercentage: number;
    matchingSkills: string[];
    missingSkills: string[];
}

const CareerRecommendationsPage: React.FC = () => {
    const navigate = useNavigate();

    const jobRecommendations: JobRecommendation[] = [
        {
            id: 1,
            title: "Senior UI/UX Designer",
            category: "Product Design",
            matchPercentage: 85,
            matchingSkills: ["Figma", "UI Design", "User Research"],
            missingSkills: ["Design Systems", "HTML/CSS"],
        },

        {
            id: 2,
            title: "Product Manager",
            category: "Product Management",
            matchPercentage: 72,
            matchingSkills: ["User Research", "Product Roadmap", "Analytics"],
            missingSkills: ["SQL", "Advanced Analytics"],
        },
    
    ];

    return (
        <AppLayout>
            <div className="min-h-screen bg-[#F7F6F2] px-10 pt-0 pb-8 font-['Newsreader']">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-7">
                        <h1 className="text-3xl font-bold font-['Newsreader'] text-gray-900">
                            Rekomendasi Karir
                        </h1>
                        <p className="text-gray-600 mt-2 text-sm font-['Manrope',_sans-serif]">
                            <span>Berdasarkan analisa keterampilan dan latar belakang profesional Anda baru-baru ini</span><br/>
                            <span>Kami telah menusun jalur karier yang berpotensi tinggi ini yang di sesuaikan</span><br/>
                            denga profil unik Anda.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {jobRecommendations.map((job) => (
                            <JobRecommendationCard key={job.id} job={job} />
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default CareerRecommendationsPage;