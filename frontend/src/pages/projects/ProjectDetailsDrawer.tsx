import {
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RestoreIcon from "@mui/icons-material/Restore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { STATUS_META, formatDate } from "./utils";
import type { Project } from "@/types/project";

// ─── Props ───────────────────────────────────────────────
interface Props {
  project: Project | null;
  onClose: () => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onReopen: (project: Project) => void;
  onCloseProject: (project: Project) => void;
}

export function ProjectDetailsDrawer({
  project,
  onClose,
  onEdit,
  onDelete,
  onReopen,
  onCloseProject,
}: Props) {
  const theme = useTheme();
  if (!project) return null;
  const meta = STATUS_META[project.status];

  return (
    <Drawer
      anchor="right"
      open={!!project}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: "100%", sm: 400 }, p: 3 } }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: "rgba(59,130,246,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: theme.palette.primary.main,
            }}
          >
            <AssignmentIcon />
          </Box>
          <Typography variant="h3" fontWeight={700}>
            Project Details
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 2.5 }} />

      {/* Content */}
      <Stack spacing={2.5}>
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={600}
            textTransform="uppercase"
            letterSpacing={0.8}
          >
            Project Name
          </Typography>
          <Typography variant="body1" fontWeight={600} mt={0.5}>
            {project.name}
          </Typography>
        </Box>

        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={600}
            textTransform="uppercase"
            letterSpacing={0.8}
          >
            Status
          </Typography>
          <Box mt={0.5}>
            <Chip label={meta.label} color={meta.color} size="small" variant="outlined" />
          </Box>
        </Box>

        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={600}
            textTransform="uppercase"
            letterSpacing={0.8}
          >
            Description
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5} lineHeight={1.7}>
            {project.description || "No description provided."}
          </Typography>
        </Box>

        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={600}
            textTransform="uppercase"
            letterSpacing={0.8}
          >
            Created
          </Typography>
          <Typography variant="body2" mt={0.5}>
            {formatDate(project.createdAt)}
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ my: 2.5 }} />

      {/* Actions */}
      <Stack spacing={1}>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          fullWidth
          onClick={() => {
            onEdit(project);
            onClose();
          }}
        >
          Edit Project
        </Button>
        {project.status === "Open" && (
          <Button
            variant="outlined"
            color="info"
            startIcon={<CheckCircleIcon />}
            fullWidth
            onClick={() => {
              onCloseProject(project);
              onClose();
            }}
          >
            Close Project
          </Button>
        )}
        {project.status === "Closed" && (
          <Button
            variant="outlined"
            color="success"
            startIcon={<RestoreIcon />}
            fullWidth
            onClick={() => {
              onReopen(project);
              onClose();
            }}
          >
            Reopen Project
          </Button>
        )}
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          fullWidth
          onClick={() => {
            onDelete(project);
            onClose();
          }}
        >
          Delete Project
        </Button>
      </Stack>
    </Drawer>
  );
}
