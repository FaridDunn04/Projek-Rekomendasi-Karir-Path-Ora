

// import { useState, useEffect } from "react";
// import { userService } from "../services/user.service";
// import { analysisService } from "../services/analysis.service";
// import { User, UpdateProfileRequest } from "../types/auth";
// import { Analysis, AnalysisListResponse } from "../types/analysis";
// import { parseApiError } from "../utils/error";

// export interface ProfileState {
//   user: User | null;
//   analyses: Analysis[];
//   isLoadingUser: boolean;
//   isLoadingAnalyses: boolean;
//   isUpdating: boolean;
//   error: string | null;
// }

// export function useProfile() {
//   const [state, setState] = useState<ProfileState>({
//     user: null,
//     analyses: [],
//     isLoadingUser: false,
//     isLoadingAnalyses: false,
//     isUpdating: false,
//     error: null,
//   });

//   // Fetch profile and analyses on mount
//   useEffect(() => {
//     const fetchProfile = async () => {
//       setState((prev) => ({ ...prev, isLoadingUser: true, error: null }));

//       try {
//         const [user, analysesResponse] = await Promise.all([
//           userService.getProfile(),
//           analysisService.getAnalyses(1, 100),
//         ]);

//         setState((prev) => ({
//           ...prev,
//           user,
//           analyses: analysesResponse.analyses,
//           isLoadingUser: false,
//         }));
//       } catch (error: any) {
//         setState((prev) => ({
//           ...prev,
//           error: parseApiError(error),
//           isLoadingUser: false,
//         }));
//       }
//     };

//     fetchProfile();
//   }, []);

//   // Update profile
//   const updateProfile = async (payload: UpdateProfileRequest): Promise<User | null> => {
//     setState((prev) => ({ ...prev, isUpdating: true, error: null }));

//     try {
//       const result = await userService.updateProfile(payload);
//       setState((prev) => ({
//         ...prev,
//         user: result,
//         isUpdating: false,
//       }));
//       return result;
//     } catch (error: any) {
//       setState((prev) => ({
//         ...prev,
//         error: parseApiError(error),
//         isUpdating: false,
//       }));
//       return null;
//     }
//   };

//   // Refresh profile and analyses
//   const refresh = async () => {
//     setState((prev) => ({ ...prev, isLoadingUser: true, error: null }));

//     try {
//       const [user, analysesResponse] = await Promise.all([
//         userService.getProfile(),
//         analysisService.getAnalyses(1, 100),
//       ]);

//       setState((prev) => ({
//         ...prev,
//         user,
//         analyses: analysesResponse.analyses,
//         isLoadingUser: false,
//       }));
//     } catch (error: any) {
//       setState((prev) => ({
//         ...prev,
//         error: parseApiError(error),
//         isLoadingUser: false,
//       }));
//     }
//   };

//   return {
//     ...state,
//     updateProfile,
//     refresh,
//   };
// }
