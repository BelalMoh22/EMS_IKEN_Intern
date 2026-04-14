import { useParams, useNavigate } from "react-router-dom";
import { usePositions, useDeletePosition } from "@/hooks/usePositions";
import { useDepartment } from "@/hooks/useDepartments";
import { useEmployees } from "@/hooks/useEmployees";
import { DetailsPageLayout } from "@/components/shared/DetailsPageLayout";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ActionButtons } from "@/components/shared/ActionButtons";
import { DataTable, type Column } from "@/components/shared/DataTable";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  LinearProgress,
  Chip,
} from "@mui/material";
import { useState } from "react";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PeopleIcon from "@mui/icons-material/People";
import { useSnackbar } from "notistack";
import { getGeneralErrors } from "@/utils/handleApiErrors";
import type { Employee } from "@/types";

export default function PositionDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const positionId = Number(id);

  const { data: positions, isLoading: loadingPositions } = usePositions();
  const { data: employees, isLoading: loadingEmployees } = useEmployees();
  const deleteMutation = useDeletePosition();
  const { enqueueSnackbar } = useSnackbar();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const position = positions?.find((p) => p.id === positionId);
  const { data: department, isLoading: loadingDepartment } = useDepartment(position?.departmentId || 0);
  const positionEmployees = employees?.filter((e: Employee) => e.positionId === positionId) || [];

  const isLoading = loadingPositions || loadingDepartment || loadingEmployees;

  if (isLoading) {
    return (
      <DetailsPageLayout
        title="Loading..."
        basePath="/positions"
        basePathName="Positions"
      >
        <Typography>Loading position details...</Typography>
      </DetailsPageLayout>
    );
  }

  if (!position) {
    return (
      <DetailsPageLayout
        title="Not Found"
        basePath="/positions"
        basePathName="Positions"
      >
        <Typography color="error">Position not found.</Typography>
      </DetailsPageLayout>
    );
  }

  const handleDelete = () => {
    deleteMutation.mutate(positionId, {
      onSuccess: () => {
        navigate("/positions");
      },
      onError: (error) => {
        const errors = getGeneralErrors(error);
        if (errors.length > 0) {
          errors.forEach((msg) => enqueueSnackbar(msg, { variant: "error" }));
        } else {
          const data = (error as any)?.response?.data;
          enqueueSnackbar(data?.message || "Failed to delete position", {
            variant: "error",
          });
        }
      },
    });
  };

  return (
    <DetailsPageLayout
      title="Position Details"
      basePath="/positions"
      basePathName="Positions"
      actions={
        <ActionButtons
          basePath="/positions"
          id={positionId}
          canEdit={true}
          canDelete={true}
          onDelete={() => setDeleteDialogOpen(true)}
          hideView={true}
        />
      }
    >
      <Card elevation={0} sx={{ backgroundColor: "transparent" }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="bold">
              {position.positionName}
            </Typography>
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
                    <BusinessCenterIcon fontSize="small" /> Department
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {department?.departmentName ?? "Unknown Department"}
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
                    <AttachMoneyIcon fontSize="small" /> Salary Range
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    ${position.minSalary?.toLocaleString()} – $
                    {position.maxSalary?.toLocaleString()}
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
                    Management Status
                  </Typography>
                  <Chip
                    label={position.isManager ? "Manager Role" : "Regular Role"}
                    color={position.isManager ? "primary" : "default"}
                    variant={position.isManager ? "filled" : "outlined"}
                    size="small"
                  />
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
                      mb: 1,
                    }}
                  >
                    <PeopleIcon fontSize="small" /> Capacity
                  </Typography>
                  <Box sx={{ maxWidth: 300 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        {position.currentEmployeeCount} / {position.targetEmployeeCount} Employees
                      </Typography>
                      {position.isFull && (
                        <Chip label="FULL" color="error" size="small" sx={{ fontWeight: "bold" }} />
                      )}
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((position.currentEmployeeCount / (position.targetEmployeeCount || 1)) * 100, 100)}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: "rgba(0,0,0,0.05)",
                        "& .MuiLinearProgress-bar": {
                          bgcolor: position.isFull ? "#ef5350" : "#3b82f6",
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
              <PeopleIcon /> Employees in this Position
            </Typography>
            <DataTable
              columns={[
                {
                  header: "Name",
                  cell: (row) => `${row.firstName} ${row.lastname}`,
                },
                {
                  header: "Email",
                  cell: (row) => row.email,
                },
                {
                  header: "Status",
                  cell: (row) => (
                    <Chip
                      label={row.status}
                      size="small"
                      color={row.status === "Active" ? "success" : "default"}
                      variant="outlined"
                    />
                  ),
                },
              ]}
              data={positionEmployees}
              onRowClick={(row) => navigate(`/employees/${row.id}`)}
              loading={isLoading}
            />
          </Box>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Position"
        description={`Are you sure you want to delete ${position.positionName}? This will also delete all employees assigned to this position. This action cannot be undone.`}
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </DetailsPageLayout>
  );
}
