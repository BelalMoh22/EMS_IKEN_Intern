import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { useDayDetails, useSaveDailyLogs } from "@/hooks/useWorkLogs";
import { useProjects } from "@/hooks/useProjects";
import { extractAllErrorMessages } from "@/utils/handleApiErrors";
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
  IconButton,
  Tooltip,
  MenuItem,
  TextField,
  Alert,
  CircularProgress,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import {
  WORK_STATUS_FROM_NUMBER,
  WORK_STATUS_ENUM_MAP,
  type WorkLogCreateItemDTO,
} from "@/types/worklog";

interface LogRow {
  id?: number;
  projectId: number;
  hours: number;
  status: number;
  notes: string;
}

interface Props {
  date: string | null; // null = new day
  onClose: () => void;
}

const emptyRow: LogRow = {
  projectId: 0,
  hours: 0,
  status: WORK_STATUS_ENUM_MAP.Todo,
  notes: "",
};

export default function WorkLogDayFormDialog({ date, onClose }: Props) {
  const isNew = !date;
  const [workDate, setWorkDate] = useState(
    date || format(new Date(), "yyyy-MM-dd")
  );
  const { data: dayDetails, isLoading: loadingDetails } = useDayDetails(
    isNew ? "" : date!
  );
  const { data: projects, isLoading: loadingProjects } = useProjects();
  const saveMutation = useSaveDailyLogs();

  const [rows, setRows] = useState<LogRow[]>([{ ...emptyRow }]);

  // Prefill rows when editing an existing day
  useEffect(() => {
    if (!isNew && dayDetails && dayDetails.logs.length > 0) {
      setRows(
        dayDetails.logs.map((log) => ({
          id: log.id,
          projectId: log.projectId,
          hours: log.hours,
          status: log.status,
          notes: log.notes || "",
        }))
      );
    }
  }, [dayDetails, isNew]);

  const totalHours = useMemo(
    () => rows.reduce((sum, r) => sum + (Number(r.hours) || 0), 0),
    [rows]
  );

  const addRow = () => setRows((prev) => [...prev, { ...emptyRow }]);

  const removeRow = (index: number) =>
    setRows((prev) => prev.filter((_, i) => i !== index));

  const updateRow = (index: number, field: keyof LogRow, value: unknown) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const handleSave = () => {
    // Validate
    const validLogs = rows.filter((r) => r.projectId > 0 && r.hours > 0);
    if (validLogs.length === 0) return;

    const payload: WorkLogCreateItemDTO[] = validLogs.map((r) => ({
      projectId: r.projectId,
      hours: Number(r.hours),
      status: r.status,
      notes: r.notes || undefined,
    }));

    saveMutation.mutate(
      { workDate, logs: payload },
      { onSuccess: () => onClose() }
    );
  };

  const isLoading = loadingDetails || loadingProjects;
  const openProjects = projects?.filter((p) => p.status === "Open") ?? [];

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h2" component="span">
            {isNew ? "New Day Log" : "Edit Day Log"}
          </Typography>
          <Chip
            label={`${totalHours}h Total`}
            sx={{
              fontWeight: 600,
              bgcolor:
                totalHours > 24
                  ? "rgba(239, 68, 68, 0.12)"
                  : "rgba(59, 130, 246, 0.1)",
              color: totalHours > 24 ? "#dc2626" : "#2563eb",
              fontSize: "0.875rem",
            }}
          />
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Date Picker */}
            <TextField
              label="Work Date"
              type="date"
              value={workDate}
              onChange={(e) => setWorkDate(e.target.value)}
              disabled={!isNew}
              InputLabelProps={{ shrink: true }}
              sx={{ maxWidth: 220 }}
            />

            {totalHours > 24 && (
              <Alert severity="warning">
                Total hours exceed 24! Please review your entries.
              </Alert>
            )}

            {saveMutation.isError && (
              <Alert severity="error">
                <Box component="ul" sx={{ m: 0, pl: 2 }}>
                  {extractAllErrorMessages(saveMutation.error).map((msg, i) => (
                    <li key={i}>{msg}</li>
                  ))}
                </Box>
              </Alert>
            )}

            {/* Dynamic Rows Table */}
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ minWidth: 180 }}>Project</TableCell>
                    <TableCell sx={{ width: 100 }}>Hours</TableCell>
                    <TableCell sx={{ width: 120 }}>Status</TableCell>
                    <TableCell>Notes</TableCell>
                    <TableCell sx={{ width: 50 }} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <TextField
                          select
                          fullWidth
                          size="small"
                          value={row.projectId || ""}
                          onChange={(e) =>
                            updateRow(
                              index,
                              "projectId",
                              Number(e.target.value)
                            )
                          }
                          placeholder="Select Project"
                        >
                          <MenuItem value="" disabled>
                            Select Project
                          </MenuItem>
                          {openProjects.map((p) => (
                            <MenuItem key={p.id} value={p.id}>
                              {p.name}
                            </MenuItem>
                          ))}
                        </TextField>
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          size="small"
                          value={row.hours || ""}
                          onChange={(e) =>
                            updateRow(
                              index,
                              "hours",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          inputProps={{ min: 0.01, max: 24, step: 0.25 }}
                          sx={{ width: 90 }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          select
                          fullWidth
                          size="small"
                          value={row.status}
                          onChange={(e) =>
                            updateRow(
                              index,
                              "status",
                              Number(e.target.value)
                            )
                          }
                        >
                          {Object.entries(WORK_STATUS_FROM_NUMBER).map(
                            ([val, label]) => (
                              <MenuItem key={val} value={Number(val)}>
                                {label}
                              </MenuItem>
                            )
                          )}
                        </TextField>
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          fullWidth
                          value={row.notes}
                          onChange={(e) =>
                            updateRow(index, "notes", e.target.value)
                          }
                          placeholder="Optional notes..."
                          inputProps={{ maxLength: 500 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Remove row">
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => removeRow(index)}
                              disabled={rows.length === 1}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addRow}
              sx={{ alignSelf: "flex-start" }}
            >
              Add Project
            </Button>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saveMutation.isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={
            saveMutation.isPending ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <SaveIcon />
            )
          }
          onClick={handleSave}
          disabled={saveMutation.isPending || totalHours === 0}
          sx={{
            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            "&:hover": {
              background: "linear-gradient(135deg, #2563eb, #1e40af)",
            },
          }}
        >
          {saveMutation.isPending ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
