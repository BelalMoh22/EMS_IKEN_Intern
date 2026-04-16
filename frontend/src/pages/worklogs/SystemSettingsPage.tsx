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
  Switch,
  FormControlLabel,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import SettingsIcon from "@mui/icons-material/Settings";
import TimerIcon from "@mui/icons-material/Timer";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useSettings, useUpdateSettings, useDisableSettings } from "@/hooks/useWorkLogs";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";

import { useSnackbar } from "notistack";
import { extractErrorMessage } from "@/utils/handleApiErrors";

export default function SystemSettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();
  const disableMutation = useDisableSettings();
  const { enqueueSnackbar } = useSnackbar();

  const [gracePeriod, setGracePeriod] = useState<number | string>(7);
  const [reminderTime, setReminderTime] = useState<string>("09:00");
  const [isReminderEnabled, setIsReminderEnabled] = useState<boolean>(false);
  
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (settings) {
      setGracePeriod(settings.workLogGracePeriodDays);
      setReminderTime(settings.reminderTime || "09:00");
      setIsReminderEnabled(settings.isReminderEnabled);
    }
  }, [settings]);

  const isValidGracePeriod = gracePeriod !== "" && !isNaN(Number(gracePeriod)) && Number(gracePeriod) >= 0;
  
  const handleSave = () => {
    if (!isValidGracePeriod) {
      setShowError(true);
      return;
    }
    
    setShowError(false);
    updateMutation.mutate({ 
      workLogGracePeriodDays: Number(gracePeriod),
      reminderTime: reminderTime,
      isReminderEnabled: isReminderEnabled
    }, {
      onSuccess: (response) => {
        enqueueSnackbar(response.message || "Settings updated successfully", { variant: "success" });
      },
      onError: (error) => {
        enqueueSnackbar(extractErrorMessage(error, "Failed to update settings"), { variant: "error" });
      }
    });
  };

  const handleDisable = () => {
    disableMutation.mutate(undefined, {
      onSuccess: (response) => {
        enqueueSnackbar(response.message || "Grace period disabled successfully", { variant: "success" });
      },
      onError: (error) => {
        enqueueSnackbar(extractErrorMessage(error, "Failed to disable grace period"), { variant: "error" });
      }
    });
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
          Configure global business rules, submission constraints, and automated reminders.
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
                {/* Grace Period Section */}
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

                  <Grid container spacing={2} alignItems="flex-start">
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Grace Period (Days)"
                        type="number"
                        value={gracePeriod}
                        onChange={(e) => {
                          setGracePeriod(e.target.value);
                          if (showError) setShowError(false);
                        }}
                        error={showError || !isValidGracePeriod}
                        helperText={(!isValidGracePeriod) ? "Please enter a valid number (minimum 0)" : ""}
                        inputProps={{ min: 0 }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      {settings?.isDeleted && (
                        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2, fontWeight: 700 }}>
                          The grace period is currently DISABLED. Employees can log work logs for any date in the past.
                        </Alert>
                      )}
                      <Alert severity="info" sx={{ borderRadius: 2 }}>
                        Employees can log work for today and the previous <strong>{isValidGracePeriod ? gracePeriod : "?"}</strong> days.
                      </Alert>
                    </Grid>
                  </Grid>
                </Box>

                <Divider />

                {/* Reminder System Section */}
                <Box>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Box sx={{ p: 1, bgcolor: "rgba(16, 185, 129, 0.1)", color: "success.main", borderRadius: 2 }}>
                      <NotificationsActiveIcon />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        Work Log Reminders
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Automatically notify employees who are behind on their work log submissions.
                      </Typography>
                    </Box>
                  </Stack>

                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12 }}>
                      <FormControlLabel
                        control={
                          <Switch 
                            checked={isReminderEnabled} 
                            onChange={(e) => setIsReminderEnabled(e.target.checked)}
                            color="primary"
                          />
                        }
                        label={
                          <Typography variant="body1" fontWeight={600}>
                            Enable Reminder Emails
                          </Typography>
                        }
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Reminder Time (Daily)"
                        type="time"
                        value={reminderTime}
                        onChange={(e) => setReminderTime(e.target.value)}
                        disabled={!isReminderEnabled}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ step: 300 }} // 5 min steps
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <AccessTimeIcon sx={{ color: "text.secondary", mr: 1, fontSize: 20 }} />
                                )
                            }
                        }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Alert severity="info" sx={{ borderRadius: 2 }}>
                        {isReminderEnabled 
                          ? `Reminders will be sent daily at ${reminderTime} to employees who haven't logged work within the grace period.`
                          : "Reminder emails are currently disabled."}
                      </Alert>
                    </Grid>
                  </Grid>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
                  {!settings?.isDeleted && (
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={disableMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <RemoveCircleOutlineIcon />}
                      onClick={handleDisable}
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
                    {updateMutation.isPending ? "Saving..." : settings?.isDeleted ? "Enable & Save" : "Save Changes"}
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
              Changing the grace period or reminder settings affects all employees immediately.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              The reminder system prevents sending multiple emails to the same employee within 24 hours to avoid spamming.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
