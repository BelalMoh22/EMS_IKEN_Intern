/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, useNavigate } from "react-router-dom";
import { useEmployees, useDeleteEmployee } from "@/hooks/useEmployees";
import { useAuthStore } from "@/stores/auth";
import { usePositions } from "@/hooks/usePositions";
import { useDepartments } from "@/hooks/useDepartments";
import { DetailsPageLayout } from "@/components/shared/DetailsPageLayout";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ActionButtons } from "@/components/shared/ActionButtons";
import {
  Box,
  Typography,
  Grid,
  Chip,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import { useState } from "react";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import HomeIcon from "@mui/icons-material/Home";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import { useSnackbar } from "notistack";
import { getGeneralErrors } from "@/utils/handleApiErrors";

export default function EmployeeDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const employeeId = Number(id);

  const canEdit = user?.role === "HR";
  const canDelete = user?.role === "HR";

  const { data: employees, isLoading: loadingEmployees } = useEmployees();
  const { data: positions, isLoading: loadingPositions } = usePositions();
  const { data: departments, isLoading: loadingDepartments } = useDepartments();
  const deleteMutation = useDeleteEmployee();
  const { enqueueSnackbar } = useSnackbar();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const employee = employees?.find((e) => e.id === employeeId);
  const position = positions?.find((p) => p.id === employee?.positionId);
  const department = departments?.find((d) => d.id === position?.departmentId);

  const isLoading = loadingEmployees || loadingPositions || loadingDepartments;

  if (isLoading) {
    return (
      <DetailsPageLayout
        title="Loading..."
        basePath="/employees"
        basePathName="Employees"
      >
        <Typography>Loading employee details...</Typography>
      </DetailsPageLayout>
    );
  }

  if (!employee) {
    return (
      <DetailsPageLayout
        title="Not Found"
        basePath="/employees"
        basePathName="Employees"
      >
        <Typography color="error">Employee not found.</Typography>
      </DetailsPageLayout>
    );
  }

  const handleDelete = () => {
    deleteMutation.mutate(employeeId, {
      onSuccess: () => {
        navigate("/employees");
      },
      onError: (error) => {
        const errors = getGeneralErrors(error);
        if (errors.length > 0) {
          errors.forEach((msg) => enqueueSnackbar(msg, { variant: "error" }));
        } else {
          const data = (error as any)?.response?.data;
          enqueueSnackbar(data?.message || "Failed to delete employee", {
            variant: "error",
          });
        }
      },
    });
  };

  const statusColor = (status: string | null) => {
    switch (status) {
      case "Active":
        return "success";
      case "Inactive":
        return "default";
      case "Suspended":
        return "warning";
      case "Terminated":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <DetailsPageLayout
      title="Employee Details"
      basePath="/employees"
      basePathName="Employees"
      actions={
        <ActionButtons
          basePath="/employees"
          id={employeeId}
          canEdit={canEdit}
          canDelete={canDelete}
          onDelete={() => setDeleteDialogOpen(true)}
        />
      }
    >
      <Card elevation={0} sx={{ backgroundColor: "transparent" }}>
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              mb: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography variant="h4" fontWeight="bold">
                {employee.firstName} {employee.lastname}
              </Typography>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}
              >
                <BusinessCenterIcon fontSize="small" />
                {position?.positionName ?? "Unknown Position"} •{" "}
                {department?.departmentName ?? "Unknown Department"}
              </Typography>
            </Box>
            <Chip
              label={employee.status ?? "Active"}
              color={statusColor(employee.status)}
              size="medium"
              sx={{ fontWeight: "bold", fontSize: "1rem", px: 1 }}
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 4,
            }}
          >
            <Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      mb: 0.5,
                    }}
                  >
                    <EmailIcon fontSize="small" /> Email Address
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {employee.email}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      mb: 0.5,
                    }}
                  >
                    <PhoneIcon fontSize="small" /> Phone Number
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {employee.phoneNumber || "N/A"}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      mb: 0.5,
                    }}
                  >
                    <HomeIcon fontSize="small" /> Address
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {employee.address || "N/A"}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      mb: 0.5,
                    }}
                  >
                    <MonetizationOnIcon fontSize="small" /> Salary
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    ${employee.salary?.toLocaleString() ?? "N/A"}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      mb: 0.5,
                    }}
                  >
                    <CalendarMonthIcon fontSize="small" /> Hire Date
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {employee.hireDate
                      ? new Date(employee.hireDate).toLocaleDateString()
                      : "N/A"}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      mb: 0.5,
                    }}
                  >
                    <CalendarMonthIcon fontSize="small" /> Date of Birth
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {employee.dateOfBirth
                      ? new Date(employee.dateOfBirth).toLocaleDateString()
                      : "N/A"}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Employee"
        description={`Are you sure you want to delete ${employee.firstName} ${employee.lastname}? This action cannot be undone.`}
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </DetailsPageLayout>
  );
}
