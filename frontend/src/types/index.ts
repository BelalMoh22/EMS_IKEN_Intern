/**
 * Barrel re-export — all types are still importable via "@/types"
 * Each domain has its own dedicated file under src/types/
 */

export * from "./auth";
export * from "./employee";
export * from "./department";
export * from "./position";
export * from "./attendance";
export * from "./project";

// ─── Shared API wrapper ──────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  Message?: string; // Fallback
  data?: T;
  errors?: string[] | Record<string, string[]>;
  Errors?: string[] | Record<string, string[]>; // Fallback
}
