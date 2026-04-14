// ─── Department ──────────────────────────────────────────
export interface Department {
  id: number;
  departmentName: string;
  description: string | null;
  isActive: boolean | null;
  createdAt: string;
  isDeleted: boolean;
}

export interface CreateDepartmentRequest {
  departmentName: string;
  description?: string;
}

export interface UpdateDepartmentRequest {
  departmentName?: string;
  description?: string;
  isActive?: boolean;
}
