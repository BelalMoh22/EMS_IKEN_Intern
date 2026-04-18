import { useState, useMemo, useEffect } from "react";
import { Box, Chip, Pagination, Paper, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ArchiveIcon from "@mui/icons-material/Archive";
import { ProjectCard } from "./ProjectCard";
import { STATUS_META } from "../../utils/projectUtils";
import type { Project } from "@/types/project";

export type DashboardColumnType = "Open" | "Logged" | "Completed";

// ─── Constants ────────────────────────────────────────────
const ITEMS_PER_COLUMN = 5;

const COLUMN_ICON: Record<DashboardColumnType, React.ReactNode> = {
  Open: <FolderOpenIcon fontSize="small" />,
  Logged: <PlayArrowIcon fontSize="small" />,
  Completed: <ArchiveIcon fontSize="small" />,
};

// ─── Props ───────────────────────────────────────────────
interface Props {
  status: DashboardColumnType;
  projects: (Project & { totalHours?: number })[];
}

export function KanbanColumn({ status, projects }: Props) {
  const theme = useTheme();
  
  const labelMap: Record<DashboardColumnType, string> = {
    Open: "Open (No Logs)",
    Logged: "Active (Logged)",
    Completed: "Completed",
  };

  const [page, setPage] = useState(1);

  // Reset page when the project list changes (e.g. filters applied)
  useEffect(() => {
    setPage(1);
  }, [projects.length]);

  const totalPages = Math.ceil(projects.length / ITEMS_PER_COLUMN);
  const paginatedProjects = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_COLUMN;
    return projects.slice(start, start + ITEMS_PER_COLUMN);
  }, [projects, page]);

  const headerColors: Record<DashboardColumnType, string> = {
    Open: theme.palette.info?.main ?? theme.palette.primary.main,
    Logged: theme.palette.success?.main ?? theme.palette.primary.main,
    Completed: theme.palette.text.secondary,
  };

  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        minHeight: 480,
        bgcolor: "background.default",
        overflow: "hidden",
      }}
    >
      {/* Column Header */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          gap: 1,
          bgcolor: "background.paper",
        }}
      >
        <Box sx={{ color: headerColors[status], display: "flex" }}>
          {COLUMN_ICON[status]}
        </Box>
        <Typography variant="body2" fontWeight={600}>
          {labelMap[status]}
        </Typography>
        <Chip
          label={projects.length}
          size="small"
          sx={{
            ml: "auto",
            height: 20,
            fontSize: "0.7rem",
            fontWeight: 600,
            bgcolor: `${headerColors[status]}18`,
            color: headerColors[status],
          }}
        />
      </Box>

      {/* Card List */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          p: 1.5,
          "&::-webkit-scrollbar": { width: 4 },
          "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
          "&::-webkit-scrollbar-thumb": { bgcolor: "divider", borderRadius: 2 },
        }}
      >
        {projects.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
            <FolderOpenIcon sx={{ fontSize: 36, opacity: 0.3, mb: 1 }} />
            <Typography variant="caption" display="block">
              No projects
            </Typography>
          </Box>
        ) : (
          paginatedProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
            />
          ))
        )}
      </Box>

      {/* Per-Column Pagination */}
      {totalPages > 1 && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0.5,
            px: 2,
            py: 1.5,
            borderTop: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: "0.7rem" }}
          >
            {(page - 1) * ITEMS_PER_COLUMN + 1}–
            {Math.min(page * ITEMS_PER_COLUMN, projects.length)} of{" "}
            {projects.length}
          </Typography>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            shape="rounded"
            size="small"
          />
        </Box>
      )}
    </Paper>
  );
}
