import { useMemo, useState } from "react";
import { Box, Typography, Button, Chip, Skeleton, Stack, Card, CardContent, Grid, Paper } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PeopleIcon from "@mui/icons-material/People";
import FunctionsIcon from "@mui/icons-material/Functions";
import { useNavigate } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import {
  startOfDay, endOfDay,
  startOfWeek, endOfWeek,
  startOfMonth, endOfMonth,
  startOfYear, endOfYear,
  isWithinInterval, format
} from "date-fns";

import { TopThree } from "./TopThree";
import { LeaderboardControls } from "./LeaderboardControls";
import { LeaderboardList } from "./LeaderboardList";
import { TimeRangeFilter, type TimeFilterType } from "../TimeRangeFilter";
import { worklogApi } from "@/api/worklogApi";

interface EmployeeContribution {
  employeeId: number;
  employeeName: string;
  totalHours: number;
}

interface ProjectLeaderboardProps {
  employees: EmployeeContribution[];
  isLoading: boolean;
  projectId: number;
}

export const ProjectLeaderboard = ({
  employees: baseEmployees,
  isLoading: isBaseLoading,
  projectId
}: ProjectLeaderboardProps) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [showTopThreeOnly, setShowTopThreeOnly] = useState(false);

  // Time Filter State
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>("month");
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Parallel fetch of daily reports for each employee to enable frontend filtering
  const employeeReports = useQueries({
    queries: baseEmployees.map(emp => ({
      queryKey: ["worklogs", "employee-report", projectId, emp.employeeId],
      queryFn: () => worklogApi.getEmployeeReport(projectId, emp.employeeId),
      staleTime: 5 * 60 * 1000,
    }))
  });

  const isLoading = isBaseLoading || employeeReports.some(r => r.isLoading);

  // 1. Calculate Date Range Interval
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

  // 2. Aggregate Data based on Time Filter
  const aggregatedEmployees = useMemo(() => {
    return baseEmployees.map((baseEmp, index) => {
      const report = employeeReports[index]?.data || [];
      const filteredHours = report
        .filter((log) => {
          const logDate = new Date(log.date);
          // Only count hours if status is 'Done' (2)
          return isWithinInterval(logDate, range) && Number(log.status) === 2;
        })
        .reduce((sum, log) => sum + log.hours, 0);

      return {
        ...baseEmp,
        totalHours: filteredHours,
      };
    }).filter((emp) => emp.totalHours > 0 || searchTerm); // Keep only matching if search is on, or those with hours
  }, [baseEmployees, employeeReports, range, searchTerm]);

  // 3. Totals & Stats
  const totalProjectHours = useMemo(() => {
    return aggregatedEmployees.reduce((sum, emp) => sum + emp.totalHours, 0);
  }, [aggregatedEmployees]);

  const activeEmployeesCount = useMemo(() => {
    return aggregatedEmployees.filter(emp => emp.totalHours > 0).length;
  }, [aggregatedEmployees]);

  const averageHoursPerEmployee = useMemo(() => {
    return activeEmployeesCount > 0 ? (totalProjectHours / activeEmployeesCount).toFixed(1) : "0";
  }, [totalProjectHours, activeEmployeesCount]);

  // 4. Filter & Sort for Display
  const processedEmployees = useMemo(() => {
    let result = [...aggregatedEmployees];

    if (searchTerm) {
      result = result.filter(emp =>
        emp.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortOption) {
      result.sort((a, b) => {
        switch (sortOption) {
          case "hours-desc": return b.totalHours - a.totalHours;
          case "hours-asc": return a.totalHours - b.totalHours;
          case "name-asc": return a.employeeName.localeCompare(b.employeeName);
          case "name-desc": return b.employeeName.localeCompare(a.employeeName);
          default: return 0;
        }
      });
    } else {
      // Default to hours desc when filtered but not explicitly sorted? 
      // User said "Doesn't have a default value", so we keep aggregation order
      result.sort((a, b) => b.totalHours - a.totalHours);
    }

    return result;
  }, [aggregatedEmployees, searchTerm, sortOption]);

  // 5. Extract Top 3 for Cards
  const top3ForCards = useMemo(() => {
    return [...aggregatedEmployees]
      .sort((a, b) => b.totalHours - a.totalHours)
      .slice(0, 3)
      .filter(emp => emp.totalHours > 0);
  }, [aggregatedEmployees]);

  if (isLoading) {
    return (
      <Box sx={{ p: 4, display: "flex", flexDirection: "column", gap: 3 }}>
        <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 4 }} />
        <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 4 }} />
        <Skeleton variant="text" width="60%" height={40} />
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 4 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h1" sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            Project Contributions
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Visualize and track individual employee effort assigned to this project.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/projects")}
          sx={{ borderRadius: 2 }}
        >
          Back to Projects
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ bgcolor: "primary.main", color: "white", borderRadius: 3 }}>
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, py: "16px !important" }}>
              <TrendingUpIcon fontSize="large" sx={{ opacity: 0.8 }} />
              <Box>
                <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 600, display: "block", mb: -0.5 }}>TOTAL HOURS</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>{totalProjectHours}h</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ bgcolor: "success.main", color: "white", borderRadius: 3 }}>
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, py: "16px !important" }}>
              <PeopleIcon fontSize="large" sx={{ opacity: 0.8 }} />
              <Box>
                <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 600, display: "block", mb: -0.5 }}>ACTIVE EMPLOYEES</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>{activeEmployeesCount}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ bgcolor: "warning.main", color: "white", borderRadius: 3 }}>
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, py: "16px !important" }}>
              <FunctionsIcon fontSize="large" sx={{ opacity: 0.8 }} />
              <Box>
                <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 600, display: "block", mb: -0.5 }}>AVG HOURS/EMP</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>{averageHoursPerEmployee}h</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Time Filter */}
      <TimeRangeFilter
        filterType={timeFilter}
        onFilterTypeChange={setTimeFilter}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        label={rangeLabel}
      />

      {/* Top 3 Section */}
      {!searchTerm && !showTopThreeOnly && top3ForCards.length > 0 && (
        <TopThree
          employees={top3ForCards}
          totalProjectHours={totalProjectHours}
          projectId={projectId}
        />
      )}

      {/* Controls */}
      <LeaderboardControls
        onSearchChange={setSearchTerm}
        onSortChange={setSortOption}
        onToggleTopThree={setShowTopThreeOnly}
        showTopThreeOnly={showTopThreeOnly}
        sortValue={sortOption}
      />

      {/* List Section */}
      <Box>
        <Typography variant="h2" sx={{ mb: 2, fontSize: "1.25rem", color: "text.primary", fontWeight: 700 }}>
          {showTopThreeOnly ? "Top Contributors" : "Full Leaderboard"}
        </Typography>

        {processedEmployees.length > 0 ? (
          <LeaderboardList
            employees={showTopThreeOnly ? processedEmployees.slice(0, 3) : processedEmployees}
            totalProjectHours={totalProjectHours}
            projectId={projectId}
            offset={0}
          />
        ) : (
          <Paper sx={{ p: 6, textAlign: "center", borderRadius: 4, border: "1px dashed", borderColor: "divider" }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>No work logs found for this period</Typography>
            <Typography variant="body2" color="text.secondary">Try adjusting the time range or search filters.</Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
};
