export * from "./auth";
export * from "./employee";
export * from "./department";
export * from "./position";
export * from "./attendance";
export * from "./project";
export * from "./worklog";

// ─── Shared API wrapper ──────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  Message?: string; // Fallback
  data?: T;
  errors?: string[] | Record<string, string[]>;
  Errors?: string[] | Record<string, string[]>; // Fallback
}
