/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/api/authApi";
import type { ChangePasswordRequest } from "@/types";
import { useAuthStore } from "@/stores/auth";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";

export function useChangePassword() {
  const setMustChangePassword = useAuthStore((s) => s.setMustChangePassword);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => authApi.changePassword(data),
    onSuccess: () => {
      setMustChangePassword(false);
      enqueueSnackbar("Password changed successfully!", { variant: "success" });
      navigate("/profile");
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.errors?.[0] ||
        error?.response?.data?.message ||
        "Failed to change password. Please try again.";
      enqueueSnackbar(msg, { variant: "error" });
    },
  });
}
