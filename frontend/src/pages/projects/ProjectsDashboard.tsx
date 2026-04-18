import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ArchiveIcon from "@mui/icons-material/Archive";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useProjects, useDeleteProject, useReopenProject, useCompleteProject } from "@/hooks/useProjects";
import type { Project, ProjectStatus, DashboardColumnType } from "@/types/project";
import { SummaryCard } from "./SummaryCard";
import { KanbanColumn } from "./KanbanColumn";
import { ProjectFormDialog } from "./ProjectFormDialog";
import { ProjectActionsProvider } from "../../contexts/ProjectActionsContext";
import { useProjectsSummary } from "@/hooks/useWorkLogs";
import { useSnackbar } from "notistack";
import { extractErrorMessage } from "@/utils/handleApiErrors";

// ─── Constants ───────────────────────────────────────────
const DASHBOARD_COLUMNS: DashboardColumnType[] = ["Open", "Logged", "Completed"];
type SortOption = "newest" | "oldest" | "name_asc" | "name_desc";

// ─── Page ────────────────────────────────────────────────
export default function ProjectsDashboard() {
  const theme = useTheme();
  const navigate = useNavigate();

  // ── UI state ──
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DashboardColumnType | "All">("All");
  const [monthFilter, setMonthFilter] = useState<number | "All">("All");
  const [yearFilter, setYearFilter] = useState<number | "All">("All");
  const [sort, setSort] = useState<SortOption>("newest");

  // ── Queries ──
  const { data: projects = [], isLoading } = useProjects({
    month: monthFilter === "All" ? undefined : monthFilter,
    year: yearFilter === "All" ? undefined : yearFilter,
    status: statusFilter === "All" || statusFilter === "Logged" ? undefined : statusFilter,
  });

  const { data: projectSummaries = [] } = useProjectsSummary();

  const deleteMutation = useDeleteProject();
  const reopenMutation = useReopenProject();
  const closeMutation = useCompleteProject();
  const { enqueueSnackbar } = useSnackbar();

  // ── Dialog State ──
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [reopenTarget, setReopenTarget] = useState<Project | null>(null);
  const [closeTarget, setCloseTarget] = useState<Project | null>(null);

  // ── Summary counts ──
  const stats = useMemo(() => {
    let openCount = 0;
    let loggedCount = 0;
    let completedCount = 0;
    
    projects.forEach((p) => {
      const summary = projectSummaries.find(s => s.projectId === p.id);
      const hours = summary ? summary.totalHours : 0;
      
      if (p.status === "Completed") {
        completedCount++;
      } else if (hours > 0) {
        loggedCount++;
      } else {
        openCount++;
      }
    });

    return { Open: openCount, Logged: loggedCount, Completed: completedCount };
  }, [projects, projectSummaries]);

  // ── Columns to display based on status filter ──
  const visibleColumns = useMemo(() => {
    if (statusFilter === "All") return DASHBOARD_COLUMNS;
    if (statusFilter === "Logged" || statusFilter === "Open" || statusFilter === "Completed") {
      return [statusFilter] as DashboardColumnType[];
    }
    return DASHBOARD_COLUMNS;
  }, [statusFilter]);

  // ── Filtered + sorted list ──
  const filtered = useMemo(() => {
    let list = [...projects];

    const searchTerm = search.trim().toLowerCase();
    if (searchTerm) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm) ||
          (p.description ?? "").toLowerCase().includes(searchTerm)
      );
    }

    if (statusFilter !== "All") {
      if (statusFilter === "Logged") {
        list = list.filter((p) => {
          const summary = projectSummaries.find((s) => s.projectId === p.id);
          return (summary?.totalHours ?? 0) > 0 && p.status === "Open";
        });
      } else if (statusFilter === "Open") {
        list = list.filter((p) => {
          if (p.status !== "Open") return false;
          const summary = projectSummaries.find((s) => s.projectId === p.id);
          return (summary?.totalHours ?? 0) === 0;
        });
      } else {
        list = list.filter((p) => p.status === "Completed");
      }
    }

    switch (sort) {
      case "newest":
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "name_asc":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name_desc":
        list.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    return list;
  }, [projects, search, statusFilter, sort, projectSummaries]);

  // ── Group by status ──
  const grouped = useMemo(() => {
    // Augment projects with logged hours
    const augmentedFiltered = filtered.map((p) => {
      const summary = projectSummaries.find((s) => s.projectId === p.id);
      return { ...p, totalHours: summary ? summary.totalHours : 0 };
    });

    return DASHBOARD_COLUMNS.reduce<Record<DashboardColumnType, (Project & { totalHours?: number })[]>>(
      (acc, col) => {
        if (col === "Logged") {
          acc[col] = augmentedFiltered.filter((p) => p.status === "Open" && (p.totalHours ?? 0) > 0);
        } else if (col === "Open") {
          acc[col] = augmentedFiltered.filter((p) => p.status === "Open" && (p.totalHours ?? 0) === 0);
        } else if (col === "Completed") {
          acc[col] = augmentedFiltered.filter((p) => p.status === "Completed");
        }
        return acc;
      },
      { Open: [], Logged: [], Completed: [] }
    );
  }, [filtered, projectSummaries]);

  // Reset to page 1 when filters change
  const handleStatusFilterChange = (value: DashboardColumnType | "All") => {
    setStatusFilter(value);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  // ── Handlers ──
  const handleOpenCreate = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (project: Project) => {
    setEditTarget(project);
    setFormOpen(true);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget.id, {
        onSuccess: () => {
          setDeleteTarget(null);
          enqueueSnackbar("Project deleted successfully", { variant: "success" });
        },
        onError: (error) => {
          enqueueSnackbar(extractErrorMessage(error, "Failed to delete project"), { variant: "error" });
        },
      });
    }
  };

  const handleReopen = () => {
    if (reopenTarget) {
      reopenMutation.mutate(reopenTarget.id, {
        onSuccess: () => {
          setReopenTarget(null);
          enqueueSnackbar("Project reopened successfully", { variant: "success" });
        },
        onError: (error) => {
          enqueueSnackbar(extractErrorMessage(error, "Failed to reopen project"), { variant: "error" });
        },
      });
    }
  };

  const handleClose = () => {
    if (closeTarget) {
      closeMutation.mutate(closeTarget.id, {
        onSuccess: () => {
          setCloseTarget(null);
          enqueueSnackbar("Project completed successfully", { variant: "success" });
        },
        onError: (error) => {
          enqueueSnackbar(extractErrorMessage(error, "Failed to complete project"), { variant: "error" });
        },
      });
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* ── Page Header ── */}
      <Box>
        <Typography variant="h1">Projects</Typography>
        <Typography variant="body2" color="text.secondary">
          Manage and track your department's projects
        </Typography>
      </Box>

      {/* ── Summary Cards ── */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SummaryCard
            label="Open (No Logs)"
            count={stats.Open}
            icon={<FolderOpenIcon />}
            bgAlpha="rgba(59,130,246,0.10)"
            iconColor={theme.palette.primary.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SummaryCard
            label="Active (Logged)"
            count={stats.Logged}
            icon={<PlayArrowIcon />}
            bgAlpha="rgba(34,197,94,0.10)"
            iconColor={theme.palette.success?.main ?? theme.palette.info.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SummaryCard
            label="Completed"
            count={stats.Completed}
            icon={<ArchiveIcon />}
            bgAlpha="rgba(100,116,139,0.10)"
            iconColor={theme.palette.text.secondary}
          />
        </Grid>
      </Grid>

      {/* ── Filters & Search ── */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
        <TextField
          id="project-search"
          placeholder="Search projects…"
          size="small"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          sx={{ flexGrow: 1, minWidth: 200, maxWidth: 360 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
              </InputAdornment>
            ),
          }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select
            labelId="status-filter-label"
            id="status-filter"
            label="Status"
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value as DashboardColumnType | "All")}
          >
            <MenuItem value="All">All Statuses</MenuItem>
            <MenuItem value="Open">Open (No Logs)</MenuItem>
            <MenuItem value="Logged">Active (Logged)</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel id="month-filter-label">Month</InputLabel>
          <Select
            labelId="month-filter-label"
            id="month-filter"
            label="Month"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value as number | "All")}
          >
            <MenuItem value="All">All Months</MenuItem>
            {[
              "January", "February", "March", "April", "May", "June",
              "July", "August", "September", "October", "November", "December"
            ].map((m, i) => (
              <MenuItem key={m} value={i + 1}>{m}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel id="year-filter-label">Year</InputLabel>
          <Select
            labelId="year-filter-label"
            id="year-filter"
            label="Year"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value as number | "All")}
          >
            <MenuItem value="All">All Years</MenuItem>
            {[2024, 2025, 2026].map((y) => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="sort-label">Sort By</InputLabel>
          <Select
            labelId="sort-label"
            id="sort-select"
            label="Sort By"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
          >
            <MenuItem value="newest">Newest First</MenuItem>
            <MenuItem value="oldest">Oldest First</MenuItem>
            <MenuItem value="name_asc">Name A → Z</MenuItem>
            <MenuItem value="name_desc">Name Z → A</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* ── Kanban Board ── */}
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <ProjectActionsProvider
          value={{
            onEdit: handleOpenEdit,
            onDelete: (p) => setDeleteTarget(p),
            onReopen: (p) => setReopenTarget(p),
            onComplete: (p) => setCloseTarget(p),
            onCardClick: (p) => navigate(`/worklogs/projects/${p.id}/employees`),
          }}
        >
          <Grid container spacing={2}>
            {visibleColumns.map((status) => (
              <Grid key={status} size={{ xs: 12, md: visibleColumns.length === 1 ? 12 : 4 }}>
                <KanbanColumn
                  status={status}
                  projects={grouped[status]}
                />
              </Grid>
            ))}
          </Grid>
        </ProjectActionsProvider>
      )}

      {/* ── FAB ── */}
      <Fab
        id="create-project-fab"
        color="primary"
        aria-label="Create project"
        onClick={handleOpenCreate}
        sx={{
          position: "fixed",
          bottom: 32,
          right: 32,
          background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
          boxShadow: "0 8px 24px rgba(59,130,246,0.35)",
          "&:hover": { background: "linear-gradient(135deg, #2563eb, #1e40af)" },
        }}
      >
        <AddIcon />
      </Fab>

      {/* ── Create / Edit Dialog ── */}
      <ProjectFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        editTarget={editTarget}
      />

      {/* ── Delete Confirm ── */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Project"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />

      {/* ── Reopen Confirm ── */}
      <Dialog open={reopenTarget !== null} onClose={() => setReopenTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Reopen Project</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to reopen "{reopenTarget?.name}"? It will be set back to Open.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReopenTarget(null)} disabled={reopenMutation.isPending}>Cancel</Button>
          <Button onClick={handleReopen} variant="contained" color="success" disabled={reopenMutation.isPending}>
            {reopenMutation.isPending ? <CircularProgress size={18} color="inherit" /> : "Reopen"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Complete Confirm ── */}
      <Dialog open={closeTarget !== null} onClose={() => setCloseTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Complete Project</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to complete "{closeTarget?.name}"? It will be moved to the Completed column.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCloseTarget(null)} disabled={closeMutation.isPending}>Cancel</Button>
          <Button onClick={handleClose} variant="contained" color="info" disabled={closeMutation.isPending}>
            {closeMutation.isPending ? <CircularProgress size={18} color="inherit" /> : "Complete Project"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
