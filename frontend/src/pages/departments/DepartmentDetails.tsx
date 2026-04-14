/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, useNavigate } from "react-router-dom";
import { useDepartments, useDeleteDepartment } from "@/hooks/useDepartments";
import { useEmployees } from "@/hooks/useEmployees";
import { usePositions } from "@/hooks/usePositions";
import { DetailsPageLayout } from "@/components/shared/DetailsPageLayout";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ActionButtons } from "@/components/shared/ActionButtons";
import { DataTable } from "@/components/shared/DataTable";
import { Box, Typography, Grid, Chip, Card, CardContent, Divider } from "@mui/material";
import { useState, useMemo } from "react";
import EmailIcon from "@mui/icons-material/Email";
import DescriptionIcon from "@mui/icons-material/Description";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import PeopleIcon from "@mui/icons-material/People";
import { useSnackbar } from "notistack";
import { extractErrorMessage } from "@/utils/handleApiErrors";

export default function DepartmentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const departmentId = Number(id);

  const { data: departments, isLoading: loadingDepartments } = useDepartments();
  const { data: employees, isLoading: loadingEmployees } = useEmployees();
  const { data: positions, isLoading: loadingPositions } = usePositions();
  const deleteMutation = useDeleteDepartment();
  const { enqueueSnackbar } = useSnackbar();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const department = departments?.find((d) => d.id === departmentId);

  const deptPositions = useMemo(() => 
    positions?.filter(p => p.departmentId === departmentId) || [], 
    [positions, departmentId]
  );

  const managers = useMemo(() => {
    const managerPositionIds = deptPositions.filter(p => p.isManager).map(p => p.id);
    return employees?.filter(e => managerPositionIds.includes(e.positionId) && e.status === "Active") || [];
  }, [employees, deptPositions]);

  const deptEmployees = useMemo(() => {
    const positionIds = deptPositions.map(p => p.id);
    return employees?.filter(e => positionIds.includes(e.positionId)) || [];
  }, [employees, deptPositions]);

  const isLoading = loadingDepartments || loadingEmployees || loadingPositions;

  if (isLoading) {
    return (
      <DetailsPageLayout title="Loading..." basePath="/departments" basePathName="Departments">
        <Typography>Loading department details...</Typography>
      </DetailsPageLayout>
    );
  }

  if (!department) {
    return (
      <DetailsPageLayout title="Not Found" basePath="/departments" basePathName="Departments">
        <Typography color="error">Department not found.</Typography>
      </DetailsPageLayout>
    );
  }

  const handleDelete = () => {
    deleteMutation.mutate(departmentId, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        enqueueSnackbar("Department deleted successfully", { variant: "success" });
        navigate("/departments");
      },
      onError: (error) => {
        enqueueSnackbar(extractErrorMessage(error, "Failed to delete department"), { variant: "error" });
      },
    });
  };

  return (
    <DetailsPageLayout
      title="Department Details"
      basePath="/departments"
      basePathName="Departments"
      actions={
        <ActionButtons
          basePath="/departments"
          id={departmentId}
          canEdit={true}
          canDelete={true}
          onDelete={() => setDeleteDialogOpen(true)}
          hideView={true}
        />
      }
    >
      <Card elevation={0} sx={{ backgroundColor: "transparent" }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ mb: 4, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                {department.departmentName}
              </Typography>
            </Box>
            <Chip
              label={department.isActive !== false ? "Active" : "Inactive"}
              color={department.isActive !== false ? "success" : "default"}
              size="medium"
              sx={{ fontWeight: "bold", fontSize: "1rem", px: 1 }}
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 4 }}>
            <Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                    <DescriptionIcon fontSize="small" /> Description
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {department.description || "N/A"}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                    Managers
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {managers.length > 0 ? (
                      managers.map(m => (
                        <Chip 
                          key={m.id}
                          label={`${m.firstName} ${m.lastname}`}
                          size="small"
                          color="primary"
                          variant="outlined"
                          onClick={() => navigate(`/employees/${m.id}`)}
                        />
                      ))
                    ) : (
                      <Typography variant="body1" fontWeight={500}>None</Typography>
                    )}
                  </Box>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                    Statistics
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Chip 
                      icon={<BusinessCenterIcon fontSize="small" />} 
                      label={`${deptPositions.length} Positions`} 
                      variant="outlined" 
                      size="small" 
                    />
                    <Chip 
                      icon={<PeopleIcon fontSize="small" />} 
                      label={`${deptEmployees.length} Employees`} 
                      variant="outlined" 
                      size="small" 
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Grid container spacing={4}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                <BusinessCenterIcon /> Positions
              </Typography>
               <DataTable<any>
                columns={[
                  {
                    header: "Position",
                    cell: (row) => row.positionName,
                  },
                  {
                    header: "Capacity",
                    cell: (row) => `${row.currentEmployeeCount} / ${row.targetEmployeeCount}`,
                  },
                  {
                    header: "Status",
                    cell: (row) => (
                      <Chip
                        label={row.currentEmployeeCount >= row.targetEmployeeCount ? "Full" : "Available"}
                        size="small"
                        color={row.currentEmployeeCount >= row.targetEmployeeCount ? "error" : "success"}
                        variant="outlined"
                      />
                    ),
                  },
                ]}
                data={deptPositions}
                onRowClick={(row) => navigate(`/positions/${row.id}`)}
                loading={isLoading}
              />
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                <PeopleIcon /> Employees
              </Typography>
               <DataTable<any>
                columns={[
                  {
                    header: "Name",
                    cell: (row) => `${row.firstName} ${row.lastname}`,
                  },
                  {
                    header: "Position",
                    cell: (row) => deptPositions?.find(p => p.id === row.positionId)?.positionName || "Unknown",
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
                data={deptEmployees}
                onRowClick={(row) => navigate(`/employees/${row.id}`)}
                loading={isLoading}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Department"
        description={`Are you sure you want to delete ${department.departmentName}? This action cannot be undone.`}
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </DetailsPageLayout>
  );
}
