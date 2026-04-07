import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RestoreIcon from "@mui/icons-material/Restore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import type { Project } from "@/types/project";
import { STATUS_META, formatDate } from "./utils/projectUtils";
import { useProjectActions } from "./context/ProjectActionsContext";

// ─── Props ───────────────────────────────────────────────
interface Props {
  project: Project;
}

export function ProjectCard({ project }: Props) {
  const theme = useTheme();
  const { onEdit, onDelete, onReopen, onClose, onCardClick } =
    useProjectActions();
  const meta = STATUS_META[project.status];

  return (
    <Card
      onClick={() => onCardClick(project)}
      sx={{
        mb: 1.5,
        cursor: "pointer",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        "&:hover": {
          transform: "translateY(-1px)",
          boxShadow: "0 6px 20px rgba(0,0,0,0.10)",
        },
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            mb: 0.75,
          }}
        >
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{
              flexGrow: 1,
              mr: 1,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
            }}
          >
            {project.name}
          </Typography>
          <Chip
            label={meta.label}
            color={meta.color}
            size="small"
            variant="outlined"
            sx={{ fontSize: "0.7rem", height: 20, flexShrink: 0 }}
          />
        </Box>

        {/* Description */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            lineHeight: 1.5,
            mb: 1.25,
          }}
        >
          {project.description || "No description provided."}
        </Typography>

        {/* Footer */}
        <Divider sx={{ mb: 1 }} />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
          onClick={(e) => e.stopPropagation()} // Prevent parent click when action button is clicked
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: "0.7rem" }}
          >
            {formatDate(project.createdAt)}
          </Typography>
          <Stack direction="row" spacing={0.25}>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => onEdit(project)}
                sx={{
                  color: theme.palette.primary.main,
                  "&:hover": { bgcolor: "rgba(59,130,246,0.08)" },
                }}
              >
                <EditIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
            {project.status === "Open" && (
              <Tooltip title="Close Project">
                <IconButton
                  size="small"
                  onClick={() => onClose(project)}
                  sx={{
                    color: theme.palette.info.main,
                    "&:hover": { bgcolor: "rgba(34,197,94,0.08)" },
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            )}
            {project.status === "Closed" && (
              <Tooltip title="Reopen">
                <IconButton
                  size="small"
                  onClick={() => onReopen(project)}
                  sx={{
                    color: theme.palette.success.main,
                    "&:hover": { bgcolor: "rgba(34,197,94,0.08)" },
                  }}
                >
                  <RestoreIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={() => onDelete(project)}
                sx={{
                  color: theme.palette.error.main,
                  "&:hover": { bgcolor: "rgba(239,68,68,0.08)" },
                }}
              >
                <DeleteIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
