import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  Stack,
  Paper,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import SettingsIcon from "@mui/icons-material/Settings";
import TimerIcon from "@mui/icons-material/Timer";
import { useSettings, useUpdateSettings } from "@/hooks/useWorkLogs";

export default function SystemSettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();

  const [gracePeriod, setGracePeriod] = useState<number>(7);

  useEffect(() => {
    if (settings) {
      setGracePeriod(settings.workLogGracePeriod);
    }
  }, [settings]);

  const handleSave = () => {
    updateMutation.mutate({ workLogGracePeriod: gracePeriod });
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h1" sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <SettingsIcon sx={{ fontSize: "2.5rem", color: "primary.main" }} />
          System Settings
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Configure global business rules and constraints for the EMS platform.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ borderRadius: 4, overflow: "hidden", border: "1px solid", borderColor: "divider" }}>
            <Box sx={{ p: 2, bgcolor: "rgba(0,0,0,0.02)", borderBottom: "1px solid", borderColor: "divider" }}>
              <Typography variant="subtitle2" fontWeight={700}>
                Work Log Configuration
              </Typography>
            </Box>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={4}>
                <Box>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Box sx={{ p: 1, bgcolor: "rgba(59, 130, 246, 0.1)", color: "primary.main", borderRadius: 2 }}>
                      <TimerIcon />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        Work Log Grace Period
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Defines how many days in the past employees can log their work activity.
                      </Typography>
                    </Box>
                  </Stack>

                  <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, md: 8 }}>
                      <TextField
                        fullWidth
                        label="Grace Period (Days)"
                        type="number"
                        value={gracePeriod}
                        onChange={(e) => setGracePeriod(parseInt(e.target.value) || 0)}
                        inputProps={{ min: 0 }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 8 }}>
                      <Alert severity="info" sx={{ borderRadius: 2 }}>
                        Current limit: Employees can log work for today and the previous <strong>{gracePeriod}</strong> days.
                      </Alert>
                    </Grid>
                  </Grid>
                </Box>

                <Divider />

                <Box sx={{ display: "flex", justifySelf: "flex-end" }}>
                  <Button
                    variant="contained"
                    startIcon={updateMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    sx={{
                      px: 4,
                      borderRadius: 2.5,
                      background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                      boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
                      "&:hover": { background: "linear-gradient(135deg, #2563eb, #1e40af)" },
                    }}
                  >
                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: "rgba(59, 130, 246, 0.02)", border: "1px dashed", borderColor: "primary.light" }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Important Note
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Changing the grace period affects all employees immediately.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              If an employee needs to log hours beyond this limit, you must temporarily increase this value or log the hours on their behalf if allowed by company policy.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
