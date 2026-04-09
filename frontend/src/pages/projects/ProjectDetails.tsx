import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  List,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
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
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";

import { format } from "date-fns";
import { useProject, useDeleteProject, useReopenProject, useCloseProject } from "@/hooks/useProjects";
import { useProjectEmployees, useEmployeeReport } from "@/hooks/useWorkLogs";
import { STATUS_META, formatDate } from "./utils/projectUtils";
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
  const [reportEmployee, setReportEmployee] = useState<{ id: number; name: string } | null>(null);

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

            {/* Team Contributions */}
            <TeamContributions
              projectId={projectId}
              onViewEmployee={(empId, empName) => setReportEmployee({ id: empId, name: empName })}
            />
          </Stack>
        </Grid>
      </Grid>

      {/* Employee Report Dialog */}
      {reportEmployee && (
        <EmployeeReportDialog
          projectId={projectId}
          employeeId={reportEmployee.id}
          employeeName={reportEmployee.name}
          onClose={() => setReportEmployee(null)}
        />
      )}

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

// ─── Team Contributions Panel ──────────────────────────────

function TeamContributions({
  projectId,
  onViewEmployee,
}: {
  projectId: number;
  onViewEmployee: (empId: number, empName: string) => void;
}) {
  const { data, isLoading } = useProjectEmployees(projectId);

  const maxHours = data?.reduce((max, e) => Math.max(max, e.totalHours), 0) || 1;

  return (
    <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
      <Typography
        variant="subtitle2"
        fontWeight={700}
        mb={2}
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        <PeopleIcon fontSize="small" color="primary" /> Team Contributions
      </Typography>

      {isLoading ? (
        <Stack spacing={1.5}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={52} sx={{ borderRadius: 1 }} />
          ))}
        </Stack>
      ) : !data || data.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 3 }}>
          <AccessTimeIcon sx={{ fontSize: 36, color: "text.disabled" }} />
          <Typography variant="body2" color="text.secondary" mt={1}>
            No work logs recorded yet
          </Typography>
        </Box>
      ) : (
        <List disablePadding>
          {data.map((emp) => (
            <ListItemButton
              key={emp.employeeId}
              onClick={() => onViewEmployee(emp.employeeId, emp.employeeName)}
              sx={{ borderRadius: 1.5, mb: 0.5, px: 1.5 }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    width: 34,
                    height: 34,
                    bgcolor: "primary.main",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                  }}
                >
                  {emp.employeeName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="body2" fontWeight={500}>
                    {emp.employeeName}
                  </Typography>
                }
                secondary={
                  <Box sx={{ mt: 0.5 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {emp.totalHours}h logged
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((emp.totalHours / maxHours) * 100, 100)}
                      sx={{
                        height: 5,
                        borderRadius: 3,
                        bgcolor: "rgba(59,130,246,0.08)",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 3,
                          background: "linear-gradient(90deg, #3b82f6, #1d4ed8)",
                        },
                      }}
                    />
                  </Box>
                }
              />
            </ListItemButton>
          ))}
        </List>
      )}
    </Paper>
  );
}

// ─── Employee Report Dialog ────────────────────────────────

function EmployeeReportDialog({
  projectId,
  employeeId,
  employeeName,
  onClose,
}: {
  projectId: number;
  employeeId: number;
  employeeName: string;
  onClose: () => void;
}) {
  const { data, isLoading } = useEmployeeReport(projectId, employeeId);

  const sortedData = [...(data ?? [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const totalHours = sortedData.reduce((sum, d) => sum + d.hours, 0);
  const avgHours = sortedData.length ? (totalHours / sortedData.length).toFixed(1) : "0";

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            sx={{
              bgcolor: "primary.main",
              width: 36,
              height: 36,
              fontSize: "0.8rem",
              fontWeight: 600,
            }}
          >
            {employeeName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h2" component="span">
              {employeeName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Daily work log report
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
          <Stack spacing={1}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={40} />
            ))}
          </Stack>
        ) : sortedData.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography color="text.secondary">No logs found</Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {/* Summary */}
            <Stack direction="row" spacing={2}>
              <Paper
                variant="outlined"
                sx={{ flex: 1, p: 1.5, textAlign: "center", borderRadius: 2 }}
              >
                <Typography variant="caption" color="text.secondary">
                  Total
                </Typography>
                <Typography variant="h4" sx={{ color: "#2563eb" }}>
                  {totalHours}h
                </Typography>
              </Paper>
              <Paper
                variant="outlined"
                sx={{ flex: 1, p: 1.5, textAlign: "center", borderRadius: 2 }}
              >
                <Typography variant="caption" color="text.secondary">
                  Days
                </Typography>
                <Typography variant="h4" sx={{ color: "#16a34a" }}>
                  {sortedData.length}
                </Typography>
              </Paper>
              <Paper
                variant="outlined"
                sx={{ flex: 1, p: 1.5, textAlign: "center", borderRadius: 2 }}
              >
                <Typography variant="caption" color="text.secondary">
                  Avg/Day
                </Typography>
                <Typography variant="h4" sx={{ color: "#d97706" }}>
                  {avgHours}h
                </Typography>
              </Paper>
            </Stack>

            {/* Table */}
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Hours</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedData.map((row, i) => (
                    <TableRow key={i} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {format(new Date(row.date), "EEE, dd MMM yyyy")}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${row.hours}h`}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            bgcolor: "rgba(34,197,94,0.12)",
                            color: "#16a34a",
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
