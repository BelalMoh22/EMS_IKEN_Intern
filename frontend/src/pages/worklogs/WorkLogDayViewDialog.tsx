import { format } from "date-fns";
import { useDayDetails, useDeleteWorkLog } from "@/hooks/useWorkLogs";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Skeleton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { WORK_STATUS_FROM_NUMBER } from "@/types/worklog";
import { useState } from "react";

interface Props {
  date: string;
  onClose: () => void;
  onEdit: () => void;
}

export default function WorkLogDayViewDialog({ date, onClose, onEdit }: Props) {
  const { data, isLoading } = useDayDetails(date);
  const deleteMutation = useDeleteWorkLog();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleDelete = () => {
    if (deleteId !== null) {
      deleteMutation.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  const formattedDate = (() => {
    try {
      return format(new Date(date), "EEEE, dd MMMM yyyy");
    } catch {
      return date;
    }
  })();

  return (
    <>
      <Dialog open onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography variant="h2" component="span">
                Work Log Details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formattedDate}
              </Typography>
            </Box>
            {data && (
              <Chip
                label={`${data.totalHours}h Total`}
                sx={{
                  fontWeight: 600,
                  bgcolor: "rgba(59, 130, 246, 0.1)",
                  color: "#2563eb",
                  fontSize: "0.875rem",
                }}
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {isLoading ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={48} />
              ))}
            </Box>
          ) : !data || data.logs.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography color="text.secondary">
                No logs for this day
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Project</TableCell>
                    <TableCell>Hours</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Notes</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.logs.map((log) => (
                    <TableRow key={log.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {log.projectName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${log.hours}h`}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            bgcolor: "rgba(34, 197, 94, 0.12)",
                            color: "#16a34a",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={WORK_STATUS_FROM_NUMBER[log.status] || "Unknown"}
                          size="small"
                          color={log.status === 2 ? "success" : "warning"}
                          variant="outlined"
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                          sx={{ maxWidth: 200 }}
                        >
                          {log.notes || "—"}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteId(log.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
          <Button variant="contained" startIcon={<EditIcon />} onClick={onEdit}>
            Edit Day
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Work Log"
        description="Are you sure you want to remove this project log? This action cannot be undone."
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </>
  );
}
