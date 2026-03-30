import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authApi } from "@/api/authApi";
import { useAuthStore } from "@/stores/auth";
import { FormInput } from "@/components/shared/FormInput";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useSnackbar } from "notistack";
import { jwtDecode } from "@/utils/jwtDecode";
import { handleApiErrors } from "@/utils/handleApiErrors";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);
  const { enqueueSnackbar } = useSnackbar();

  // If already authenticated, redirect to profile
  useEffect(() => {
    if (_hasHydrated && isAuthenticated) {
      navigate("/profile", { replace: true });
    }
  }, [_hasHydrated, isAuthenticated, navigate]);

  const methods = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (values: LoginForm) => {
    setLoading(true);
    try {
      const data = await authApi.login(values);

      // Backend returns { accessToken, refreshToken, id, username, role, mustChangePassword } inside unwrapped data
      const { accessToken, refreshToken, mustChangePassword } = data;

      // Decode JWT to extract user info from claims
      const decoded = jwtDecode(accessToken);
      const user = { ...decoded, mustChangePassword };

      setAuth(accessToken, refreshToken, user);
      enqueueSnackbar(`Welcome back, ${user.username}!`, {
        variant: "success",
      });

      // If user must change password, redirect to change-password page
      if (mustChangePassword) {
        navigate("/change-password");
      } else {
        navigate("/profile");
      }
    } catch (error) {
      console.error("Login failed:", error);
      const message = handleApiErrors(error, methods);
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
        p: 2,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 440,
          backdropFilter: "blur(20px)",
          background: "rgba(255,255,255,0.95)",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.4)",
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 4 }}>
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
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1,
                boxShadow: "0 8px 32px rgba(59,130,246,0.35)",
              }}
            >
              <LockOutlinedIcon sx={{ fontSize: 28 }} />
            </Box>
            <Typography variant="h1" sx={{ mt: 0.5, fontSize: "1.75rem" }}>
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to your HR Management account
            </Typography>
          </Box>

          <FormProvider {...methods}>
            <Box
              component="form"
              onSubmit={methods.handleSubmit(onSubmit)}
              sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
            >
              <FormInput
                name="username"
                label="Username"
                placeholder="Enter your username"
              />
              <FormInput
                name="password"
                label="Password"
                type="password"
                placeholder="••••••••"
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                size="large"
                sx={{
                  mt: 1,
                  py: 1.5,
                  background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  "&:hover": {
                    background: "linear-gradient(135deg, #2563eb, #1e40af)",
                  },
                }}
              >
                {loading && (
                  <CircularProgress
                    size={18}
                    sx={{ mr: 1, color: "inherit" }}
                  />
                )}
                Sign In
              </Button>
            </Box>
          </FormProvider>
        </CardContent>
      </Card>
    </Box>
  );
}
