import React from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout.tsx";

interface UserProfile {
    name: string;
    email: string;
    photo: string;
}

interface AnalysisHistory {
    id: number;
    date: string;
    targetRole: string;
    score: number;
    status: "OPTIMAL" | "MODERATE";
}

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();

    const profile: UserProfile = {
        name: "Muchsin Hidayat Julianto",
        email: "2400018234@webmail.uad.ac.id",
        photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300",
    };

    const histories: AnalysisHistory[] = [
        {
            id: 1,
            date: "Nov 12, 2023",
            targetRole: "VP of Brand Strategy",
            score: 94,
            status: "OPTIMAL",
        },
        {
            id: 2,
            date: "Oct 05, 2023",
            targetRole: "Head of Growth",
            score: 89,
            status: "OPTIMAL",
        },
        {
            id: 3,
            date: "Sep 18, 2023",
            targetRole: "Director of Marketing",
            score: 78,
            status: "MODERATE",
        },
        {
            id: 4,
            date: "Aug 02, 2023",
            targetRole: "Marketing Manager",
            score: 71,
            status: "MODERATE",
        },
    ];

    return (
        <AppLayout>
            <div className="min-h-screen bg-[#F7F6F2] px-10 pt-0 pb-8 font-['Newsreader']">
                <div className="mb-8">
                        <h1 className="text-5xl font-bold font-['Newsreader'] text-gray-900">
                            Profile
                        </h1>
                </div>
                <div className="max-w-7xl mx-auto px-10">
                    {/* Profile Card */}
                    <div className="bg-white rounded-xl p-5  shadow-sm mb-20">
                        <div className="flex items-center gap-8">
                            <img
                                src={profile.photo}
                                alt={profile.name}
                                className="w-24 h-24 rounded-full object-cover"
                            />

                            <div>
                                <h2 className="font-['Newsreader'] text-3xl text-[#102619]">
                                    {profile.name}
                                </h2>

                                <p className="text-[#9A7A57] mt-2 text-lg">
                                    {profile.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* History Card */}
                    <div className="bg-white rounded-xl shadow-sm p-7 mt-10">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-['Newsreader'] text-2xl text-[#102619]">
                                Analysis History
                            </h2>

                            <button className="text-xs uppercase tracking-widest text-gray-600 hover:text-black">
                                View All →
                            </button>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-t border-b border-gray-200">
                                        <th className="py-3 text-left text-xs uppercase tracking-widest text-gray-500 font-medium">
                                            Date
                                        </th>

                                        <th className="py-3 text-left text-xs uppercase tracking-widest text-gray-500 font-medium">
                                            Target Role
                                        </th>

                                        <th className="py-3 text-center text-xs uppercase tracking-widest text-gray-500 font-medium">
                                            Score
                                        </th>

                                        <th className="py-3 text-right text-xs uppercase tracking-widest text-gray-500 font-medium">
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {histories.map((history) => (
                                        <tr
                                            key={history.id}
                                            className="border-b border-gray-100"
                                        >
                                            <td className="py-3 text-gray-700">
                                                {history.date}
                                            </td>

                                            <td className="py-3 text-gray-700">
                                                {history.targetRole}
                                            </td>

                                            <td className="py-3 text-center">
                                                <span className="font-['Newsreader'] text-2xl text-[#102619]">
                                                    {history.score}
                                                </span>
                                            </td>

                                            <td className="py-3 text-right">
                                                <span
                                                    className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide
                                                    ${
                                                        history.status === "OPTIMAL"
                                                            ? "bg-green-100 text-green-900"
                                                            : "bg-gray-200 text-gray-700"
                                                    }`}
                                                >
                                                    {history.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default ProfilePage;