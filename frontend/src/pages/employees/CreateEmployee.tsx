/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate, useLocation } from "react-router-dom";
import { useForm, FormProvider, Controller } from "react-hook-form";
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
  TextField,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { ROLE_ENUM_MAP } from "@/types";
import type { Role } from "@/types";
import { handleApiErrors } from "@/utils/handleApiErrors";

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastname: z.string().min(1, "Last name is required"),
  nationalId: z
    .string()
    .regex(/^\d{14}$/, "National ID must be exactly 14 digits"),
  email: z.string().email("Invalid email"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  address: z.string().min(1, "Address is required"),
  salary: z.preprocess(
    (v) => Number(v),
    z.number().min(0, "Salary must be positive"),
  ),
  positionId: z.preprocess(
    (v) => Number(v),
    z.number().min(1, "Position is required"),
  ),
  // User account fields
  username: z.string().min(1, "Username is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
      "Password must contain uppercase, lowercase, number, and special character",
    ),
  role: z.enum(["HR", "Manager", "Employee"]),
});

type FormData = z.infer<typeof schema>;

export default function CreateEmployee() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { positionId?: number };

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
      positionId: state?.positionId ?? 0,
      username: "",
      password: "",
      role: "Employee",
    },
  });

  const onSubmit = async (values: FormData) => {
    setSubmitting(true);
    try {
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
            enqueueSnackbar("Employee created successfully", {
              variant: "success",
            });
            navigate("/employees");
          },
          onError: (error) => {
            const message = handleApiErrors(error, methods);
            if (message) enqueueSnackbar(message, { variant: "error" });
            setSubmitting(false);
          },
        },
      );
    } catch (error) {
      const message = handleApiErrors(error, methods);
      if (message) enqueueSnackbar(message, { variant: "error" });
      setSubmitting(false);
    }
  };

  // Filter positions by selected department if needed
  const watchedPositionId = methods.watch("positionId");

  // Auto-set role based on position
  useEffect(() => {
    if (watchedPositionId > 0 && positions) {
      const position = positions.find(
        (p) => p.id === Number(watchedPositionId),
      );
      if (position) {
        // Only auto-update if not manually set to HR
        const currentRole = methods.getValues("role");
        if (currentRole !== "HR") {
          methods.setValue("role", position.isManager ? "Manager" : "Employee");
        }
      }
    }
  }, [watchedPositionId, positions, methods]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton onClick={() => navigate("/employees")}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h1" sx={{ fontSize: "1.875rem", fontWeight: 700 }}>
            Create Employee
          </Typography>
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
          <Card sx={{ borderRadius: 3, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
            <CardHeader
              title="User Account"
              subheader="Login credentials for the employee"
              titleTypographyProps={{ variant: "h2", sx: { fontSize: "1.25rem" } }}
              subheaderTypographyProps={{ variant: "body2" }}
            />
            <Divider />
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormInput
                    name="username"
                    label="Username"
                    placeholder="john.doe"
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormInput
                    name="password"
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormSelect
                    name="role"
                    label="Role"
                    required
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
          <Card sx={{ borderRadius: 3, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
            <CardHeader
              title="Personal Information"
              titleTypographyProps={{ variant: "h2", sx: { fontSize: "1.25rem" } }}
            />
            <Divider />
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormInput
                    name="firstName"
                    label="First Name"
                    placeholder="John"
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormInput
                    name="lastname"
                    label="Last Name"
                    placeholder="Doe"
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormInput
                    name="nationalId"
                    label="National ID (14 digits)"
                    placeholder="12345678901234"
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormInput
                    name="email"
                    label="Email"
                    type="email"
                    placeholder="john@company.com"
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormInput
                    name="phoneNumber"
                    label="Phone Number"
                    placeholder="+201234567890"
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormInput
                    name="dateOfBirth"
                    label="Date of Birth"
                    type="date"
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <FormInput
                    name="address"
                    label="Address"
                    placeholder="123 Main St, City"
                    required
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Job Info Card */}
          <Card sx={{ borderRadius: 3, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
            <CardHeader
              title="Job Information"
              titleTypographyProps={{ variant: "h2", sx: { fontSize: "1.25rem" } }}
            />
            <Divider />
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormSelect
                    name="positionId"
                    label="Position"
                    required
                    options={
                      positions?.map((p) => ({
                        label: `${p.positionName} (${p.currentEmployeeCount}/${p.targetEmployeeCount})`,
                        value: String(p.id),
                        disabled: p.isFull,
                      })) ?? []
                    }
                  />
                  {watchedPositionId > 0 &&
                    positions?.find((p) => p.id === Number(watchedPositionId))
                      ?.isFull && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mt: 1, display: "block" }}
                      >
                        Position capacity reached. Please select another
                        position.
                      </Typography>
                    )}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Department (derived from position)"
                    required
                    disabled
                    fullWidth
                    size="small"
                    value={
                      positions?.find((p) => p.id === Number(watchedPositionId))
                        ?.departmentName ?? ""
                    }
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{ "& .MuiFormLabel-asterisk": { color: "#d32f2f" } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="salary"
                    control={methods.control}
                    render={({ field: { onChange, value, ...rest }, fieldState }) => {
                      const displayValue = value !== undefined && value !== null && String(value) !== ""
                        ? String(value)
                            .replace(/\D/g, "")
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                        : "";

                      return (
                        <TextField
                          {...rest}
                          label="Salary"
                          placeholder="50.000"
                          value={displayValue}
                          required
                          fullWidth
                          size="small"
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                          sx={{ "& .MuiFormLabel-asterisk": { color: "#d32f2f" } }}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/\D/g, "");
                            onChange(raw);
                          }}
                          onFocus={() => {
                            if (String(value) === "0") {
                              onChange("");
                            }
                          }}
                          onBlur={(e) => {
                            if (!e.target.value) {
                              onChange(0);
                            }
                            rest.onBlur();
                          }}
                        />
                      );
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Actions */}
          <Box sx={{ display: "flex", gap: 1.5, mt: 1 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{
                px: 4,
                py: 1,
                borderRadius: 2,
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                "&:hover": {
                  background: "linear-gradient(135deg, #2563eb, #1e40af)",
                },
              }}
            >
              {submitting && (
                <CircularProgress size={18} sx={{ mr: 1, color: "inherit" }} />
              )}
              Create Employee
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate("/employees")}
              sx={{ px: 4, py: 1, borderRadius: 2 }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </FormProvider>
    </Box>
  );
}
