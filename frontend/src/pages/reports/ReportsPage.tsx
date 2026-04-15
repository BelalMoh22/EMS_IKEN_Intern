import { useState, useMemo, useEffect } from "react";
import {
  Box, Typography, Alert,
  Button, CircularProgress, ButtonGroup, IconButton,
  Menu, MenuItem, ListItemIcon, ListItemText,
  Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemButton, Checkbox,
  Divider, Tooltip, Chip,
} from "@mui/material";
import AssessmentIcon from "@mui/icons-material/Assessment";
import DownloadIcon from "@mui/icons-material/Download";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import PeopleIcon from "@mui/icons-material/People";
import SelectAllIcon from "@mui/icons-material/SelectAll";
import DeselectIcon from "@mui/icons-material/Deselect";

import {
  startOfDay, endOfDay,
  startOfWeek, endOfWeek,
  startOfMonth, endOfMonth,
  startOfYear, endOfYear,
  format,
  eachDayOfInterval,
} from "date-fns";

import { useReportsData } from "@/hooks/useWorkLogs";
import { useProjects } from "@/hooks/useProjects";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { ReportsSummary } from "./ReportsSummary";
import { ReportsFilters } from "./ReportsFilters";
import { ReportsTable, type MatrixData, type ProjectMeta } from "./ReportsTable";
import type { TimeFilterType } from "@/pages/worklogs/TimeRangeFilter";
import { useSnackbar } from "notistack";

export default function ReportsPage() {
  // ── Core state ──────────────────────────────────────────────────────────────
  const [filterType, setFilterType] = useState<TimeFilterType>("month");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isExporting, setIsExporting] = useState(false);

  // ── Export dropdown state ────────────────────────────────────────────────────
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const exportMenuOpen = Boolean(exportMenuAnchor);

  // ── Export-specific-employees dialog state ───────────────────────────────────
  const [selectionDialogOpen, setSelectionDialogOpen] = useState(false);
  const [checkedEmployeeIds, setCheckedEmployeeIds] = useState<Set<number>>(new Set());

  const { enqueueSnackbar } = useSnackbar();

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [searchQuery, selectedDate, filterType]);

  // ── Date range from filter ───────────────────────────────────────────────────
  const { startDate, endDate, dateLabel } = useMemo(() => {
    let start, end, label;
    switch (filterType) {
      case "day":
        start = startOfDay(selectedDate);
        end = endOfDay(selectedDate);
        label = format(selectedDate, "MMM d, yyyy");
        break;
      case "week":
        start = startOfWeek(selectedDate, { weekStartsOn: 0 }); // Sunday start
        end = endOfWeek(selectedDate, { weekStartsOn: 0 });
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

  const startStr = format(startDate, "yyyy-MM-dd");
  const endStr   = format(endDate,   "yyyy-MM-dd");

  // ── Data fetching ────────────────────────────────────────────────────────────
  const { data: rawLogs,    isLoading: isLogsLoading,     isError: isLogsError     } = useReportsData(startStr, endStr);
  const { data: allProjects, isLoading: isProjectsLoading, isError: isProjectsError } = useProjects({ status: "All" });

  const isLoading = isLogsLoading || isProjectsLoading;
  const isError   = isLogsError   || isProjectsError;

  // ── Filter by search ─────────────────────────────────────────────────────────
  const filteredLogs = useMemo(() => {
    if (!rawLogs) return [];
    const term = searchQuery.trim().toLowerCase();
    if (!term) return rawLogs;
    return rawLogs.filter((log) => log.employeeName.toLowerCase().includes(term));
  }, [rawLogs, searchQuery]);

  // ── Matrix transform ─────────────────────────────────────────────────────────
  const { matrixData, projectsMeta, totalHours } = useMemo(() => {
    const matrix: MatrixData = {};
    const projMap: Record<number, ProjectMeta> = {};
    let tHours = 0;

    if (allProjects) {
      allProjects.forEach((p) => {
        projMap[p.id] = { id: p.id, name: p.name, totalHours: 0 };
      });
    }

    filteredLogs.forEach((log) => {
      if (!matrix[log.employeeId]) {
        matrix[log.employeeId] = { employeeName: log.employeeName, totalHours: 0, projects: {} };
      }
      if (log.projectId > 0) {
        if (!matrix[log.employeeId].projects[log.projectId]) {
          matrix[log.employeeId].projects[log.projectId] = 0;
        }
        if (!projMap[log.projectId]) {
          projMap[log.projectId] = { id: log.projectId, name: log.projectName, totalHours: 0 };
        }
        matrix[log.employeeId].projects[log.projectId] += log.totalHours;
        matrix[log.employeeId].totalHours += log.totalHours;
        if (projMap[log.projectId]) projMap[log.projectId].totalHours += log.totalHours;
        tHours += log.totalHours;
      }
    });

    // ── Sorting Logic: Idle, Vacation, Blocked first, then insertion order ──
    const getPriority = (name: string) => {
      const n = name.toLowerCase();
      if (n.includes("idle")) return 1;
      if (n.includes("vacation")) return 2;
      if (n.includes("blocked")) return 3;
      return 4;
    };

    const sortedProjMeta = (allProjects || [])
      .map((p) => projMap[p.id] || { id: p.id, name: p.name, totalHours: 0 })
      .sort((a, b) => {
        const pA = getPriority(a.name);
        const pB = getPriority(b.name);
        if (pA !== pB) return pA - pB;
        return a.id - b.id; // Sorted by ID ascending (insertion order)
      });

    return {
      matrixData: matrix,
      projectsMeta: sortedProjMeta,
      totalHours: tHours,
    };
  }, [filteredLogs, allProjects]);

  // ── All unique employees from raw logs (for the selection dialog) ────────────
  const allEmployees = useMemo(() => {
    if (!rawLogs) return [];
    const seen = new Map<number, string>();
    rawLogs.forEach((log) => {
      if (!seen.has(log.employeeId)) seen.set(log.employeeId, log.employeeName);
    });
    return Array.from(seen.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [rawLogs]);

  // ── Helpers: working-day calculation (Sun=0 … Thu=4) ───────────────────────
  const isWorkingDay = (d: Date) => d.getDay() <= 4; // 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu

  const calcTotalPossibleHours = (): number => {
    switch (filterType) {
      case "day":
        return isWorkingDay(startDate) ? 8 : 0;
      case "week":
        return 40; // 5 working days × 8 h
      case "month":
      case "year": {
        const days = eachDayOfInterval({ start: startDate, end: endDate });
        return days.filter(isWorkingDay).length * 8;
      }
      default:
        return 40;
    }
  };

  // ── Core export builder ──────────────────────────────────────────────────────
  const buildAndDownload = async (employeeIds?: Set<number>) => {
    if (!rawLogs || rawLogs.length === 0) {
      enqueueSnackbar("No data available to export", { variant: "warning", autoHideDuration: 5000 });
      return;
    }

    setIsExporting(true);
    try {
      // 1. Total possible working hours for the selected period
      const totalPossibleHours = calcTotalPossibleHours();

      // Order of projects: Idle, Vacation, Blocked, then others
      const getPriority = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes("idle")) return 1;
        if (n.includes("vacation")) return 2;
        if (n.includes("blocked")) return 3;
        return 4;
      };

      const sortedProjects = [...(allProjects || [])].sort((a, b) => {
        const pA = getPriority(a.name);
        const pB = getPriority(b.name);
        if (pA !== pB) return pA - pB;
        return a.id - b.id; // Keep insertion order (ID ASC)
      });

      const projects = sortedProjects.map((p) => p.name);
      const hoursMatrix: Record<number, { Employee: string; [key: string]: string | number }> = {};

      // Helper: hours → decimal ratio (0.30 = 30%), rounded to 4 dp
      const toRatio = (hours: number): number =>
        totalPossibleHours > 0
          ? Math.round((hours / totalPossibleHours) * 100) / 100
          : 0;

      const logsToExport = employeeIds
        ? rawLogs.filter((log) => employeeIds.has(log.employeeId))
        : rawLogs;

      logsToExport.forEach((log) => {
        if (!hoursMatrix[log.employeeId]) {
          hoursMatrix[log.employeeId] = { Employee: log.employeeName };
          projects.forEach((pName) => { hoursMatrix[log.employeeId][pName] = 0; });
          hoursMatrix[log.employeeId]["TOTAL"] = 0;
        }
        if (log.projectId > 0) {
          hoursMatrix[log.employeeId][log.projectName] =
            ((hoursMatrix[log.employeeId][log.projectName] as number) || 0) + log.totalHours;
          hoursMatrix[log.employeeId]["TOTAL"] =
            ((hoursMatrix[log.employeeId]["TOTAL"] as number) || 0) + log.totalHours;
        }
      });

      // 3. Convert hours → decimal ratios, keep Employee as string
      // Note: We calculate TOTAL as the sum of rounded project values to ensure consistency in Excel
      const exportItems = Object.values(hoursMatrix)
        .sort((a, b) => a.Employee.localeCompare(b.Employee))
        .map(({ Employee, TOTAL: _ignoredTotal, ...projectsOnly }) => {
          const row: Record<string, string | number> = { Employee };
          let roundedSum = 0;
          
          Object.entries(projectsOnly).forEach(([key, val]) => {
            const roundedVal = toRatio(val as number);
            row[key] = roundedVal;
            roundedSum += roundedVal;
          });
          
          // Set TOTAL as the sum of individual rounded values (round again to handle float precision)
          row["TOTAL"] = Math.round(roundedSum * 100) / 100;
          
          return row;
        });

      // 4. Build worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportItems);

      // 5. Apply Excel percentage format ("0.00%") to every numeric cell
      //    Row 0 is the header → start from row 1
      const wsRange = XLSX.utils.decode_range(worksheet["!ref"]!);
      for (let R = wsRange.s.r + 1; R <= wsRange.e.r; R++) {
        for (let C = wsRange.s.c + 1; C <= wsRange.e.c; C++) { // skip col 0 = Employee
          const cellAddr = XLSX.utils.encode_cell({ r: R, c: C });
          if (worksheet[cellAddr]) {
            worksheet[cellAddr].t = "n";
            worksheet[cellAddr].z = "0.00";
          }
        }
      }

      // 6. Column widths for readability
      worksheet["!cols"] = [
        { wch: 28 },                              // Employee
        ...projects.map(() => ({ wch: 15 })),     // project columns
        { wch: 10 },                              // TOTAL
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Contributions Report");

      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const file = new Blob([excelBuffer], { type: "application/octet-stream" });
      saveAs(file, `report_${startStr}_${endStr}.xlsx`);
      enqueueSnackbar("Report exported successfully", { variant: "success", autoHideDuration: 5000 });
    } catch (err) {
      console.error(err);
      enqueueSnackbar("Failed to export report", { variant: "error", autoHideDuration: 5000 });
    } finally {
      setIsExporting(false);
    }
  };

  // ── Export menu handlers ─────────────────────────────────────────────────────
  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
    setExportMenuAnchor(e.currentTarget);
  };
  const handleMenuClose = () => setExportMenuAnchor(null);

  const handleExportAll = () => {
    handleMenuClose();
    buildAndDownload();
  };

  const handleOpenSelectionDialog = () => {
    handleMenuClose();
    // Start with no employees selected
    setCheckedEmployeeIds(new Set());
    setSelectionDialogOpen(true);
  };

  const handleExportSelected = () => {
    if (checkedEmployeeIds.size === 0) {
      enqueueSnackbar("Please select at least one employee", { variant: "warning" });
      return;
    }
    setSelectionDialogOpen(false);
    buildAndDownload(checkedEmployeeIds);
  };

  // ── Employee checkbox toggle ─────────────────────────────────────────────────
  const toggleEmployee = (id: number) => {
    setCheckedEmployeeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll   = () => setCheckedEmployeeIds(new Set(allEmployees.map((e) => e.id)));
  const deselectAll = () => setCheckedEmployeeIds(new Set());

  // ── Paging ───────────────────────────────────────────────────────────────────
  const totalEmployees = Object.keys(matrixData).length;
  const totalProjects  = projectsMeta.length;

  const pagedMatrixData = useMemo(() => {
    const entries      = Object.entries(matrixData);
    const slicedEntries = entries.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
    return Object.fromEntries(slicedEntries) as MatrixData;
  }, [matrixData, page, rowsPerPage]);

  const isDisabled = isLoading || isExporting || !rawLogs || rawLogs.length === 0;

  // ── Render ───────────────────────────────────────────────────────────────────
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

        {/* ── Split Export Button ── */}
        <ButtonGroup
          variant="contained"
          disabled={isDisabled}
          sx={{
            borderRadius: 2,
            boxShadow: "0 4px 14px rgba(16,185,129,0.35)",
            "& .MuiButtonGroup-grouped": { border: "none !important" },
          }}
        >
          {/* Main action button */}
          <Button
            startIcon={isExporting ? <CircularProgress size={18} color="inherit" /> : <DownloadIcon />}
            onClick={handleExportAll}
            sx={{
              px: 2.5,
              fontWeight: 700,
              fontSize: "0.875rem",
              textTransform: "none",
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              "&:hover": { background: "linear-gradient(135deg, #059669 0%, #047857 100%)" },
              "&.Mui-disabled": { background: "rgba(0,0,0,0.12)" },
            }}
          >
            {isExporting ? "Exporting…" : "Export"}
          </Button>

          {/* Dropdown arrow */}
          <Tooltip title="Export options">
            <span>
              <IconButton
                id="export-dropdown-btn"
                aria-controls={exportMenuOpen ? "export-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={exportMenuOpen ? "true" : undefined}
                onClick={handleMenuOpen}
                disabled={isDisabled}
                size="small"
                sx={{
                  background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                  color: "white",
                  borderLeft: "1px solid rgba(255,255,255,0.25) !important",
                  px: 0.5,
                  borderRadius: "0 8px 8px 0",
                  "&:hover": { background: "linear-gradient(135deg, #047857 0%, #065f46 100%)" },
                  "&.Mui-disabled": { background: "rgba(0,0,0,0.12)" },
                }}
              >
                <ArrowDropDownIcon />
              </IconButton>
            </span>
          </Tooltip>
        </ButtonGroup>

        {/* ── Dropdown Menu ── */}
        <Menu
          id="export-menu"
          anchorEl={exportMenuAnchor}
          open={exportMenuOpen}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{
            paper: {
              elevation: 8,
              sx: {
                mt: 1,
                minWidth: 220,
                borderRadius: 2.5,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
              },
            },
          }}
        >
          <MenuItem onClick={handleExportAll} sx={{ py: 1.5, px: 2 }}>
            <ListItemIcon>
              <DownloadIcon fontSize="small" sx={{ color: "success.main" }} />
            </ListItemIcon>
            <ListItemText
              primary="Export All"
              secondary="Export all employees"
              primaryTypographyProps={{ fontWeight: 600, fontSize: "0.875rem" }}
              secondaryTypographyProps={{ fontSize: "0.75rem" }}
            />
          </MenuItem>

          <Divider />

          <MenuItem onClick={handleOpenSelectionDialog} sx={{ py: 1.5, px: 2 }}>
            <ListItemIcon>
              <PeopleIcon fontSize="small" sx={{ color: "primary.main" }} />
            </ListItemIcon>
            <ListItemText
              primary="Export Specific Employees"
              secondary="Choose who to include"
              primaryTypographyProps={{ fontWeight: 600, fontSize: "0.875rem" }}
              secondaryTypographyProps={{ fontSize: "0.75rem" }}
            />
          </MenuItem>
        </Menu>
      </Box>

      {/* Summary Cards */}
      <ReportsSummary
        totalEmployees={totalEmployees}
        totalProjects={totalProjects}
        totalHours={totalHours}
        isLoading={isLoading}
      />

      {/* Filters */}
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

      {/* ── Employee Selection Dialog ── */}
      <Dialog
        open={selectionDialogOpen}
        onClose={() => setSelectionDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            color: "white",
            fontWeight: 800,
            fontSize: "1rem",
            py: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <PeopleIcon fontSize="small" />
          Select Employees to Export
          <Chip
            label={`${checkedEmployeeIds.size} / ${allEmployees.length}`}
            size="small"
            sx={{
              ml: "auto",
              bgcolor: "rgba(255,255,255,0.25)",
              color: "white",
              fontWeight: 700,
              fontSize: "0.75rem",
            }}
          />
        </DialogTitle>

        {/* Select / Deselect all toolbar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 2,
            py: 1,
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: "rgba(0,0,0,0.02)",
          }}
        >
          <Tooltip title="Select all">
            <IconButton size="small" onClick={selectAll}>
              <SelectAllIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Deselect all">
            <IconButton size="small" onClick={deselectAll}>
              <DeselectIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Typography variant="caption" color="text.secondary" sx={{ ml: "auto", fontWeight: 600 }}>
            {checkedEmployeeIds.size === allEmployees.length ? "All selected" : `${checkedEmployeeIds.size} selected`}
          </Typography>
        </Box>

        <DialogContent dividers sx={{ p: 0, maxHeight: 360 }}>
          <List dense disablePadding>
            {allEmployees.map((emp) => (
              <ListItem key={emp.id} disablePadding>
                <ListItemButton
                  onClick={() => toggleEmployee(emp.id)}
                  sx={{
                    px: 2,
                    py: 0.75,
                    "&:hover": { bgcolor: "rgba(16,185,129,0.06)" },
                  }}
                >
                  <Checkbox
                    edge="start"
                    checked={checkedEmployeeIds.has(emp.id)}
                    tabIndex={-1}
                    disableRipple
                    size="small"
                    sx={{
                      color: "success.main",
                      "&.Mui-checked": { color: "success.main" },
                      mr: 1,
                    }}
                  />
                  <ListItemText
                    primary={emp.name}
                    primaryTypographyProps={{ fontWeight: 500, fontSize: "0.875rem" }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>

        <DialogActions sx={{ px: 2.5, py: 2, gap: 1 }}>
          <Button
            onClick={() => setSelectionDialogOpen(false)}
            variant="outlined"
            size="small"
            sx={{ borderRadius: 2, fontWeight: 600, textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExportSelected}
            variant="contained"
            size="small"
            disabled={checkedEmployeeIds.size === 0 || isExporting}
            startIcon={isExporting ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
            sx={{
              borderRadius: 2,
              fontWeight: 700,
              textTransform: "none",
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              "&:hover": { background: "linear-gradient(135deg, #059669 0%, #047857 100%)" },
            }}
          >
            Export {checkedEmployeeIds.size > 0 ? `(${checkedEmployeeIds.size})` : ""}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
