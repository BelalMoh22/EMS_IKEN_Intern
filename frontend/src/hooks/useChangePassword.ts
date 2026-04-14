/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/api/authApi";
import type { ChangePasswordRequest } from "@/types";
import { useAuthStore } from "@/stores/auth";

export function useChangePassword() {
  const setMustChangePassword = useAuthStore((s) => s.setMustChangePassword);

  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => authApi.changePassword(data),
    onSuccess: () => {
      setMustChangePassword(false);
    },
  });
}

