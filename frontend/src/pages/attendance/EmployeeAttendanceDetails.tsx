import { useState, useMemo, useEffect } from "react";
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
  IconButton,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import api from "@/api/axios";
import { AttendanceRecordDto, ApiResponse } from "@/types";
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

export default function EmployeeAttendanceDetails() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [month, setMonth] = useState(Number(searchParams.get("month")) || new Date().getMonth() + 1);
  const [year, setYear] = useState(Number(searchParams.get("year")) || new Date().getFullYear());
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data: records, isLoading } = useQuery<AttendanceRecordDto[]>({
    queryKey: ["attendance", "details", employeeId, month, year],
    queryFn: async () => {
      const response = await api.get<ApiResponse<AttendanceRecordDto[]>>(`/attendance/details?employeeId=${employeeId}&month=${month}&year=${year}`);
      return response.data.data ?? [];
    },
  });

  const pageRecords = useMemo(() => {
    if (!records) return [];
    const start = page * rowsPerPage;
    return records.slice(start, start + rowsPerPage);
  }, [records, page, rowsPerPage]);

  // Reset page when switching month/year
  useEffect(() => {
    setPage(0);
  }, [month, year]);

  const formatMinutesToHms = (minutes: number) => {
    if (!minutes || minutes <= 0) return "0m";
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    if (h > 0) {
      return m > 0 ? `${h}h ${m}m` : `${h}h`;
    }
    return `${m}m`;
  };

  const employeeName = records?.[0]?.employeeName || "Employee";

  return (
    <Box>
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton onClick={() => navigate("/attendance/monthly")}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" fontWeight={700} color="text.primary">
            {employeeName} - Daily Attendance
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Daily check-in/out logs for {MONTHS.find(m => m.value === month)?.label} {year}.
          </Typography>
        </Box>
      </Box>

      <Card sx={{ mb: 4, borderRadius: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 4 }}>
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
            <Grid size={{ xs: 12, sm: 4 }}>
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
          </Grid>
        </CardContent>
      </Card>

      <DataTable
        columns={[
          { header: "Date", accessorKey: "date" },
          { header: "Check In", cell: (r) => r.checkIn || "—" },
          { header: "Check Out", cell: (r) => r.checkOut || "—" },
          {
            header: "Late",
            cell: (r) => (
              <Typography color={r.lateMinutes > 0 ? "error.main" : "inherit"}>
                {formatMinutesToHms(r.lateMinutes)}
              </Typography>
            ),
          },
          {
            header: "Early",
            cell: (r) => (
              <Typography color={r.earlyLeaveMinutes > 0 ? "warning.main" : "inherit"}>
                {formatMinutesToHms(r.earlyLeaveMinutes)}
              </Typography>
            ),
          },
          { 
            header: "Working", 
            cell: (r) => (
              <Typography color={r.workingMinutes > 0 ? "primary.main" : "inherit"} fontWeight={r.workingMinutes > 0 ? 600 : 400}>
                {formatMinutesToHms(r.workingMinutes)}
              </Typography>
            ) 
          },
          {
            header: "Status",
            cell: (r) => (
              <Box display="flex" flexWrap="wrap">
                {r.status?.split(", ").map((s, si) => (
                  <Chip
                    key={si}
                    label={s}
                    size="small"
                    sx={{ mr: 0.5, mb: 0.5 }}
                    color={
                      s === "Present" ? "success" : s === "Late" ? "error" : "warning"
                    }
                    variant="outlined"
                  />
                ))}
              </Box>
            ),
          },
        ]}
        data={pageRecords}
        loading={isLoading}
        page={page}
        totalCount={records?.length || 0}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={(rows) => {
          setRowsPerPage(rows);
          setPage(0);
        }}
      />
    </Box>
  );
}
