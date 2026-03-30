import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Stack,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TablePagination,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Refresh as SyncIcon,
  CheckCircleOutline as CheckCircleIcon,
  ErrorOutline as ErrorIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { attendanceApi } from "@/api/attendanceApi";
import type { SyncResult } from "@/types";

const CACHE_KEY = "attendance_sync_cache";

export default function Attendance() {
  const [loading, setLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(() => {
    const saved = localStorage.getItem(CACHE_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filters
  const [searchName, setSearchName] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // Persist result on change
  useEffect(() => {
    if (syncResult) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(syncResult));
    } else {
      localStorage.removeItem(CACHE_KEY);
    }
  }, [syncResult]);

  const handleSync = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      setSyncResult(null);
      setPage(0);

      const responseBody = await attendanceApi.sync();
      if (responseBody.success && responseBody.data) {
          setSyncResult(responseBody.data);
      } else {
          setErrorMsg(responseBody.message || "Failed to sync attendance.");
      }
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || err.message || "Failed to sync attendance."
      );
    } finally {
      setLoading(false);
    }
  };

  const clearCache = () => {
    setSyncResult(null);
    setSearchName("");
    setFilterDate("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present": return "success";
      case "Late": return "error";
      case "EarlyLeave": return "warning";
      case "Absent": return "default";
      default: return "default";
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Safe data access
  const records = syncResult?.records || [];
  const errors = syncResult?.errors || [];

  // Filter Logic
  const filteredRecords = records.filter(r => {
    const searchLower = searchName.trim().toLowerCase();
    const matchesName = r.employeeName.toLowerCase().includes(searchLower) || 
                      r.employeeId.toString().includes(searchLower);
    const matchesDate = !filterDate || r.date === filterDate;
    return matchesName && matchesDate;
  });

  const uniqueDates = Array.from(new Set(records.map(r => r.date))).sort().reverse();

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Attendance
        </Typography>
        
        <Stack direction="row" spacing={2}>
          {syncResult && (
            <Button variant="outlined" color="inherit" onClick={clearCache}>
              Clear View
            </Button>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={handleSync}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SyncIcon />}
            sx={{ px: 4, py: 1.5, borderRadius: 2 }}
          >
            {loading ? "Syncing..." : "Sync"}
          </Button>
        </Stack>
      </Box>

      <Paper sx={{ p: 4, mb: 4, borderRadius: 2 }}>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Click <strong>Sync</strong> to process the static server file (<code>attendance_template.xlsx</code>).
        </Typography>

        {errorMsg && (
          <Alert severity="error" sx={{ mt: 3, borderRadius: 2 }}>
            {errorMsg}
          </Alert>
        )}
      </Paper>

      {syncResult && (
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Sync Summary
          </Typography>
          
          <Stack direction={{ xs: "column", sm: "row" }} spacing={3} mb={4}>
            <Card sx={{ flex: 1, bgcolor: "success.light", color: "success.contrastText" }}>
              <CardContent>
                <Typography variant="h6">Inserted</Typography>
                <Typography variant="h3" fontWeight="bold">{syncResult.inserted || 0}</Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1, bgcolor: "info.light", color: "info.contrastText" }}>
              <CardContent>
                <Typography variant="h6">Updated</Typography>
                <Typography variant="h3" fontWeight="bold">{syncResult.updated || 0}</Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1, bgcolor: "warning.light", color: "warning.contrastText" }}>
              <CardContent>
                <Typography variant="h6">Skipped</Typography>
                <Typography variant="h3" fontWeight="bold">{syncResult.skipped || 0}</Typography>
              </CardContent>
            </Card>
          </Stack>

          {errors.length > 0 && (
            <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: 'error.main', mb: 4 }}>
              <Typography variant="h6" color="error.main" gutterBottom display="flex" alignItems="center" gap={1}>
                <ErrorIcon /> Validation Errors ({errors.length})
              </Typography>
              <List dense>
                {errors.map((err, i) => (
                  <ListItem key={i} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <ErrorIcon color="error" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={err} primaryTypographyProps={{ color: 'error.main' }} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          {/* Filters Section */}
          <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
              <TextField
                placeholder="Search Employee Name or ID..."
                size="small"
                fullWidth
                value={searchName}
                onChange={(e) => { setSearchName(e.target.value); setPage(0); }}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} fontSize="small" />,
                }}
              />
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Filter by Date</InputLabel>
                <Select
                  value={filterDate}
                  label="Filter by Date"
                  onChange={(e) => { setFilterDate(e.target.value); setPage(0); }}
                >
                  <MenuItem value=""><em>All Dates</em></MenuItem>
                  {uniqueDates.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                </Select>
              </FormControl>
            </Stack>
          </Paper>

          {/* Processed Records Table */}
          <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mt: 4 }}>
            Processed Records ({filteredRecords.length})
          </Typography>
          <Paper sx={{ borderRadius: 2, overflow: "hidden", mb: 4 }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: "background.default" }}>
                  <TableRow>
                    <TableCell><strong>Employee</strong></TableCell>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell><strong>In / Out</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Late</strong></TableCell>
                    <TableCell><strong>Early</strong></TableCell>
                    <TableCell><strong>Working</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                        <Typography color="text.secondary">No matching records found.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">{row.employeeName}</Typography>
                          <Typography variant="caption" color="text.secondary">ID: {row.employeeId}</Typography>
                        </TableCell>
                        <TableCell>{row.date}</TableCell>
                        <TableCell>{row.checkIn || "—"} / {row.checkOut || "—"}</TableCell>
                        <TableCell>
                          <Chip
                            label={row.status}
                            size="small"
                            color={getStatusColor(row.status) as any}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography color={row.lateMinutes > 0 ? "error.main" : "text.secondary"} variant="body2">
                            {row.lateMinutes > 0 ? `${row.lateMinutes}m` : "—"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography color={row.earlyLeaveMinutes > 0 ? "warning.main" : "text.secondary"} variant="body2">
                            {row.earlyLeaveMinutes > 0 ? `${row.earlyLeaveMinutes}m` : "—"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                           <Typography variant="body2" fontWeight="bold">
                             {row.workingMinutes > 0 ? `${Math.floor(row.workingMinutes / 60)}h ${row.workingMinutes % 60}m` : "—"}
                           </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={filteredRecords.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>

          {(errors.length === 0) && (syncResult.inserted + syncResult.updated > 0) && (
            <Alert severity="success" sx={{ borderRadius: 2 }} icon={<CheckCircleIcon fontSize="inherit" />}>
              Sync results saved! You can refresh the page and the data will stay here.
            </Alert>
          )}
        </Box>
      )}
    </Box>
  );
}
