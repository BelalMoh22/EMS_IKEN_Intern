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
import { useSettings, useUpdateSettings, useDisableSettings } from "@/hooks/useWorkLogs";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";

export default function SystemSettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();
  const disableMutation = useDisableSettings();

  const [gracePeriod, setGracePeriod] = useState<number | string>(7);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (settings) {
      setGracePeriod(settings.workLogGracePeriod);
    }
  }, [settings]);

  const isValid = gracePeriod !== "" && !isNaN(Number(gracePeriod)) && Number(gracePeriod) >= 1;
  const isStringValue = isNaN(Number(gracePeriod));

  const handleSave = () => {
    if (!isValid) {
      setShowError(true);
      return;
    }
    setShowError(false);
    updateMutation.mutate({ workLogGracePeriod: Number(gracePeriod) });
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
                        onChange={(e) => {
                          setGracePeriod(e.target.value);
                          if (showError) setShowError(false);
                        }}
                        error={showError || (gracePeriod !== "" && Number(gracePeriod) < 1) || isStringValue}
                        helperText={
                          (showError || (gracePeriod !== "" && Number(gracePeriod) < 1) || isStringValue) 
                            ? "Please enter a valid number (minimum 1)" 
                            : ""
                        }
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 8 }}>
                      {showError && (
                        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                          Failed to save: Please enter valid data (positive number).
                        </Alert>
                      )}
                      {settings?.isDisabled && (
                        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2, fontWeight: 700 }}>
                          The grace period is currently DISABLED. Employees can log work logs for any date in the past.
                        </Alert>
                      )}
                      <Alert severity="info" sx={{ borderRadius: 2 }}>
                        Current limit: Employees can log work for today and the previous <strong>{isValid ? gracePeriod : "?"}</strong> days.
                      </Alert>
                    </Grid>
                  </Grid>
                </Box>

                <Divider />

                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                  {!settings?.isDisabled && (
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={disableMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <RemoveCircleOutlineIcon />}
                      onClick={() => disableMutation.mutate()}
                      disabled={disableMutation.isPending || updateMutation.isPending}
                      sx={{ borderRadius: 2.5, px: 3, fontWeight: 700 }}
                    >
                      {disableMutation.isPending ? "Disabling..." : "Disable Grace Period"}
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    startIcon={updateMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                    onClick={handleSave}
                    disabled={updateMutation.isPending || disableMutation.isPending}
                    sx={{
                      px: 4,
                      borderRadius: 2.5,
                      background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                      boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
                      "&:hover": { background: "linear-gradient(135deg, #2563eb, #1e40af)" },
                    }}
                  >
                    {updateMutation.isPending ? "Saving..." : settings?.isDisabled ? "Enable & Save" : "Save Changes"}
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
