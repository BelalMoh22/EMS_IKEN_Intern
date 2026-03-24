import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authApi } from "@/api/authApi";
import { useAuthStore } from "@/stores/auth";
import { FormInput } from "@/components/shared/FormInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const methods = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginForm) => {
    setLoading(true);
    try {
      // Mock login for UI testing without backend
      if (values.email === "admin@example.com" && values.password === "123456") {
        setAuth("mock-token", "mock-refresh-token", {
          id: "1",
          email: "admin@example.com",
          firstName: "Admin",
          lastName: "User",
          role: "Admin",
        });
        toast.success("Login successful (Mock Mode)");
        navigate("/dashboard");
        return;
      }

      const data = await authApi.login(values);
      setAuth(data.token, data.refreshToken, data.user);
      navigate("/dashboard");
    } catch {
      toast.error("Invalid credentials (or backend is offline)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground text-lg font-bold">
            HR
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to your HR Management account</CardDescription>
        </CardHeader>
        <CardContent>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
              <FormInput name="email" label="Email" type="email" placeholder="admin@company.com" />
              <FormInput name="password" label="Password" type="password" placeholder="••••••••" />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
}
