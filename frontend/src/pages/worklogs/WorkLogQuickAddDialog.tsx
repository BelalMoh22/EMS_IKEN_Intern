import { useState } from "react";
import { format } from "date-fns";
import { useCreateWorkLog } from "@/hooks/useWorkLogs";
import { useProjects } from "@/hooks/useProjects";
import { extractAllErrorMessages } from "@/utils/handleApiErrors";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {
  WORK_STATUS_FROM_NUMBER,
  WORK_STATUS_ENUM_MAP,
} from "@/types/worklog";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function WorkLogQuickAddDialog({ open, onClose }: Props) {
  const createMutation = useCreateWorkLog();

  const [projectId, setProjectId] = useState<number>(0);
  const [workDate, setWorkDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [hours, setHours] = useState<number>(0);
  const { data: projects } = useProjects({ status: "Open" });
  const openProjects = projects ?? [];
  const [status, setStatus] = useState<number>(WORK_STATUS_ENUM_MAP.Todo);
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setProjectId(0);
    setWorkDate(format(new Date(), "yyyy-MM-dd"));
    setHours(0);
    setStatus(WORK_STATUS_ENUM_MAP.Todo);
    setNotes("");
  };

  const handleSubmit = () => {
    if (!projectId || hours <= 0) return;

    createMutation.mutate(
      {
        projectId,
        workDate,
        hours,
        status,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          resetForm();
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Quick Add Work Log</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {createMutation.isError && (
            <Alert severity="error">
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                {extractAllErrorMessages(createMutation.error).map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </Box>
            </Alert>
          )}

          <TextField
            select
            label="Project"
            value={projectId || ""}
            onChange={(e) => setProjectId(Number(e.target.value))}
            fullWidth
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

          <TextField
            label="Date"
            type="date"
            value={workDate}
            onChange={(e) => setWorkDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            label="Hours"
            type="number"
            value={hours || ""}
            onChange={(e) => setHours(parseFloat(e.target.value) || 0)}
            inputProps={{ min: 0.01, max: 24, step: 0.25 }}
            fullWidth
          />

          <TextField
            select
            label="Status"
            value={status}
            onChange={(e) => setStatus(Number(e.target.value))}
            fullWidth
          >
            {Object.entries(WORK_STATUS_FROM_NUMBER).map(([val, label]) => (
              <MenuItem key={val} value={Number(val)}>
                {label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            rows={2}
            inputProps={{ maxLength: 500 }}
            fullWidth
            placeholder="Optional notes..."
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={createMutation.isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={
            createMutation.isPending ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <AddIcon />
            )
          }
          onClick={handleSubmit}
          disabled={createMutation.isPending || !projectId || hours <= 0}
          sx={{
            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            "&:hover": {
              background: "linear-gradient(135deg, #2563eb, #1e40af)",
            },
          }}
        >
          {createMutation.isPending ? "Adding..." : "Add Log"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
