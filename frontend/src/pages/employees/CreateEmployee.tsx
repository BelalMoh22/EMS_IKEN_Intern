import { useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateEmployee } from "@/hooks/useEmployees";
import { useDepartments } from "@/hooks/useDepartments";
import { usePositions } from "@/hooks/usePositions";
import { authApi } from "@/api/authApi";
import { FormInput } from "@/components/shared/FormInput";
import { FormSelect } from "@/components/shared/FormSelect";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  CircularProgress,
  Grid,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useSnackbar } from "notistack";
import { useState } from "react";
import { ROLE_ENUM_MAP } from "@/types";
import type { Role } from "@/types";

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastname: z.string().min(1, "Last name is required"),
  nationalId: z.string().regex(/^\d{14}$/, "National ID must be exactly 14 digits"),
  email: z.string().email("Invalid email"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  address: z.string().min(1, "Address is required"),
  salary: z.preprocess((v) => Number(v), z.number().min(0, "Salary must be positive")),
  positionId: z.preprocess((v) => Number(v), z.number().min(1, "Position is required")),
  // User account fields
  username: z.string().min(1, "Username is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
      "Password must contain uppercase, lowercase, number, and special character"
    ),
  role: z.enum(["HR", "Manager", "Employee"]),
});

type FormData = z.infer<typeof schema>;

export default function CreateEmployee() {
  const navigate = useNavigate();
  const createMutation = useCreateEmployee();
  const { data: departments } = useDepartments();
  const { data: positions } = usePositions();
  const { enqueueSnackbar } = useSnackbar();
  const [submitting, setSubmitting] = useState(false);

  const methods = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      firstName: "",
      lastname: "",
      nationalId: "",
      email: "",
      phoneNumber: "",
      dateOfBirth: "",
      address: "",
      salary: 0,
      positionId: 0,
      username: "",
      password: "",
      role: "Employee",
    },
  });

  const onSubmit = async (values: FormData) => {
    setSubmitting(true);
    try {
      // Create employee record via /api/employees (backend now auto-creates the User!)
      createMutation.mutate(
        {
          firstName: values.firstName,
          lastname: values.lastname,
          nationalId: values.nationalId,
          email: values.email,
          phoneNumber: values.phoneNumber,
          dateOfBirth: values.dateOfBirth,
          address: values.address,
          salary: values.salary,
          positionId: values.positionId,
          username: values.username,
          password: values.password,
          role: ROLE_ENUM_MAP[values.role as Role],
          status: 1, // Active
        },
        {
          onSuccess: () => {
            enqueueSnackbar("Employee and user account created successfully!", {
              variant: "success",
            });
            navigate("/employees");
          },
          onError: (error) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const err = error as any;
            const data = err?.response?.data;
            let msg = data?.message ?? "Failed to create employee record";
            
            if (data?.errors) {
              if (typeof data.errors === "object" && !Array.isArray(data.errors)) {
                msg = Object.values(data.errors).flat().join(", ");
              } else if (Array.isArray(data.errors)) {
                msg = data.errors.join(", ");
              }
            }
            enqueueSnackbar(msg, { variant: "error" });
            setSubmitting(false);
          },
        }
      );
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;
      const data = err?.response?.data;
      let msg = data?.message ?? "Failed to create user account";
      
      if (data?.errors) {
        if (typeof data.errors === "object" && !Array.isArray(data.errors)) {
          msg = Object.values(data.errors).flat().join(", ");
        } else if (Array.isArray(data.errors)) {
          msg = data.errors.join(", ");
        }
      }

      enqueueSnackbar(msg, { variant: "error" });
      setSubmitting(false);
    }
  };

  // Filter positions by selected department if needed
  const watchedPositionId = methods.watch("positionId");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton onClick={() => navigate("/employees")}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h1">Create Employee</Typography>
          <Typography variant="body2" color="text.secondary">
            Add a new team member with user account
          </Typography>
        </Box>
      </Box>

      <FormProvider {...methods}>
        <Box
          component="form"
          onSubmit={methods.handleSubmit(onSubmit)}
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        >
          {/* User Account Card */}
          <Card>
            <CardHeader
              title="User Account"
              subheader="Login credentials for the employee"
              titleTypographyProps={{ variant: "h2" }}
              subheaderTypographyProps={{ variant: "body2" }}
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormInput
                    name="username"
                    label="Username"
                    placeholder="john.doe"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormInput
                    name="password"
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormSelect
                    name="role"
                    label="Role"
                    options={[
                      { label: "HR", value: "HR" },
                      { label: "Manager", value: "Manager" },
                      { label: "Employee", value: "Employee" },
                    ]}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Personal Info Card */}
          <Card>
            <CardHeader
              title="Personal Information"
              titleTypographyProps={{ variant: "h2" }}
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormInput
                    name="firstName"
                    label="First Name"
                    placeholder="John"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormInput
                    name="lastname"
                    label="Last Name"
                    placeholder="Doe"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormInput
                    name="nationalId"
                    label="National ID (14 digits)"
                    placeholder="12345678901234"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormInput
                    name="email"
                    label="Email"
                    type="email"
                    placeholder="john@company.com"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormInput
                    name="phoneNumber"
                    label="Phone Number"
                    placeholder="+201234567890"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormInput
                    name="dateOfBirth"
                    label="Date of Birth"
                    type="date"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <FormInput
                    name="address"
                    label="Address"
                    placeholder="123 Main St, City"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Job Info Card */}
          <Card>
            <CardHeader
              title="Job Information"
              titleTypographyProps={{ variant: "h2" }}
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormSelect
                    name="positionId"
                    label="Position"
                    options={
                      positions?.map((p) => ({
                        label: p.positionName,
                        value: String(p.id),
                      })) ?? []
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormInput
                    name="salary"
                    label="Salary"
                    type="number"
                    placeholder="50000"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Actions */}
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                "&:hover": {
                  background: "linear-gradient(135deg, #2563eb, #1e40af)",
                },
              }}
            >
              {submitting && (
                <CircularProgress
                  size={18}
                  sx={{ mr: 1, color: "inherit" }}
                />
              )}
              Create Employee
            </Button>
            <Button variant="outlined" onClick={() => navigate("/employees")}>
              Cancel
            </Button>
          </Box>
        </Box>
      </FormProvider>
    </Box>
  );
}
