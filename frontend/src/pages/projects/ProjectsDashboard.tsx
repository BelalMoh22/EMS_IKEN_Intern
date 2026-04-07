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
  Pagination,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ArchiveIcon from "@mui/icons-material/Archive";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useProjects, useDeleteProject, useReopenProject, useCloseProject } from "@/hooks/useProjects";
import type { Project, ProjectStatus } from "@/types/project";
import { SummaryCard } from "./SummaryCard";
import { KanbanColumn } from "./KanbanColumn";
import { ProjectFormDialog } from "./ProjectFormDialog";
import { STATUS_META } from "./utils";

// ─── Constants ───────────────────────────────────────────
const ALL_COLUMNS: ProjectStatus[] = ["Open", "Closed"];
type SortOption = "newest" | "oldest" | "name_asc" | "name_desc";
const ITEMS_PER_PAGE = 6;

// ─── Page ────────────────────────────────────────────────
export default function ProjectsDashboard() {
  const theme = useTheme();
  const navigate = useNavigate();

  // ── UI state ──
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "All">("All");
  const [monthFilter, setMonthFilter] = useState<number | "All">("All");
  const [yearFilter, setYearFilter] = useState<number | "All">("All");
  const [sort, setSort] = useState<SortOption>("newest");
  const [page, setPage] = useState(1);

  // ── Queries ──
  const { data: projects = [], isLoading } = useProjects({
    month: monthFilter === "All" ? undefined : monthFilter,
    year: yearFilter === "All" ? undefined : yearFilter,
    status: statusFilter,
  });

  const deleteMutation = useDeleteProject();
  const reopenMutation = useReopenProject();
  const closeMutation = useCloseProject();

  // ── Dialog State ──
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [reopenTarget, setReopenTarget] = useState<Project | null>(null);
  const [closeTarget, setCloseTarget] = useState<Project | null>(null);

  // ── Summary counts ──
  const totalCount = projects.length;
  const stats = useMemo(() => ({
    Open: projects.filter((p) => p.status === "Open").length,
    Closed: projects.filter((p) => p.status === "Closed").length,
  }), [projects]);

  // ── Columns to display based on status filter ──
  const visibleColumns = useMemo(() => {
    if (statusFilter === "All") return ALL_COLUMNS;
    return [statusFilter];
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
      list = list.filter((p) => p.status === statusFilter);
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
  }, [projects, search, statusFilter, sort]);

  // ── Pagination ──
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedList = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, page]);

  // ── Group by status (paginated) ──
  const grouped = useMemo(
    () =>
      ALL_COLUMNS.reduce<Record<ProjectStatus, Project[]>>(
        (acc, status) => {
          acc[status] = paginatedList.filter((p) => p.status === status);
          return acc;
        },
        { Open: [], Closed: [] }
      ),
    [paginatedList]
  );

  // Reset to page 1 when filters change
  const handleStatusFilterChange = (value: ProjectStatus | "All") => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
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
        onSuccess: () => setDeleteTarget(null),
      });
    }
  };

  const handleReopen = () => {
    if (reopenTarget) {
      reopenMutation.mutate(reopenTarget.id, {
        onSuccess: () => setReopenTarget(null),
      });
    }
  };

  const handleClose = () => {
    if (closeTarget) {
      closeMutation.mutate(closeTarget.id, {
        onSuccess: () => setCloseTarget(null),
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
            label="Total Projects"
            count={totalCount}
            icon={<AssignmentIcon />}
            bgAlpha="rgba(59,130,246,0.10)"
            iconColor={theme.palette.primary.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SummaryCard
            label="Open"
            count={stats.Open}
            icon={<PlayArrowIcon />}
            bgAlpha="rgba(59,130,246,0.08)"
            iconColor={theme.palette.info?.main ?? theme.palette.primary.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SummaryCard
            label="Closed"
            count={stats.Closed}
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
            onChange={(e) => handleStatusFilterChange(e.target.value as ProjectStatus | "All")}
          >
            <MenuItem value="All">All Statuses</MenuItem>
            {ALL_COLUMNS.map((s) => (
              <MenuItem key={s} value={s}>
                {STATUS_META[s].label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel id="month-filter-label">Month</InputLabel>
          <Select
            labelId="month-filter-label"
            id="month-filter"
            label="Month"
            value={monthFilter}
            onChange={(e) => { setMonthFilter(e.target.value as number | "All"); setPage(1); }}
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
            onChange={(e) => { setYearFilter(e.target.value as number | "All"); setPage(1); }}
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
        <Grid container spacing={2}>
          {visibleColumns.map((status) => (
            <Grid key={status} size={{ xs: 12, md: visibleColumns.length === 1 ? 12 : 6 }}>
              <KanbanColumn
                status={status}
                projects={grouped[status]}
                onEdit={handleOpenEdit}
                onDelete={(p) => setDeleteTarget(p)}
                onReopen={(p) => setReopenTarget(p)}
                onClose={(p) => setCloseTarget(p)}
                onCardClick={(p) => navigate(`/projects/${p.id}`)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2, pt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Showing {((page - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
          </Typography>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            shape="rounded"
            size="medium"
          />
        </Box>
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

      {/* ── Close Confirm ── */}
      <Dialog open={closeTarget !== null} onClose={() => setCloseTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Close Project</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to close "{closeTarget?.name}"? It will be moved to the Closed column.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCloseTarget(null)} disabled={closeMutation.isPending}>Cancel</Button>
          <Button onClick={handleClose} variant="contained" color="info" disabled={closeMutation.isPending}>
            {closeMutation.isPending ? <CircularProgress size={18} color="inherit" /> : "Close Project"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
