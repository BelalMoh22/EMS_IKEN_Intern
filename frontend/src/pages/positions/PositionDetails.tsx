import { useParams, useNavigate } from "react-router-dom";
import { usePositions, useDeletePosition } from "@/hooks/usePositions";
import { useDepartments } from "@/hooks/useDepartments";
import { DetailsPageLayout } from "@/components/shared/DetailsPageLayout";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ActionButtons } from "@/components/shared/ActionButtons";
import { Box, Typography, Grid, Card, CardContent, Divider } from "@mui/material";
import { useState } from "react";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

export default function PositionDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const positionId = Number(id);

  const { data: positions, isLoading: loadingPositions } = usePositions();
  const { data: departments, isLoading: loadingDepartments } = useDepartments();
  const deleteMutation = useDeletePosition();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const position = positions?.find((p) => p.id === positionId);
  const department = departments?.find((d) => d.id === position?.departmentId);

  const isLoading = loadingPositions || loadingDepartments;

  if (isLoading) {
    return (
      <DetailsPageLayout title="Loading..." basePath="/positions" basePathName="Positions">
        <Typography>Loading position details...</Typography>
      </DetailsPageLayout>
    );
  }

  if (!position) {
    return (
      <DetailsPageLayout title="Not Found" basePath="/positions" basePathName="Positions">
        <Typography color="error">Position not found.</Typography>
      </DetailsPageLayout>
    );
  }

  const handleDelete = () => {
    deleteMutation.mutate(positionId, {
      onSuccess: () => navigate("/positions"),
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
        />
      }
    >
      <Card elevation={0} sx={{ backgroundColor: "transparent" }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="bold">
              {position.positionName}
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 4 }}>
            <Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
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
                  <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                    <AttachMoneyIcon fontSize="small" /> Salary Range
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    ${position.minSalary?.toLocaleString()} – ${position.maxSalary?.toLocaleString()}
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
        title="Delete Position"
        description={`Are you sure you want to delete ${position.positionName}? This action cannot be undone.`}
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </DetailsPageLayout>
  );
}
