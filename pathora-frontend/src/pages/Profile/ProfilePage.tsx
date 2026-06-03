import React from "react";
import AppLayout from "../../components/layout/AppLayout";
import { useProfile } from "../../hooks/useProfile";

const ProfilePage: React.FC = () => {
  const { user, analyses, isLoading, error } = useProfile();

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-10 text-gray-600">Loading profile...</div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="p-10 text-red-500">{error}</div>
      </AppLayout>
    );
  }

  const averageConfidence =
    analyses.length > 0
      ? Math.round(
          (analyses.reduce((acc, analysis) => acc + analysis.confidence, 0) /
            analyses.length) *
            100,
        )
      : 0;

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#F7F6F2] px-10 pt-0 pb-8 font-['Newsreader']">
        <div className="mb-8">
          <h1 className="text-5xl font-bold font-['Newsreader'] text-gray-900">
            Profile
          </h1>
        </div>

        <div className="max-w-7xl mx-auto px-10">
          <div className="bg-white rounded-xl p-5 shadow-sm mb-20">
            <div className="flex items-center gap-8">
              {user?.profile_picture ? (
                <img
                  src={user.profile_picture}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#102619] text-white flex items-center justify-center text-3xl font-bold">
                  {user?.name?.charAt(0).toUpperCase() ?? "P"}
                </div>
              )}

              <div>
                <h2 className="font-['Newsreader'] text-3xl text-[#102619]">
                  {user?.name}
                </h2>
                <p className="text-[#9A7A57] mt-2 text-lg">{user?.email}</p>
                <p className="text-gray-500 mt-2 text-sm">
                  Bergabung sejak{" "}
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-7 mt-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-['Newsreader'] text-2xl text-[#102619]">
                Analysis History
              </h2>
              <div className="text-sm text-gray-500">
                Total Analisis: {analyses.length}
              </div>
            </div>

            {analyses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Belum ada riwayat analisis.</p>
              </div>
            ) : (
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
                    {analyses.map((analysis) => (
                      <tr
                        key={analysis.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 text-gray-700">
                          {analysis.created_at
                            ? new Date(analysis.created_at).toLocaleDateString(
                                "id-ID",
                              )
                            : "-"}
                        </td>
                        <td className="py-3 text-gray-700">
                          {analysis.predicted_category}
                        </td>
                        <td className="py-3 text-center">
                          <span className="font-['Newsreader'] text-2xl text-[#102619]">
                            {Math.round(analysis.confidence * 100)}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <span
                            className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide ${
                              analysis.status === "success"
                                ? "bg-green-100 text-green-900"
                                : analysis.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {analysis.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {analyses.length > 0 && (
              <div className="mt-8 flex justify-end">
                <div className="bg-[#F7F6F2] rounded-lg px-5 py-3">
                  <p className="text-sm text-gray-500">
                    Rata-rata Confidence
                  </p>
                  <p className="text-2xl font-['Newsreader'] text-[#102619]">
                    {averageConfidence}%
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
