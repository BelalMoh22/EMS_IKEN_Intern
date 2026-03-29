import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; // useQuery : fetch data , useMutation : update data(PUT , POST , DELETE) , useQueryClient : control cache
import { employeeApi } from "@/api/employeeApi";
import type { CreateEmployeeRequest, UpdateEmployeeRequest } from "@/types";
import { enqueueSnackbar } from "notistack";

/*
  With TanStack you get :
  caching : Stores data by queryKey => queryKey: ["employees"]
  auto refetch
  loading state
  error handling
  background updates
 */
export function useEmployees() {
  return useQuery({
    queryKey: ["employees"], // Unique identifier for cache
    queryFn: employeeApi.getAll, // unction that fetches data
  }); // Result :  const { data, isLoading } = useEmployees();
}

export function useEmployee(id: number) {
  return useQuery({
    queryKey: ["employees", id], // Unique per employee
    queryFn: () => employeeApi.getById(id),
    enabled: !!id, // Prevents execution if id is falsy
  });
}

export function useEmployeeByUserId(userId?: number) {
  return useQuery({
    queryKey: ["employees", "by-user", userId],
    queryFn: () => employeeApi.getByUserId(userId!),
    enabled: !!userId,
  });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEmployeeRequest) => employeeApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] }); // “Refetch employees list”
      enqueueSnackbar("Employee created successfully", { variant: "success" });
    },
    onError: () =>
      enqueueSnackbar("Failed to create employee", { variant: "error" }),
  });
}

export function useUpdateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEmployeeRequest }) =>
      employeeApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      enqueueSnackbar("Employee updated successfully", { variant: "success" });
    },
    onError: () =>
      enqueueSnackbar("Failed to update employee", { variant: "error" }),
  });
}

export function useDeleteEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => employeeApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      enqueueSnackbar("Employee deleted successfully", { variant: "success" });
    },
    onError: () =>
      enqueueSnackbar("Failed to delete employee", { variant: "error" }),
  });
}
