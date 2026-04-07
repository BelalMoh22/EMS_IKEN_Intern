import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RestoreIcon from "@mui/icons-material/Restore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AssignmentIcon from "@mui/icons-material/Assignment";
import EventNoteIcon from "@mui/icons-material/EventNote";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import { useProject, useDeleteProject, useReopenProject, useCloseProject } from "@/hooks/useProjects";
import { STATUS_META, formatDate } from "./utils";
import { useState } from "react";
import { ProjectFormDialog } from "./ProjectFormDialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const projectId = Number(id);

  const { data: project, isLoading, error } = useProject(projectId);
  const deleteMutation = useDeleteProject();
  const reopenMutation = useReopenProject();
  const closeMutation = useCloseProject();

  const [formOpen, setFormOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !project) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h5" color="error">
          Project not found or error loading details.
        </Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/projects")} sx={{ mt: 2 }}>
          Back to Projects
        </Button>
      </Container>
    );
  }

  const meta = STATUS_META[project.status];

  const handleDelete = () => {
    deleteMutation.mutate(project.id, {
      onSuccess: () => navigate("/projects"),
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton onClick={() => navigate("/projects")} sx={{ bgcolor: "background.paper", boxShadow: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h1">{project.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage details and tracking for this project
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Left Side: Information */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            sx={{
              p: 4,
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack spacing={4}>
              <Box>
                <Typography variant="h6" gutterBottom fontWeight={700} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AssignmentIcon color="primary" /> Description
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  {project.description || "No description provided."}
                </Typography>
              </Box>

              <Divider />

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "rgba(59,130,246,0.08)", color: "primary.main" }}>
                      <EventNoteIcon />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">Created At</Typography>
                      <Typography variant="body2" fontWeight={600}>{formatDate(project.createdAt)}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: meta.bgAlpha || "rgba(0,0,0,0.05)", color: theme.palette[meta.color]?.main ?? theme.palette.text.primary }}>
                      <CheckCircleIcon />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">Current Status</Typography>
                      <Chip label={meta.label} color={meta.color} size="small" sx={{ fontWeight: 600, mt: 0.5 }} />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Stack>
          </Paper>
        </Grid>

        {/* Right Side: Actions & Stats */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            {/* Quick Actions */}
            <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
              <Typography variant="subtitle2" fontWeight={700} mb={2}>Quick Actions</Typography>
              <Stack spacing={1.5}>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  fullWidth
                  onClick={() => setFormOpen(true)}
                  sx={{
                    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                    boxShadow: "0 4px 12px rgba(59,130,246,0.2)",
                  }}
                >
                  Edit Project
                </Button>

                {project.status === "Open" ? (
                  <Button
                    variant="outlined"
                    color="info"
                    startIcon={<CheckCircleIcon />}
                    fullWidth
                    disabled={closeMutation.isPending}
                    onClick={() => closeMutation.mutate(project.id)}
                  >
                    Close Project
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    color="success"
                    startIcon={<RestoreIcon />}
                    fullWidth
                    disabled={reopenMutation.isPending}
                    onClick={() => reopenMutation.mutate(project.id)}
                  >
                    Reopen Project
                  </Button>
                )}

                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  fullWidth
                  onClick={() => setDeleteConfirmOpen(true)}
                >
                  Delete Project
                </Button>
              </Stack>
            </Paper>

            {/* Placeholder for future stats/team members */}
            <Paper sx={{ p: 3, borderRadius: 3, bgcolor: "rgba(59,130,246,0.02)", border: "1px dashed", borderColor: "primary.light" }}>
                <Typography variant="subtitle2" color="primary" fontWeight={700} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AccessTimeIcon fontSize="small"/> Project Metrics
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Detailed work log analysis and team performance metrics will appear here in the next update.
                </Typography>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      <ProjectFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        editTarget={project}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Project"
        description={`Are you sure you want to delete "${project.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </Container>
  );
}
