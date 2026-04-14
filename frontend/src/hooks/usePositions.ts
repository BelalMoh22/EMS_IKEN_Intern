import { useQuery, useMutation, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { positionApi } from "@/api/positionApi";
import type { Position, CreatePositionRequest, UpdatePositionRequest } from "@/types";

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
    },
  });
}

export function useUpdatePosition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePositionRequest }) =>
      positionApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["positions"] });
    },
  });
}

export function useDeletePosition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => positionApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["positions"] });
    },
  });
}


