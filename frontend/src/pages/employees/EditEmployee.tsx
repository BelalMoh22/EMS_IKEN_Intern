/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate, useParams } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEmployee, useUpdateEmployee } from "@/hooks/useEmployees";
import { usePositions } from "@/hooks/usePositions";
import { FormInput } from "@/components/shared/FormInput";
import { FormSelect } from "@/components/shared/FormSelect";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
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
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useEffect, useMemo } from "react";
import { STATUS_ENUM_MAP, ROLE_ENUM_MAP } from "@/types";
import type { EmployeeStatus, Role } from "@/types";
import { handleApiErrors } from "@/utils/handleApiErrors";
import { useSnackbar } from "notistack";

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastname: z.string().min(1, "Last name is required"),
  nationalId: z
    .string()
    .regex(/^\d{14}$/, "National ID must be exactly 14 digits"),
  email: z
    .string()
    .email("Invalid email")
    .refine((email) => email.endsWith("@iken.tech"), {
      message: "Email must end with @iken.tech",
    }),
  phoneNumber: z.string().min(1, "Phone number is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),

  salary: z.coerce.number().min(0, "Salary must be positive"),
  positionId: z.coerce.number().min(1, "Position is required"),
  status: z.coerce.number().min(1).max(3),
  role: z.enum(["HR", "Manager", "Employee"]),
  username: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function EditEmployee() {
  const { id } = useParams<{ id: string }>();
  const numId = Number(id);
  const navigate = useNavigate();
  const { data: employee, isLoading } = useEmployee(numId);
  const updateMutation = useUpdateEmployee();
  const { data: positions } = usePositions();
  const { enqueueSnackbar } = useSnackbar();

  const methods = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      firstName: "",
      lastname: "",
      nationalId: "",
      email: "",
      phoneNumber: "",
      dateOfBirth: "",

      salary: 0,
      positionId: 0,
      status: 1,
      role: "Employee",
      username: "",
    },
  });

  useEffect(() => {
    if (employee) {
      methods.reset({
        firstName: employee.firstName ?? "",
        lastname: employee.lastname ?? "",
        nationalId: employee.nationalId ?? "",
        email: employee.email ?? "",
        phoneNumber: employee.phoneNumber ?? "",
        dateOfBirth: employee.dateOfBirth?.split("T")[0] ?? "",

        salary: employee.salary ?? 0,
        positionId: employee.positionId ?? 0,
        status: STATUS_ENUM_MAP[employee.status as EmployeeStatus] ?? 1,
        role: (employee.user?.role as any) ?? "Employee",
        username: employee.user?.username,
      });
    }
  }, [employee, methods]);

  const watchedPositionId = methods.watch("positionId");
  const watchedRole = methods.watch("role");

  // Derive role-position mismatch warning
  const rolePositionMismatch = useMemo(() => {
    if (!positions || !watchedPositionId || !watchedRole) return null;
    // HR role is independent of position — no mismatch possible
    if (watchedRole === "HR") return null;

    const selectedPosition = positions.find(
      (p) => p.id === Number(watchedPositionId),
    );
    if (!selectedPosition) return null;

    if (watchedRole === "Manager" && !selectedPosition.isManager) {
      return {
        severity: "warning" as const,
        message:
          'You have set the role to "Manager" but the selected position is not a manager position. Please assign a position that has manager privileges enabled.',
      };
    }

    if (watchedRole === "Employee" && selectedPosition.isManager) {
      return {
        severity: "warning" as const,
        message:
          'You have set the role to "Employee" but the selected position is a manager position. Please assign a non-manager position for this role.',
      };
    }

    return null;
  }, [watchedRole, watchedPositionId, positions]);

  const onSubmit = (values: FormData) => {
    updateMutation.mutate(
      {
        id: numId,
        data: {
          firstName: values.firstName,
          lastname: values.lastname,
          nationalId: values.nationalId,
          email: values.email,
          phoneNumber: values.phoneNumber,
          dateOfBirth: values.dateOfBirth,

          salary: values.salary,
          positionId: values.positionId,
          status: values.status,
          role: ROLE_ENUM_MAP[values.role as Role],
        },
      },
      {
        onSuccess: () => {
          enqueueSnackbar("Employee updated successfully", { variant: "success" });
          navigate("/employees");
        },
        onError: (error) => {
          const message = handleApiErrors(error, methods);
          if (message) enqueueSnackbar(message, { variant: "error" });
        },
      },
    );
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton onClick={() => navigate("/employees")}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h1">Edit Employee</Typography>
          <Typography variant="body2" color="text.secondary">
            Update employee information and role
          </Typography>
        </Box>
      </Box>

      <FormProvider {...methods}>
        <Box
          component="form"
          onSubmit={methods.handleSubmit(onSubmit)}
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        >
          {/* User Account */}
          <Card>
            <CardHeader
              title="User Account"
              titleTypographyProps={{ variant: "h2" }}
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
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
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Username"
                    fullWidth
                    size="small"
                    disabled
                    value={methods.watch("username")}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>
                {/* Role-Position mismatch warning */}
                {rolePositionMismatch && (
                  <Grid size={{ xs: 12 }}>
                    <Alert
                      severity={rolePositionMismatch.severity}
                      icon={<WarningAmberIcon />}
                      sx={{
                        borderRadius: 2,
                        "& .MuiAlert-message": { fontWeight: 500 },
                      }}
                    >
                      {rolePositionMismatch.message}
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Personal Info */}
          <Card>
            <CardHeader
              title="Personal Information"
              titleTypographyProps={{ variant: "h2" }}
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormInput name="firstName" label="First Name" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormInput name="lastname" label="Last Name" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormInput name="nationalId" label="National ID" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormInput name="email" label="Email" type="email" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormInput name="phoneNumber" label="Phone Number" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormInput
                    name="dateOfBirth"
                    label="Date of Birth"
                    type="date"
                  />
                </Grid>

              </Grid>
            </CardContent>
          </Card>

          {/* Job Info */}
          <Card>
            <CardHeader
              title="Job Information"
              titleTypographyProps={{ variant: "h2" }}
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {(() => {
                    const watchedStatus = Number(methods.watch("status"));
                    const isFull = positions?.find(
                      (p) => p.id === Number(watchedPositionId),
                    )?.isFull;
                    const isEmployeeActive = employee?.status === "Active";
                    const isPositionChanged =
                      Number(watchedPositionId) !== employee?.positionId;
                    const isStatusChangingToActive =
                      !isEmployeeActive && watchedStatus === 1;

                    const showCapacityError =
                      isFull && (isPositionChanged || isStatusChangingToActive);

                    return (
                      <>
                        <FormSelect
                          name="positionId"
                          label="Position"
                          options={
                            positions?.map((p) => ({
                              label: `${p.positionName} (${p.currentEmployeeCount}/${p.targetEmployeeCount})`,
                              value: String(p.id),
                              disabled:
                                p.isFull && p.id !== employee?.positionId,
                            })) ?? []
                          }
                        />
                        {showCapacityError && (
                          <Typography
                            variant="caption"
                            color="error"
                            sx={{ mt: 1, display: "block" }}
                          >
                            Position capacity reached. Please select another
                            position or status.
                          </Typography>
                        )}
                      </>
                    );
                  })()}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Department (derived from position)"
                    disabled
                    fullWidth
                    size="small"
                    value={
                      positions?.find((p) => p.id === Number(watchedPositionId))
                        ?.departmentName ?? ""
                    }
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormInput name="salary" label="Salary" type="number" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormSelect
                    name="status"
                    label="Status"
                    options={[
                      { label: "Active", value: "1" },
                      { label: "Inactive", value: "2" },
                      { label: "Terminated", value: "3" },
                    ]}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={updateMutation.isPending || !!rolePositionMismatch}
              sx={{
                background: rolePositionMismatch
                  ? undefined
                  : "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                "&:hover": {
                  background: rolePositionMismatch
                    ? undefined
                    : "linear-gradient(135deg, #2563eb, #1e40af)",
                },
              }}
            >
              {updateMutation.isPending && (
                <CircularProgress size={18} sx={{ mr: 1, color: "inherit" }} />
              )}
              Save Changes
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
