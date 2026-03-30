import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  Card,
  CardContent,
  TablePagination,
} from "@mui/material";
import { attendanceApi } from "@/api/attendanceApi";
import type { MyAttendanceRecord } from "@/types";

export default function MyAttendance() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data: result, isLoading, error } = useQuery({
    queryKey: ["myAttendance"],
    queryFn: attendanceApi.getMyAttendance,
  });

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 3, borderRadius: 2 }}>
        Cannot load attendance data.
      </Alert>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present": return "success";
      case "Late": return "error";
      case "EarlyLeave": return "warning";
      case "Absent": return "default";
      default: return "default";
    }
  };

  const records = result?.records || [];

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        My Attendance
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={3} mb={4} mt={3}>
        <Card sx={{ flex: 1, borderRadius: 2 }}>
          <CardContent sx={{ textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary">Total Working Hours</Typography>
            <Typography variant="h4" fontWeight="bold" color="primary.main">
              {Math.floor((result?.totalWorkingMinutes || 0) / 60)}h {(result?.totalWorkingMinutes || 0) % 60}m
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, borderRadius: 2 }}>
          <CardContent sx={{ textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary">Total Late</Typography>
            <Typography variant="h4" fontWeight="bold" color="error.main">
              {result?.totalLateMinutes || 0} mins
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, borderRadius: 2 }}>
          <CardContent sx={{ textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary">Total Early Leave</Typography>
            <Typography variant="h4" fontWeight="bold" color="warning.main">
              {result?.totalEarlyLeaveMinutes || 0} mins
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: "background.default" }}>
              <TableRow>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Check In</strong></TableCell>
                <TableCell><strong>Check Out</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Late</strong></TableCell>
                <TableCell><strong>Early Leave</strong></TableCell>
                <TableCell><strong>Working Hours</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary">No attendance records found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                records
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row: MyAttendanceRecord, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.checkIn || "—"}</TableCell>
                    <TableCell>{row.checkOut || "—"}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        size="small"
                        color={getStatusColor(row.status) as any}
                        sx={{ 
                           fontWeight: 600,
                           ...(row.status === "Absent" && { bgcolor: "#e0e0e0", color: "#000" })
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography color={row.lateMinutes > 0 ? "error.main" : "text.secondary"}>
                        {row.lateMinutes > 0 ? `${row.lateMinutes}m` : "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography color={row.earlyLeaveMinutes > 0 ? "warning.main" : "text.secondary"}>
                        {row.earlyLeaveMinutes > 0 ? `${row.earlyLeaveMinutes}m` : "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography color={row.workingMinutes > 0 ? "primary.main" : "text.secondary"} fontWeight={500}>
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
          count={records.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}
