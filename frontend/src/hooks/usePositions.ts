import { useQuery, useMutation, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { positionApi } from "@/api/positionApi";
import type { Position, CreatePositionRequest, UpdatePositionRequest } from "@/types";
import { enqueueSnackbar } from "notistack";

export function usePositions(options?: Partial<UseQueryOptions<Position[]>>) {
  return useQuery<Position[]>({
    queryKey: ["positions"],
    queryFn: positionApi.getAll,
    ...options,
  });
}

export function usePosition(id: number) {
  return useQuery({
    queryKey: ["positions", id],
    queryFn: () => positionApi.getById(id),
    enabled: !!id,
  });
}

export function useCreatePosition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePositionRequest) => positionApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["positions"] });
      enqueueSnackbar("Position created successfully", { variant: "success" });
    },
    onError: () =>
      enqueueSnackbar("Failed to create position", { variant: "error" }),
  });
}

export function useUpdatePosition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePositionRequest }) =>
      positionApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["positions"] });
      enqueueSnackbar("Position updated successfully", { variant: "success" });
    },
    onError: () =>
      enqueueSnackbar("Failed to update position", { variant: "error" }),
  });
}

export function useDeletePosition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => positionApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["positions"] });
      enqueueSnackbar("Position deleted successfully", { variant: "success" });
    },
    onError: () =>
      enqueueSnackbar("Failed to delete position", { variant: "error" }),
  });
}
