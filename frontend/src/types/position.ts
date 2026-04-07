// ─── Position ────────────────────────────────────────────
export interface Position {
  id: number;
  positionName: string;
  minSalary: number;
  maxSalary: number;
  departmentId: number;
  targetEmployeeCount: number;
  currentEmployeeCount: number;
  isFull: boolean;
  createdAt: string;
  isDeleted: boolean;
}

export interface CreatePositionRequest {
  positionName: string;
  minSalary: number;
  maxSalary: number;
  departmentId: number;
  targetEmployeeCount: number;
}

export interface UpdatePositionRequest {
  positionName?: string;
  minSalary?: number;
  maxSalary?: number;
  departmentId?: number;
  targetEmployeeCount?: number;
}
