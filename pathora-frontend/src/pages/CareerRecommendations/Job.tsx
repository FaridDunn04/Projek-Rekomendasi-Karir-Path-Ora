import React from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout.tsx";
import { MapPin } from "lucide-react";

interface JobRecommendation {
    id: number;
    title: string;
    category: string;
    matchPercentage: number;
    matchingSkills: string[];
    missingSkills: string[];
}

interface JobRecommendationCardProps {
    job: JobRecommendation;
}

const JobRecommendationCard: React.FC<JobRecommendationCardProps> = ({ job }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-3xl font-['Newsreader'] text-[#102619]">
                    {job.title}
                </h2>

                <p className="text-sm text-[#A27A53]">
                    {job.category}
                </p>
            </div>

            <div className="bg-[#F3F1EB] px-4 py-3 rounded-full flex items-center gap-2">
                <MapPin size={14} className="text-[#102619]" />

                <span className="text-sm font-medium text-[#102619]">
                    {job.matchPercentage}% Match
                </span>
            </div>
        </div>

        <div className="mt-5 space-y-3">
            {/* Skill Sesuai */}
            <div className="flex items-center gap-4">
                <p className="text-xs tracking-[0.15em] uppercase text-gray-600 min-w-[130px]">
                    Skill Yang Sesuai
                </p>

                <span>:</span>

                <div className="flex flex-wrap gap-2">
                    {job.matchingSkills.map((skill) => (
                        <span
                            key={skill}
                            className="px-4 py-2 rounded-full bg-green-100 text-[#102619] text-sm"
                        >
                            {skill}
                        </span>
                    ))}
                </div>
            </div>

            {/* Perlu Ditambahkan */}
            <div className="flex items-center gap-4">
                <p className="text-xs tracking-[0.15em] uppercase text-gray-600 min-w-[130px]">
                    Perlu Ditambahkan
                </p>

                <span>:</span>

                <div className="flex flex-wrap gap-2">
                    {job.missingSkills.map((skill) => (
                        <span
                            key={skill}
                            className="px-4 py-2 rounded-full bg-orange-200 text-[#8B5A2B] text-sm"
                        >
                            {skill}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

export default JobRecommendationCard;