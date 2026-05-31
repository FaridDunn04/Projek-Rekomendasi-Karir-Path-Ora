/**
 * exceptions/index.ts
 *
 * Barrel export untuk seluruh kelas exception.
 * Seluruh modul cukup mengimpor dari '@/exceptions' tanpa
 * perlu mengetahui path file individual (SDD §3.2).
 *
 * Urutan export: base → HTTP 4xx → HTTP 5xx/gateway
 */

export { HttpException } from "./base-error";
export { AuthenticationError } from "./authentication-error";
export { AuthorizationError } from "./authorization-error";
export { NotFoundError } from "./not-found-error";
export { ClientError } from "./client-error";
export { ConflictError } from "./conflict-error";
export { InvariantError } from "./invariant-error";
export { AiGatewayError } from "./ai-gateway-error";
export type { AiErrorType } from "./ai-gateway-error";
