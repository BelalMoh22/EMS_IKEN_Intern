import { Box, IconButton, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";

interface ActionButtonsProps {
  basePath: string; // e.g. "/employees"
  id: number | string;
  canEdit?: boolean;
  canDelete?: boolean;
  onDelete?: (id: number | string) => void;
}

export function ActionButtons({
  basePath,
  id,
  canEdit = false,
  canDelete = false,
  onDelete,
}: ActionButtonsProps) {
  const navigate = useNavigate();

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <Box sx={{ display: "flex", gap: 0.5 }}>
      <Tooltip title="View Details">
        <IconButton
          size="small"
          onClick={(e) =>
            handleActionClick(e, () => navigate(`${basePath}/${id}`))
          }
          color="info"
        >
          <VisibilityIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      {canEdit && (
        <Tooltip title="Edit">
          <IconButton
            size="small"
            onClick={(e) =>
              handleActionClick(e, () => navigate(`${basePath}/edit/${id}`))
            }
            color="primary"
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {canDelete && onDelete && (
        <Tooltip title="Delete">
          <IconButton
            size="small"
            onClick={(e) => handleActionClick(e, () => onDelete(id))}
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}
