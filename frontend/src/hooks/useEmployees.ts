import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; // useQuery : fetch data , useMutation : update data(PUT , POST , DELETE) , useQueryClient : control cache
import { employeeApi } from "@/api/employeeApi";
import type { CreateEmployeeRequest, UpdateEmployeeRequest } from "@/types";

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
      qc.invalidateQueries({ queryKey: ["employees"] });
      qc.invalidateQueries({ queryKey: ["positions"] });
    },
  });
}

export function useUpdateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEmployeeRequest }) =>
      employeeApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      qc.invalidateQueries({ queryKey: ["positions"] });
      qc.invalidateQueries({ queryKey: ["departments"] });
    },
  });
}

export function useDeleteEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => employeeApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      qc.invalidateQueries({ queryKey: ["positions"] });
      qc.invalidateQueries({ queryKey: ["departments"] });
    },
  });
}
import { authApi } from "@/api/authApi";

export function useResetCredentials() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: { username: string; newPassword: string } }) =>
      authApi.resetCredentials(userId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

