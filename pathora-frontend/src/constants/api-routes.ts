/**
 * API Routes Constants
 * Sesuai SDD & SRS - API Contract
 * Centralized API endpoint paths
 */

export const API_ROUTES = {
  // Auth
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
  },

  // Users
  USERS: {
    ME: "/users/me",
    PROFILE: "/users/me",
    UPDATE_PROFILE: "/users/me",
  },

  // CV Management
  CVS: {
    BASE: "/cvs",
    GET_CV: (id: string) => `/cvs/${id}`,
    UPLOAD: "/cvs",
    ANALYZE: (id: string) => `/cvs/${id}/analyze`,
    LIST: "/cvs",
  },

  // Analysis & Results
  ANALYSES: {
    BASE: "/analyses",
    GET: (id: string) => `/analyses/${id}`,
    LIST: "/analyses",
    HISTORY: "/analyses",
  },

  // Categories
  CATEGORIES: {
    BASE: "/categories",
    LIST: "/categories",
  },

  // Dashboard
  DASHBOARD: {
    SUMMARY: "/dashboard/summary",
    ANALYSIS_HISTORY: "/dashboard/analysis-history",
  },

  // Health Check
  HEALTH: "/health",
} as const;
