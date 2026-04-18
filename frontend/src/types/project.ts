export type ProjectStatus = "Open" | "Completed";

export interface Project {
  id: number;
  name: string;
  description: string | null;
  status: ProjectStatus;
  departmentId: number;
  createdAt: string;
  isDeleted: boolean;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: ProjectStatus;
}

// ─── Project status enum mapping ──────────────────────────
export const PROJECT_STATUS_ENUM_MAP: Record<ProjectStatus, number> = {
  Open: 1,
  Completed: 2,
} as const;  // Converts Frontend(string) → Backend(Enum) -> Sending Data

export const PROJECT_STATUS_FROM_NUMBER: Record<number, ProjectStatus> = {
  1: "Open",
  2: "Completed",
}; // Converts Backend(Enum) → Frontend(string) -> Displaying Data
