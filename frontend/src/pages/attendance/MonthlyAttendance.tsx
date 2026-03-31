import { useState, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Chip,
  CircularProgress,
  Button,
} from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { attendanceApi } from "@/api/attendanceApi";
import { EmployeeMonthlyAttendanceDto, ApiResponse } from "@/types";
import { useSnackbar } from "notistack";
import SyncIcon from "@mui/icons-material/Sync";
import { SearchInput } from "@/components/shared/SearchInput";
import { DataTable } from "@/components/shared/DataTable";

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const YEARS = [2025, 2026, 2027];

export default function MonthlyAttendance() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [syncLoading, setSyncLoading] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<any>(null);
  const [status, setStatus] = useState<string>("All");

  const { data: records, isLoading } = useQuery<EmployeeMonthlyAttendanceDto[]>({
    queryKey: ["attendance", "monthly", month, year],
    queryFn: async () => {
      const response = await api.get<ApiResponse<EmployeeMonthlyAttendanceDto[]>>(`/attendance/monthly?month=${month}&year=${year}`);
      return response.data.data ?? [];
    },
  });

  const filteredRecords = useMemo(() => {
    if (!records) return [];
    
    // Sort by ID ascending
    let filtered = [...records].sort((a, b) => a.employeeId - b.employeeId);
    
    // Status filter
    if (status !== "All") {
      filtered = filtered.filter(r => r.status === status);
    }

    if (!search) return filtered;
    const s = search.toLowerCase();
    return filtered.filter(
      (r) =>
        r.employeeName.toLowerCase().includes(s) ||
        r.employeeId.toString().includes(s)
    );
  }, [records, search, status]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize);
  const pageRecords = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, page, pageSize]);

  // Reset page when search or filters change
  useMemo(() => {
    setPage(1);
  }, [search, month, year, status]);

  const handleSync = async () => {
    try {
      setSyncLoading(true);
      setLastSyncResult(null);
      const res = await attendanceApi.sync();
      if (res.success) {
        setLastSyncResult(res.data);
        enqueueSnackbar(`Sync Success: ${res.data?.inserted} inserted, ${res.data?.updated} updated`, { variant: "success" });
        queryClient.invalidateQueries({ queryKey: ["attendance", "monthly"] });
      } else {
        enqueueSnackbar(res.message || "Sync failed", { variant: "error" });
      }
    } catch (err: any) {
      enqueueSnackbar(err.message || "Sync Error", { variant: "error" });
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="text.primary">
            Attendance
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage records, sync logs, and track monthly summaries.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={syncLoading ? <CircularProgress size={20} color="inherit" /> : <SyncIcon />}
          onClick={handleSync}
          disabled={syncLoading}
          sx={{ borderRadius: 2, px: 3 }}
        >
          {syncLoading ? "Syncing..." : "Sync"}
        </Button>
      </Box>

      {lastSyncResult && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }} display="flex" justifyContent="space-between" alignItems="center">
            Last Sync Summary
            <Button size="small" onClick={() => setLastSyncResult(null)}>Clear Summary</Button>
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card sx={{ bgcolor: "rgba(34, 197, 94, 0.1)", border: "1px solid", borderColor: "#22c55e", borderRadius: 2 }}>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="subtitle2" color="#16a34a" fontWeight={600}>Inserted</Typography>
                  <Typography variant="h4" color="#16a34a" fontWeight={700}>{lastSyncResult.inserted}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card sx={{ bgcolor: "rgba(59, 130, 246, 0.1)", border: "1px solid", borderColor: "#3b82f6", borderRadius: 2 }}>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="subtitle2" color="#2563eb" fontWeight={600}>Updated</Typography>
                  <Typography variant="h4" color="#2563eb" fontWeight={700}>{lastSyncResult.updated}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card sx={{ bgcolor: "rgba(245, 158, 11, 0.1)", border: "1px solid", borderColor: "#f59e0b", borderRadius: 2 }}>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="subtitle2" color="#d97706" fontWeight={600}>Skipped</Typography>
                  <Typography variant="h4" color="#d97706" fontWeight={700}>{lastSyncResult.skipped}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      <Card sx={{ mb: 4, borderRadius: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Month</InputLabel>
                <Select
                  value={month}
                  label="Month"
                  onChange={(e) => setMonth(Number(e.target.value))}
                >
                  {MONTHS.map((m) => (
                    <MenuItem key={m.value} value={m.value}>
                      {m.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Year</InputLabel>
                <Select
                  value={year}
                  label="Year"
                  onChange={(e) => setYear(Number(e.target.value))}
                >
                  {YEARS.map((y) => (
                    <MenuItem key={y} value={y}>
                      {y}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={status}
                  label="Status"
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <MenuItem value="All">All Statuses</MenuItem>
                  <MenuItem value="Deduction">Deduction</MenuItem>
                  <MenuItem value="No Deduction">No Deduction</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search name/ID..."
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <DataTable
        columns={[
          {
            header: "Employee Name & ID",
            cell: (record) => (
              <Box>
                <Typography variant="body2" fontWeight={600}>{record.employeeName}</Typography>
                <Typography variant="caption" color="text.secondary">ID: {record.employeeId}</Typography>
              </Box>
            ),
          },
          { header: "Late (m)", accessorKey: "totalLateMinutes" as any },
          { header: "Early (m)", accessorKey: "totalEarlyMinutes" as any },
          { header: "Working (h)", accessorKey: "totalWorkingHours" as any },
          { header: "Excuse (h)", accessorKey: "totalExcuseHours" as any },
          {
            header: "Deduction (h)",
            cell: (record) => (
              <Typography sx={{ color: record.deductionHours > 0 ? "error.main" : "inherit" }}>
                {record.deductionHours}h
              </Typography>
            ),
          },
          {
            header: "Status",
            cell: (record) => (
              <Chip
                label={record.status}
                size="small"
                color={record.status === "Deduction" ? "error" : "success"}
                variant="outlined"
              />
            ),
          },
        ]}
        data={pageRecords}
        loading={isLoading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onRowClick={(record) => navigate(`/attendance/details/${record.employeeId}?month=${month}&year=${year}`)}
      />
    </Box>
  );
}
