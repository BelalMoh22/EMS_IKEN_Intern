// ─── Department ──────────────────────────────────────────
export interface Department {
  id: number;
  departmentName: string;
  description: string | null;
  managerId: number | null;
  isActive: boolean | null;
  createdAt: string;
  isDeleted: boolean;
}

export interface CreateDepartmentRequest {
  departmentName: string;
  description?: string;
  managerId?: number | null;
}

export interface UpdateDepartmentRequest {
  departmentName?: string;
  description?: string;
  managerId?: number | null;
  isActive?: boolean;
}
