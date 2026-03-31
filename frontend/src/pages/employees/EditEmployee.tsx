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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useEffect } from "react";
import { STATUS_ENUM_MAP, SHIFT_OPTIONS } from "@/types";
import type { EmployeeStatus } from "@/types";
import { handleApiErrors } from "@/utils/handleApiErrors";
import { useSnackbar } from "notistack";

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
  salary: z.coerce.number().min(0, "Salary must be positive"),
  positionId: z.coerce.number().min(1, "Position is required"),
  status: z.coerce.number().min(1).max(3),
  workStartHour: z.coerce.number().min(7).max(10),
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
      address: "",
      salary: 0,
      positionId: 0,
      status: 1,
      workStartHour: 7,
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
        address: employee.address ?? "",
        salary: employee.salary ?? 0,
        positionId: employee.positionId ?? 0,
        status: STATUS_ENUM_MAP[employee.status as EmployeeStatus] ?? 1,
        workStartHour: employee.workStartHour ?? 9,
      });
    }
  }, [employee, methods]);

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
          address: values.address,
          salary: values.salary,
          positionId: values.positionId,
          status: values.status,
          workStartHour: values.workStartHour,
        },
      },
      {
        onSuccess: () => {
          navigate("/employees");
        },
        onError: (error) => {
          const message = handleApiErrors(error, methods);
          enqueueSnackbar(message, { variant: "error" });
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
            Update employee information
          </Typography>
        </Box>
      </Box>

      <FormProvider {...methods}>
        <Box
          component="form"
          onSubmit={methods.handleSubmit(onSubmit)}
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        >
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
                <Grid size={{ xs: 12 }}>
                  <FormInput name="address" label="Address" />
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
                    const watchedPositionId = Number(
                      methods.watch("positionId"),
                    );
                    const watchedStatus = Number(methods.watch("status"));
                    const isFull = positions?.find(
                      (p) => p.id === watchedPositionId,
                    )?.isFull;
                    const isEmployeeActive = employee?.status === "Active";
                    const isPositionChanged =
                      watchedPositionId !== employee?.positionId;
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
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormSelect
                    name="workStartHour"
                    label="Work Shift Start"
                    options={SHIFT_OPTIONS.map((s) => ({
                      label: s.label,
                      value: String(s.value),
                    }))}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={updateMutation.isPending}
              sx={{
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                "&:hover": {
                  background: "linear-gradient(135deg, #2563eb, #1e40af)",
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
