import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { useEmployeeReport } from "@/hooks/useWorkLogs";
import { DataTable, type Column } from "@/components/shared/DataTable";
import {
  Box,
  Typography,
  Button,
  Chip,
  Card,
  CardContent,
  Stack,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import type { EmployeeDailyReportDTO } from "@/types/worklog";

export default function EmployeeProjectReportPage() {
  const navigate = useNavigate();
  const { projectId, employeeId } = useParams<{
    projectId: string;
    employeeId: string;
  }>();
  const pid = Number(projectId);
  const eid = Number(employeeId);
  const { data, isLoading } = useEmployeeReport(pid, eid);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const sortedData = useMemo(() => {
    if (!data) return [];
    return [...data].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [data]);

  const totalHours = useMemo(
    () => sortedData.reduce((sum, d) => sum + d.hours, 0),
    [sortedData]
  );

  const avgHours = sortedData.length
    ? (totalHours / sortedData.length).toFixed(1)
    : "0";

  const pagedData = sortedData.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );

  const columns: Column<EmployeeDailyReportDTO>[] = [
    {
      header: "Date",
      cell: (row) => (
        <Typography variant="body2" fontWeight={500}>
          {format(new Date(row.date), "EEE, dd MMM yyyy")}
        </Typography>
      ),
    },
    {
      header: "Hours",
      cell: (row) => (
        <Chip
          label={`${row.hours}h`}
          size="small"
          sx={{
            fontWeight: 600,
            bgcolor: "rgba(34, 197, 94, 0.12)",
            color: "#16a34a",
          }}
        />
      ),
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography variant="h1">Employee Report</Typography>
          <Typography variant="body2" color="text.secondary">
            Daily hours for selected employee in this project.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/worklogs/projects/${pid}/employees`)}
        >
          Back to Employees
        </Button>
      </Box>

      {/* Summary Cards */}
      <Stack direction="row" spacing={2}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Total Hours
            </Typography>
            <Typography variant="h2" sx={{ color: "#2563eb", mt: 0.5 }}>
              {totalHours}h
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Days Logged
            </Typography>
            <Typography variant="h2" sx={{ color: "#16a34a", mt: 0.5 }}>
              {sortedData.length}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Avg Hours / Day
            </Typography>
            <Typography variant="h2" sx={{ color: "#d97706", mt: 0.5 }}>
              {avgHours}h
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      {/* Table */}
      <DataTable
        columns={columns}
        data={pagedData}
        loading={isLoading}
        page={page}
        totalCount={sortedData.length}
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
