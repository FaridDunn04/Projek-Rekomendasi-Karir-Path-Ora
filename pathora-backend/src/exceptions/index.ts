/**
 * exceptions/index.ts
 *
 * Barrel export untuk seluruh kelas exception.
 * Seluruh modul cukup mengimpor dari '@/exceptions' tanpa
 * perlu mengetahui path file individual (SDD §3.2).
 *
 * Urutan export: base → HTTP 4xx → HTTP 5xx/gateway
 */

export { HttpException } from "@/exceptions/base-error";
export { AuthenticationError } from "@/exceptions/authentication-error";
export { AuthorizationError } from "@/exceptions/authorization-error";
export { NotFoundError } from "@/exceptions/not-found-error";
export { ClientError } from "@/exceptions/client-error";
export { ConflictError } from "@/exceptions/conflict-error";
export { InvariantError } from "@/exceptions/invariant-error";
export { AiGatewayError } from "@/exceptions/ai-gateway-error";
export type { AiErrorType } from "@/exceptions/ai-gateway-error";
