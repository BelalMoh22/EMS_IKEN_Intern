import { useState, useMemo } from "react";
import {
  format, startOfDay, endOfDay,
  startOfWeek, endOfWeek, startOfMonth,
  endOfMonth, startOfYear, endOfYear,
  isWithinInterval, isToday
} from "date-fns";
import { useDailyLogs } from "@/hooks/useWorkLogs";
import { DataTable, type Column } from "@/components/shared/DataTable";
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  Card,
  CardContent,
  Grid,
  Skeleton,
  TextField,
  MenuItem,
  Paper,
  InputAdornment,
  LinearProgress,
  Avatar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import BarChartIcon from "@mui/icons-material/BarChart";

import type { DailyWorkLogDTO } from "@/types/worklog";
import WorkLogDayViewDialog from "./WorkLogDayViewDialog";
import WorkLogDayFormDialog from "./WorkLogDayFormDialog";
import WorkLogQuickAddDialog from "./WorkLogQuickAddDialog";
import { TimeRangeFilter, type TimeFilterType } from "./TimeRangeFilter";

// Helper for project colors
const stringToColor = (string: string) => {
  let hash = 0;
  for (let i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
};

export default function EmployeeWorkLogsPage() {
  const { data, isLoading } = useDailyLogs();

  const [viewDate, setViewDate] = useState<string | null>(null);
  const [editDate, setEditDate] = useState<string | null>(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filtering & Sorting State
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>("month");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sortOption, setSortOption] = useState("date_desc");
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Calculate Date Range
  const range = useMemo(() => {
    switch (timeFilter) {
      case "day": return { start: startOfDay(selectedDate), end: endOfDay(selectedDate) };
      case "week": return { start: startOfWeek(selectedDate, { weekStartsOn: 1 }), end: endOfWeek(selectedDate, { weekStartsOn: 1 }) };
      case "month": return { start: startOfMonth(selectedDate), end: endOfMonth(selectedDate) };
      case "year": return { start: startOfYear(selectedDate), end: endOfYear(selectedDate) };
    }
  }, [timeFilter, selectedDate]);

  const rangeLabel = useMemo(() => {
    switch (timeFilter) {
      case "day": return format(selectedDate, "dd MMMM yyyy");
      case "week": return `Week ${format(range.start, "dd MMM")} - ${format(range.end, "dd MMM")}`;
      case "month": return format(selectedDate, "MMMM yyyy");
      case "year": return `Year ${format(selectedDate, "yyyy")}`;
    }
  }, [timeFilter, selectedDate, range]);

  // 2. Computed Data: Filtering
  const filteredLogs = useMemo(() => {
    if (!data) return [];

    let result = data.filter(log => {
      const logDate = new Date(log.date);
      return isWithinInterval(logDate, range);
    });

    if (searchTerm) {
      const lowSearch = searchTerm.toLowerCase();
      result = result.filter(log => {
        // Search by project only as requested
        return log.projectDetails?.toLowerCase().includes(lowSearch);
      });
    }

    return result;
  }, [data, range, searchTerm]);

  // 3. Computed Data: Stats
  const stats = useMemo(() => {
    const totalDays = filteredLogs.length;
    const totalHours = filteredLogs.reduce((sum, log) => sum + log.totalHours, 0);
    const avgHours = totalDays > 0 ? (totalHours / totalDays).toFixed(1) : "0";
    return { totalDays, totalHours, avgHours };
  }, [filteredLogs]);

  // 4. Computed Data: Sorting
  const sortedLogs = useMemo(() => {
    const result = [...filteredLogs];
    result.sort((a, b) => {
      switch (sortOption) {
        case "date_desc": return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "date_asc": return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "hours_desc": return b.totalHours - a.totalHours;
        case "hours_asc": return a.totalHours - b.totalHours;
        default: return 0;
      }
    });
    return result;
  }, [filteredLogs, sortOption]);

  const pagedData = sortedLogs.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );

  const columns: Column<DailyWorkLogDTO>[] = [
    {
      header: "Date",
      cell: (row) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: 42,
            height: 42,
            borderRadius: 2,
            bgcolor: isToday(new Date(row.date)) ? "primary.main" : "rgba(0,0,0,0.04)",
            color: isToday(new Date(row.date)) ? "white" : "text.primary",
            flexShrink: 0
          }}>
            <Typography variant="caption" sx={{ fontWeight: 700, lineHeight: 1, textTransform: "uppercase", fontSize: "0.6rem" }}>
              {format(new Date(row.date), "EEE")}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1 }}>
              {format(new Date(row.date), "dd")}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" fontWeight={700} sx={{ color: "text.primary" }}>
              {format(new Date(row.date), "MMM yyyy")}
            </Typography>
            {isToday(new Date(row.date)) && (
              <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 800, textTransform: "uppercase", fontSize: "0.65rem" }}>
                Today
              </Typography>
            )}
          </Box>
        </Stack>
      ),
    },
    {
      header: "Total Hours",
      cell: (row) => (
        <Box sx={{ minWidth: 80 }}>
          <Chip
            label={`${row.totalHours}h`}
            size="small"
            sx={{
              fontWeight: 800,
              bgcolor: row.totalHours >= 8 ? "rgba(34, 197, 94, 0.12)" : "rgba(245, 158, 11, 0.12)",
              color: row.totalHours >= 8 ? "#16a34a" : "#d97706",
              px: 1,
              borderRadius: 1.5,
              mb: 0.5
            }}
          />
          <LinearProgress
            variant="determinate"
            value={Math.min((row.totalHours / 8) * 100, 100)}
            sx={{
              height: 4,
              borderRadius: 2,
              width: "100%",
              bgcolor: "rgba(0,0,0,0.05)",
              "& .MuiLinearProgress-bar": {
                bgcolor: row.totalHours >= 8 ? "#16a34a" : "#f59e0b"
              }
            }}
          />
        </Box>
      ),
    },
    {
      header: "Projects & Tasks",
      cell: (row) => {
        const projects = row.projectDetails?.split(";").filter(Boolean) || [];
        return (
          <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap", gap: 1.5 }}>
            {projects.map((p, i) => {
              const [name, hours] = p.split("|");
              const projectColor = stringToColor(name);
              return (
                <Tooltip key={i} title={`${hours}h worked on ${name}`}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      bgcolor: "white",
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2.5,
                      pl: 1,
                      pr: 2,
                      py: 0.75,
                      minWidth: 100,
                      transition: "all 0.2s ease",
                      position: "relative",
                      "&:hover": {
                        borderColor: projectColor,
                        bgcolor: "rgba(0,0,0,0.01)",
                        transform: "translateY(-2px)",
                        boxShadow: `0 4px 12px ${projectColor}15`
                      }
                    }}
                  >
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: 2,
                        bgcolor: `${projectColor}15`,
                        color: projectColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                        fontWeight: 900,
                        border: "1px solid",
                        borderColor: `${projectColor}30`,
                        px : 3
                      }}
                    >
                      {hours}
                    </Box>
                    <Box>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontWeight: 800, 
                          color: "text.primary",
                          fontSize: "0.75rem",
                          lineHeight: 1.2,
                          display: "block"
                        }}
                      >
                        {name}
                      </Typography>
                    </Box>
                  </Box>
                </Tooltip>
              );
            })}
            {projects.length === 0 && (
              <Typography variant="caption" color="text.disabled" fontStyle="italic">No projects assigned</Typography>
            )}
          </Stack>
        );
      },
    },
    {
      header: "Actions",
      cell: (row) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View Day Details">
            <IconButton
              size="small"
              sx={{ color: "primary.main", bgcolor: "rgba(37, 99, 235, 0.06)", "&:hover": { bgcolor: "rgba(37, 99, 235, 0.12)" } }}
              onClick={(e) => {
                e.stopPropagation();
                setViewDate(format(new Date(row.date), "yyyy-MM-dd"));
              }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Work Logs">
            <IconButton
              size="small"
              sx={{ color: "secondary.main", bgcolor: "rgba(124, 58, 237, 0.06)", "&:hover": { bgcolor: "rgba(124, 58, 237, 0.12)" } }}
              onClick={(e) => {
                e.stopPropagation();
                setEditDate(format(new Date(row.date), "yyyy-MM-dd"));
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  if (isLoading) {
    return (
      <Box sx={{ p: 4, display: "flex", flexDirection: "column", gap: 3 }}>
        <Skeleton variant="text" width={200} height={40} />
        <Grid container spacing={2}>
          {[1, 2, 3].map(i => (
            <Grid size={{ xs: 12, sm: 4 }} key={i}>
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 4 }} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 4 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Page Header */}
      <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: "-0.02em", color: "text.primary" }}>Work Logs</Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>View and manage your daily professional activity.</Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setQuickAddOpen(true)}
            sx={{ borderRadius: 2.5, textTransform: "none", fontWeight: 700, px: 2 }}
          >
            Quick Add
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setEditDate("new")}
            sx={{
              background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
              "&:hover": { background: "linear-gradient(135deg, #2563eb, #1e40af)" },
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 700,
              px: 2.5
            }}
          >
            New WorkLog
          </Button>
        </Stack>
      </Box>

      {/* Summary Section */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ borderRadius: 4, border: "1px solid", borderColor: "divider", boxShadow: "0 2px 10px rgba(0,0,0,0.02)", background: "linear-gradient(135deg, #ffffff 0%, #f8faff 100%)" }}>
            <CardContent sx={{ py: 2.5 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ p: 1.5, bgcolor: "rgba(59, 130, 246, 0.08)", color: "primary.main", borderRadius: 3 }}><CalendarTodayIcon /></Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Days</Typography>
                  <Typography variant="h4" fontWeight={900} sx={{ color: "text.primary" }}>{stats.totalDays}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ borderRadius: 4, border: "1px solid", borderColor: "divider", boxShadow: "0 2px 10px rgba(0,0,0,0.02)", background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)" }}>
            <CardContent sx={{ py: 2.5 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ p: 1.5, bgcolor: "rgba(34, 197, 94, 0.08)", color: "#16a34a", borderRadius: 3 }}><TrendingUpIcon /></Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Hours</Typography>
                  <Typography variant="h4" fontWeight={900} sx={{ color: "text.primary" }}>{stats.totalHours}<Typography component="span" variant="h6" sx={{ ml: 0.5 }}>h</Typography></Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ borderRadius: 4, border: "1px solid", borderColor: "divider", boxShadow: "0 2px 10px rgba(0,0,0,0.02)", background: "linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)" }}>
            <CardContent sx={{ py: 2.5 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ p: 1.5, bgcolor: "rgba(245, 158, 11, 0.08)", color: "#d97706", borderRadius: 3 }}><BarChartIcon /></Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>Avg / Day</Typography>
                  <Typography variant="h4" fontWeight={900} sx={{ color: "text.primary" }}>{stats.avgHours}<Typography component="span" variant="h6" sx={{ ml: 0.5 }}>h</Typography></Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Toolbar */}
      <TimeRangeFilter
        filterType={timeFilter}
        onFilterTypeChange={setTimeFilter}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        label={rangeLabel}
      />

      {/* Search & Sort Section */}
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
        <TextField
          fullWidth
          placeholder="Search by projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "text.disabled", fontSize: 20 }} /></InputAdornment>,
            sx: { borderRadius: 2.5, bgcolor: "background.paper" }
          }}
        />

        <Stack direction="row" spacing={1} sx={{ minWidth: { sm: 260 } }}>
          <TextField
            select
            fullWidth
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: <InputAdornment position="start"><FilterListIcon sx={{ color: "text.disabled", fontSize: 20 }} /></InputAdornment>,
              sx: { borderRadius: 2.5, bgcolor: "background.paper" }
            }}
          >
            <MenuItem value="date_desc"><Typography variant="body2" fontWeight={600}>Date: Newest First</Typography></MenuItem>
            <MenuItem value="date_asc"><Typography variant="body2" fontWeight={600}>Date: Oldest First</Typography></MenuItem>
            <MenuItem value="hours_desc"><Typography variant="body2" fontWeight={600}>Hours: High → Low</Typography></MenuItem>
            <MenuItem value="hours_asc"><Typography variant="body2" fontWeight={600}>Hours: Low → High</Typography></MenuItem>
          </TextField>
        </Stack>
      </Box>

      {/* Data Table */}
      {sortedLogs.length > 0 ? (
        <DataTable
          columns={columns}
          data={pagedData}
          loading={isLoading}
          onRowClick={(row) => setViewDate(format(new Date(row.date), "yyyy-MM-dd"))}
          page={page}
          totalCount={sortedLogs.length}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={(rows) => {
            setRowsPerPage(rows);
            setPage(0);
          }}
          getRowSx={(row) => ({
            bgcolor: isToday(new Date(row.date)) ? "rgba(37, 99, 235, 0.03)" : "inherit",
            borderLeft: isToday(new Date(row.date)) ? "4px solid #3b82f6" : "none",
            "&:hover": {
              bgcolor: isToday(new Date(row.date)) ? "rgba(37, 99, 235, 0.05) !important" : "rgba(0,0,0,0.02) !important",
              transform: "scale(1.002)"
            }
          })}
        />
      ) : (
        <Paper sx={{
          p: 10,
          textAlign: "center",
          borderRadius: 4,
          border: "1px dashed",
          borderColor: "divider",
          bgcolor: "rgba(0,0,0,0.01)"
        }}>
          <Typography variant="h6" color="text.primary" fontWeight={700} gutterBottom>No work logs found</Typography>
          <Typography variant="body2" color="text.secondary">We couldn't find any logs for the selected period.</Typography>
          <Button
            variant="text"
            onClick={() => { setTimeFilter("month"); setSelectedDate(new Date()); setSearchTerm(""); }}
            sx={{ mt: 2, fontWeight: 700 }}
          >
            Reset Filters
          </Button>
        </Paper>
      )}

      {/* Dialogs */}
      {viewDate && <WorkLogDayViewDialog date={viewDate} onClose={() => setViewDate(null)} onEdit={() => { setEditDate(viewDate); setViewDate(null); }} />}
      {editDate && <WorkLogDayFormDialog date={editDate === "new" ? null : editDate} onClose={() => setEditDate(null)} />}
      <WorkLogQuickAddDialog open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
    </Box>
  );
}

