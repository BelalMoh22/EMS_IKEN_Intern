import { useState, useMemo, useEffect } from "react";
import { Box, Typography, Alert } from "@mui/material";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { 
  startOfDay, endOfDay, 
  startOfWeek, endOfWeek, 
  startOfMonth, endOfMonth, 
  startOfYear, endOfYear, 
  format 
} from "date-fns";

import { useReportsData } from "@/hooks/useWorkLogs";
import { useProjects } from "@/hooks/useProjects";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import DownloadIcon from "@mui/icons-material/Download";
import { ReportsSummary } from "./ReportsSummary";
import { ReportsFilters } from "./ReportsFilters";
import { ReportsTable, type MatrixData, type ProjectMeta } from "./ReportsTable";
import type { TimeFilterType } from "@/pages/worklogs/TimeRangeFilter";
import { useSnackbar } from "notistack";
import { Button, CircularProgress } from "@mui/material";

export default function ReportsPage() {
  // State
  const [filterType, setFilterType] = useState<TimeFilterType>("month");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isExporting, setIsExporting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [searchQuery, selectedDate, filterType]);

  // Helpers to get Date Range based on filter
  const { startDate, endDate, dateLabel } = useMemo(() => {
    let start, end, label;
    switch (filterType) {
      case "day":
        start = startOfDay(selectedDate);
        end = endOfDay(selectedDate);
        label = format(selectedDate, "MMM d, yyyy");
        break;
      case "week":
        start = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday start
        end = endOfWeek(selectedDate, { weekStartsOn: 1 });
        label = `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
        break;
      case "month":
        start = startOfMonth(selectedDate);
        end = endOfMonth(selectedDate);
        label = format(selectedDate, "MMMM yyyy");
        break;
      case "year":
        start = startOfYear(selectedDate);
        end = endOfYear(selectedDate);
        label = format(selectedDate, "yyyy");
        break;
    }
    return { startDate: start, endDate: end, dateLabel: label };
  }, [filterType, selectedDate]);

  // Convert to ISO string (yyyy-MM-dd) for the API
  const startStr = format(startDate, "yyyy-MM-dd");
  const endStr = format(endDate, "yyyy-MM-dd");

  const { data: rawLogs, isLoading: isLogsLoading, isError: isLogsError } = useReportsData(startStr, endStr);
  const { data: allProjects, isLoading: isProjectsLoading, isError: isProjectsError } = useProjects({ status: "All" });

  const isLoading = isLogsLoading || isProjectsLoading;
  const isError = isLogsError || isProjectsError;

  // Derived Data: filter by search
  const filteredLogs = useMemo(() => {
    if (!rawLogs) return [];
    
    const term = searchQuery.trim().toLowerCase();
    if (!term) return rawLogs;

    return rawLogs.filter((log) => log.employeeName.toLowerCase().includes(term));
  }, [rawLogs, searchQuery]);

  // Transform Data to Matrix format
  const { matrixData, projectsMeta, totalHours } = useMemo(() => {
    const matrix: MatrixData = {};
    const projMap: Record<number, ProjectMeta> = {};
    let tHours = 0;

    // Pre-populate all projects as columns
    if (allProjects) {
      allProjects.forEach((p) => {
        projMap[p.id] = {
          id: p.id,
          name: p.name,
          totalHours: 0,
        };
      });
    }

    filteredLogs.forEach((log) => {
      // Init employee in matrix
      if (!matrix[log.employeeId]) {
        matrix[log.employeeId] = {
          employeeName: log.employeeName,
          totalHours: 0,
          projects: {},
        };
      }
      
      // If projectId > 0, they logged time against a specific project
      if (log.projectId > 0) {
        // Init project in employee
        if (!matrix[log.employeeId].projects[log.projectId]) {
          matrix[log.employeeId].projects[log.projectId] = 0;
        }

        // Init project in Meta
        if (!projMap[log.projectId]) {
          projMap[log.projectId] = {
            id: log.projectId,
            name: log.projectName,
            totalHours: 0,
          };
        }

        // Add values
        matrix[log.employeeId].projects[log.projectId] += log.totalHours;
        matrix[log.employeeId].totalHours += log.totalHours;
        
        if (projMap[log.projectId]) {
          projMap[log.projectId].totalHours += log.totalHours;
        }
        tHours += log.totalHours;
      }
    });

    return {
      matrixData: matrix,
      projectsMeta: Object.values(projMap).sort((a,b) => a.name.localeCompare(b.name)),
      totalHours: tHours,
    };
  }, [filteredLogs, allProjects]);

  // Export Logic
  const handleExport = async () => {
    if (!rawLogs || rawLogs.length === 0) {
      enqueueSnackbar("No data available to export", { variant: "warning" });
      return;
    }

    setIsExporting(true);
    try {
      // Build Full Matrix (ignore search/pagination)
      const matrix: Record<number, { Employee: string; [key: string]: string | number }> = {};
      const projects = allProjects?.map(p => p.name) || [];

      rawLogs.forEach(log => {
        if (!matrix[log.employeeId]) {
          // 1. Set Employee Name
          matrix[log.employeeId] = {
            Employee: log.employeeName
          };

          // 2. Init all projects with 0 (ensures correct column order)
          projects.forEach(pName => {
            matrix[log.employeeId][pName] = 0;
          });

          // 3. Init Total Hours (to ensure it appears as the LAST column)
          matrix[log.employeeId]["Total Hours"] = 0;
        }

        if (log.projectId > 0) {
          matrix[log.employeeId][log.projectName] = (matrix[log.employeeId][log.projectName] as number || 0) + log.totalHours;
          matrix[log.employeeId]["Total Hours"] = (matrix[log.employeeId]["Total Hours"] as number || 0) + log.totalHours;
        }
      });

      // Also ensure employees with 0 logs are included!
      // (Wait, rawLogs already includes them from the LEFT JOIN on backend)
      
      const exportItems = Object.values(matrix).sort((a, b) => a.Employee.localeCompare(b.Employee));

      const worksheet = XLSX.utils.json_to_sheet(exportItems);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Contributions Report");

      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const file = new Blob([excelBuffer], { type: "application/octet-stream" });

      const fileName = `report_${startStr}_${endStr}.xlsx`;
      saveAs(file, fileName);
      enqueueSnackbar("Report exported successfully", { variant: "success" });
    } catch (err) {
      console.error(err);
      enqueueSnackbar("Failed to export report", { variant: "error" });
    } finally {
      setIsExporting(false);
    }
  };

  const totalEmployees = Object.keys(matrixData).length;
  const totalProjects = projectsMeta.length;

  // Paging for Matrix Data
  const pagedMatrixData = useMemo(() => {
    const entries = Object.entries(matrixData);
    const slicedEntries = entries.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
    return Object.fromEntries(slicedEntries) as MatrixData;
  }, [matrixData, page, rowsPerPage]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography variant="h1" sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <AssessmentIcon sx={{ fontSize: "2.5rem", color: "primary.main" }} />
            Reports
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Analyze employee contributions across projects
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={isExporting ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
          onClick={handleExport}
          disabled={isLoading || isExporting || !rawLogs || rawLogs.length === 0}
          sx={{
            borderRadius: 2,
            px: 3,
            fontWeight: 600,
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
            }
          }}
        >
          {isExporting ? "Exporting..." : "Export"}
        </Button>
      </Box>

      {/* Summary Cards */}
      <ReportsSummary
        totalEmployees={totalEmployees}
        totalProjects={totalProjects}
        totalHours={totalHours}
        isLoading={isLoading}
      />

      {/* Filters (Time & Search) */}
      <ReportsFilters
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        dateLabel={dateLabel}
      />

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load report data. Please try again.
        </Alert>
      )}

      {/* Data Table */}
      <ReportsTable
        projects={projectsMeta}
        matrixData={pagedMatrixData}
        isLoading={isLoading}
        page={page}
        totalCount={totalEmployees}
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
