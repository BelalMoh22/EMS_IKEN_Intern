import { useState, useEffect } from "react";
import { useUpdateWorkLog } from "@/hooks/useWorkLogs";
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
  Typography,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import {
  WORK_STATUS_FROM_NUMBER,
  type WorkLogResponseItemDTO,
} from "@/types/worklog";

interface Props {
  log: WorkLogResponseItemDTO;
  open: boolean;
  onClose: () => void;
}

export default function WorkLogSingleEditDialog({ log, open, onClose }: Props) {
  const updateMutation = useUpdateWorkLog();

  const [hours, setHours] = useState<number>(log.hours);
  const [status, setStatus] = useState<number>(
    typeof log.status === 'string' ? 0 : log.status // Handle string/number mismatch if any
  );
  const [notes, setNotes] = useState(log.notes || "");

  // Correctly initialize status if it's a string
  useEffect(() => {
    if (typeof log.status === 'string') {
        // Find the number for the string label
        const entry = Object.entries(WORK_STATUS_FROM_NUMBER).find(([_, label]) => label === log.status);
        if (entry) setStatus(Number(entry[0]));
    } else {
        setStatus(log.status);
    }
  }, [log.status]);

  const handleSave = () => {
    if (hours <= 0) return;

    updateMutation.mutate(
      {
        id: log.id,
        data: {
          hours,
          status,
          notes: notes || undefined,
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        Update Log: {log.projectName}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Editing work log entry for this project.
          </Typography>

          {updateMutation.isError && (
            <Alert severity="error">
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                {extractAllErrorMessages(updateMutation.error).map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </Box>
            </Alert>
          )}

          <TextField
            label="Hours"
            type="number"
            value={hours || ""}
            onChange={(e) => setHours(parseFloat(e.target.value) || 0)}
            inputProps={{ min: 0.01, max: 24, step: 0.25 }}
            fullWidth
            required
            autoFocus
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
            rows={3}
            inputProps={{ maxLength: 500 }}
            fullWidth
            placeholder="Optional notes..."
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={updateMutation.isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={
            updateMutation.isPending ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <SaveIcon />
            )
          }
          onClick={handleSave}
          disabled={updateMutation.isPending || hours <= 0}
          sx={{
            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            "&:hover": {
              background: "linear-gradient(135deg, #2563eb, #1e40af)",
            },
          }}
        >
          {updateMutation.isPending ? "Saving..." : "Update Log"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
