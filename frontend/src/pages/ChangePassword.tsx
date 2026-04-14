import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useChangePassword } from "@/hooks/useChangePassword";
import { useAuthStore } from "@/stores/auth";
import { FormInput } from "@/components/shared/FormInput";
import { handleApiErrors } from "@/utils/handleApiErrors";
import { useSnackbar } from "notistack";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import LockResetIcon from "@mui/icons-material/LockReset";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

// ── Zod Schema ──────────────────────────────────────────
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[^a-zA-Z0-9]/, "Must contain at least one special character"),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export default function ChangePassword() {
  const mustChangePassword = useAuthStore((s) => s.user?.mustChangePassword);
  const { mutate, isPending } = useChangePassword();
  const { enqueueSnackbar } = useSnackbar();

  const methods = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: ""
    },
  });

  const onSubmit = (values: ChangePasswordForm) => {
    mutate(values, {
      onSuccess: () => {
        enqueueSnackbar("Password changed successfully", { variant: "success" });
        methods.reset();
      },
      onError: (error) => {
        const message = handleApiErrors(error, methods);
        enqueueSnackbar(message, { variant: "error" });
      },
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        maxWidth: 520,
        mx: "auto",
        mt: { xs: 2, md: 4 },
      }}
    >
      {/* Forced change banner */}
      {mustChangePassword && (
        <Alert
          severity="warning"
          icon={<WarningAmberIcon />}
          sx={{
            width: "100%",
            borderRadius: 2,
            fontWeight: 500,
          }}
        >
          You must change your password before continuing. This is required for
          security purposes.
        </Alert>
      )}

      <Card
        sx={{
          width: "100%",
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
              mb: 4,
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1,
                boxShadow: "0 8px 32px rgba(245,158,11,0.35)",
              }}
            >
              <LockResetIcon sx={{ fontSize: 28 }} />
            </Box>
            <Typography variant="h1" sx={{ fontSize: "1.75rem" }}>
              Change Password
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter your current password and choose a new one
            </Typography>
          </Box>

          {/* Form */}
          <FormProvider {...methods}>
            <Box
              component="form"
              onSubmit={methods.handleSubmit(onSubmit)}
              sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
            >
              <FormInput
                name="currentPassword"
                label="Current Password"
                type="password"
                placeholder="••••••••"
              />
              <FormInput
                name="newPassword"
                label="New Password"
                type="password"
                placeholder="••••••••"
              />
              {/* Password Requirements */}
              <Box
                sx={{
                  bgcolor: "grey.50",
                  borderRadius: 2,
                  p: 2,
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight={600}
                  color="text.secondary"
                  sx={{ display: "block", mb: 0.5 }}
                >
                  Password Requirements:
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  component="ul"
                  sx={{ pl: 2, m: 0, "& li": { mb: 0.25 } }}
                >
                  <li>At least 8 characters long</li>
                  <li>At least one uppercase letter (A-Z)</li>
                  <li>At least one number (0-9)</li>
                  <li>At least one special character (!@#$%...)</li>
                  <li>Must be different from current password</li>
                </Typography>
              </Box>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isPending}
                size="large"
                sx={{
                  mt: 1,
                  py: 1.5,
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  "&:hover": {
                    background: "linear-gradient(135deg, #d97706, #b45309)",
                  },
                }}
              >
                {isPending && (
                  <CircularProgress
                    size={18}
                    sx={{ mr: 1, color: "inherit" }}
                  />
                )}
                Change Password
              </Button>
            </Box>
          </FormProvider>
        </CardContent>
      </Card>
    </Box>
  );
}
