import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
  Stack,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { CloudUpload as CloudUploadIcon, CheckCircle as CheckCircleIcon, Warning as WarningIcon } from "@mui/icons-material";
import { attendanceApi } from "@/api/attendanceApi";
import type { AttendancePreviewDto } from "@/types";

export default function AttendanceUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<AttendancePreviewDto[]>(() => {
    const saved = localStorage.getItem("attendance_preview_data");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    if (previewData.length > 0) {
      localStorage.setItem("attendance_preview_data", JSON.stringify(previewData));
    } else {
      localStorage.removeItem("attendance_preview_data");
    }
  }, [previewData]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPreviewData([]);
      setErrorMsg(null);
      setSuccessMsg(null);
      setPage(0);
      setSelectedDate("");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      
      const data = await attendanceApi.uploadPreview(file);
      setPreviewData(data);
      setSelectedDate("");
      setPage(0);
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || err.message || "Failed to upload file."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      
      const response = await attendanceApi.confirm(previewData);
      
      setSuccessMsg(response.message || "Attendance records successfully saved.");
      setPreviewData([]);
      setFile(null);
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || err.message || "Failed to confirm attendance."
      );
    } finally {
      setLoading(false);
    }
  };

  const uniqueDates = Array.from(new Set(previewData.map(r => r.date))).sort();
  const filteredData = selectedDate 
    ? previewData.filter(r => r.date === selectedDate) 
    : previewData;

  const validCount = filteredData.filter((r) => r.isValid).length;
  const invalidCount = filteredData.filter((r) => !r.isValid).length;

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Attendance Upload
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
          <Button
            component="label"
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            sx={{ px: 4, py: 1.5, borderRadius: 2 }}
          >
            {file ? file.name : "Select Excel/CSV File"}
            <input
              type="file"
              hidden
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleFileChange}
            />
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={!file || loading}
            sx={{ px: 4, py: 1.5, borderRadius: 2 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Upload & Preview"}
          </Button>
        </Stack>

        {errorMsg && (
          <Alert severity="error" sx={{ mt: 3, borderRadius: 2 }}>
            {errorMsg}
          </Alert>
        )}
        
        {successMsg && (
          <Alert severity="success" sx={{ mt: 3, borderRadius: 2 }}>
            {successMsg}
          </Alert>
        )}
      </Paper>

      {/* PREVIEW TABLE */}
      {previewData.length > 0 && (
        <Paper sx={{ borderRadius: 2, overflow: "hidden", p: 2, mb: 4 }}>
           <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} px={1}>
              <Stack direction="row" spacing={3} alignItems="center">
                <Typography variant="h6" fontWeight="bold">
                  Preview Review
                </Typography>
                
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel id="date-filter-label">Filter by Date</InputLabel>
                  <Select
                    labelId="date-filter-label"
                    value={selectedDate}
                    label="Filter by Date"
                    onChange={(e) => {
                       setSelectedDate(e.target.value);
                       setPage(0);
                    }}
                  >
                    <MenuItem value=""><em>All Dates</em></MenuItem>
                    {uniqueDates.map(date => (
                      <MenuItem key={date} value={date}>{date}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="body2" color="success.main" fontWeight="bold">
                  {validCount} Valid
                </Typography>
                <Typography variant="body2" color="error.main" fontWeight="bold">
                  {invalidCount} Invalid
                </Typography>
                {/* <Button
                  variant="contained"
                  color="success"
                  onClick={handleConfirm}
                  disabled={loading || validCount === 0}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                  sx={{ borderRadius: 2, ml: 2 }}
                >
                  Confirm & Save
                </Button> */}
              </Stack>
           </Stack>
           
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "background.default" }}>
                <TableRow>
                  <TableCell><strong>Employee ID</strong></TableCell>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Check In</strong></TableCell>
                  <TableCell><strong>Check Out</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Late Mins</strong></TableCell>
                  <TableCell><strong>Validation</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => (
                  <TableRow 
                    key={index} 
                    sx={{ 
                      bgcolor: row.isValid ? "rgba(76, 175, 80, 0.04)" : "rgba(244, 67, 54, 0.04)" 
                    }}
                  >
                    <TableCell>{row.employeeId}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.checkIn || "—"}</TableCell>
                    <TableCell>{row.checkOut || "—"}</TableCell>
                    <TableCell>
                      <Chip 
                        label={row.status} 
                        size="small"
                        color={
                          row.status === "Present" ? "success" 
                          : row.status === "Late" ? "warning" 
                          : "error"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Typography color={row.lateMinutes > 0 ? "error.main" : "text.secondary"}>
                        {row.lateMinutes > 0 ? `${row.lateMinutes}m` : "0m"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {row.isValid ? (
                        <Chip icon={<CheckCircleIcon />} label="Valid" color="success" size="small" variant="outlined" />
                      ) : (
                        <Stack spacing={1}>
                          {row.errors.map((err, i) => (
                            <Typography key={i} variant="caption" color="error.main" display="flex" alignItems="center" gap={0.5}>
                               <WarningIcon fontSize="inherit" /> {err}
                            </Typography>
                          ))}
                        </Stack>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}
    </Box>
  );
}
