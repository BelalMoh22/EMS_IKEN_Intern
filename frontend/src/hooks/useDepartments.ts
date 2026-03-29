import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { departmentApi } from "@/api/departmentApi";
import type { CreateDepartmentRequest, UpdateDepartmentRequest } from "@/types";
import { enqueueSnackbar } from "notistack";

export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: departmentApi.getAll,
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
      enqueueSnackbar("Department created successfully", {
        variant: "success",
      });
    },
    onError: () =>
      enqueueSnackbar("Failed to create department", { variant: "error" }),
  });
}

export function useUpdateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDepartmentRequest }) =>
      departmentApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["departments"] });
      enqueueSnackbar("Department updated successfully", {
        variant: "success",
      });
    },
    onError: () =>
      enqueueSnackbar("Failed to update department", { variant: "error" }),
  });
}

export function useDeleteDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => departmentApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["departments"] });
      enqueueSnackbar("Department deleted successfully", {
        variant: "success",
      });
    },
    onError: () =>
      enqueueSnackbar("Failed to delete department", { variant: "error" }),
  });
}
