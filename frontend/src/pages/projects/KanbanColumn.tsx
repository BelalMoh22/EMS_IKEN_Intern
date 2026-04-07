import { Box, Chip, Paper, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArchiveIcon from "@mui/icons-material/Archive";
import { ProjectCard } from "./ProjectCard";
import { STATUS_META } from "./utils";
import type { Project, ProjectStatus } from "@/types/project";

// ─── Column icons ─────────────────────────────────────────
const COLUMN_ICON: Record<ProjectStatus, React.ReactNode> = {
  Open: <PlayArrowIcon fontSize="small" />,
  Closed: <ArchiveIcon fontSize="small" />,
};

// ─── Props ───────────────────────────────────────────────
interface Props {
  status: ProjectStatus;
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onReopen: (project: Project) => void;
  onClose: (project: Project) => void;
  onCardClick: (project: Project) => void;
}

export function KanbanColumn({
  status,
  projects,
  onEdit,
  onDelete,
  onReopen,
  onClose,
  onCardClick,
}: Props) {
  const theme = useTheme();
  const meta = STATUS_META[status];

  const headerColors: Record<ProjectStatus, string> = {
    Open: theme.palette.info?.main ?? theme.palette.primary.main,
    Closed: theme.palette.text.secondary,
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
          {meta.label}
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
          projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={onEdit}
              onDelete={onDelete}
              onReopen={onReopen}
              onClose={onClose}
              onClick={onCardClick}
            />
          ))
        )}
      </Box>
    </Paper>
  );
}
