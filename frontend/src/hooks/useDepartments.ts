import { useQuery, useMutation, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { departmentApi } from "@/api/departmentApi";
import type { Department, CreateDepartmentRequest, UpdateDepartmentRequest } from "@/types";

export function useDepartments(options?: Partial<UseQueryOptions<Department[]>>) {
  return useQuery<Department[]>({
    queryKey: ["departments"],
    queryFn: departmentApi.getAll,
    ...options,
  });
}

export function useDepartment(id: number) {
  return useQuery({
    queryKey: ["departments", id],
    queryFn: () => departmentApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDepartmentRequest) => departmentApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["departments"] });
    },
  });
}

export function useUpdateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDepartmentRequest }) =>
      departmentApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["departments"] });
    },
  });
}

export function useDeleteDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => departmentApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["departments"] });
    },
  });
}


