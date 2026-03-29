import { useParams, useNavigate } from "react-router-dom";
import { useDepartments, useDeleteDepartment } from "@/hooks/useDepartments";
import { DetailsPageLayout } from "@/components/shared/DetailsPageLayout";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ActionButtons } from "@/components/shared/ActionButtons";
import { Box, Typography, Grid, Chip, Card, CardContent, Divider } from "@mui/material";
import { useState } from "react";
import EmailIcon from "@mui/icons-material/Email";
import DescriptionIcon from "@mui/icons-material/Description";

export default function DepartmentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const departmentId = Number(id);

  const { data: departments, isLoading } = useDepartments();
  const deleteMutation = useDeleteDepartment();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const department = departments?.find((d) => d.id === departmentId);

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
      onSuccess: () => navigate("/departments"),
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
        />
      }
    >
      <Card elevation={0} sx={{ backgroundColor: "transparent" }}>
        <CardContent sx={{ p: 0 }}>
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
                    <EmailIcon fontSize="small" /> Email Address
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {department.email || "N/A"}
                  </Typography>
                </Box>
              </Box>
            </Box>

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
          </Box>
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
