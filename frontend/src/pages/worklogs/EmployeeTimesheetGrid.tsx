import { useState, useMemo, useEffect, useRef, useCallback } from "react";
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
  TextField,
  IconButton,
  Tooltip,
  CircularProgress,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Add as AddIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  ChevronLeft,
  ChevronRight,
  EventNote as EventNoteIcon,
  DeleteSweep as DeleteSweepIcon,
} from "@mui/icons-material";
import { format, addMonths, subMonths, parseISO } from "date-fns";
import { useTimesheet } from "@/hooks/useTimesheet";
import { getDaysInMonth, formatCellDate, calculateTotals } from "@/utils/timesheetUtils";
import { useProjects } from "@/hooks/useProjects";
import { useSettings } from "@/hooks/useWorkLogs";
import { Alert, AlertTitle, Collapse } from "@mui/material";
import { extractErrorMessage } from "@/utils/handleApiErrors";
import { useWorkLogStore } from "@/stores/workLogStore";
import React from "react";

// Shared static styles to prevent re-renders from inline objects
const HEADER_CELL_STYLE = { 
  fontWeight: 800, bgcolor: "#f1f5f9", position: "sticky", top: 0, zIndex: 20, 
  borderRight: "2px solid #e2e8f0", borderBottom: "2px solid #e2e8f0" 
};
const STICKY_COL_STYLE = { 
  fontWeight: 600, color: "text.primary", bgcolor: "white", position: "sticky", 
  left: 0, zIndex: 2, borderRight: "2px solid #f1f5f9", borderBottom: "1px solid #f1f5f9",
  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
};
const TOTAL_COL_STYLE = { 
  fontWeight: 800, bgcolor: "#f8fafc", color: "primary.main", position: "sticky", 
  right: 0, zIndex: 2, borderLeft: "2px solid #f1f5f9", borderBottom: "1px solid #f1f5f9" 
};

/**
 * Lightweight Cell Component
 */
const TimesheetCell = React.memo(({ 
  pid, 
  dayStr, 
  val, 
  isToday,
  onChange 
}: { 
  pid: number; 
  dayStr: string; 
  val: number | undefined; 
  isToday: boolean;
  onChange: (pid: number, dStr: string, v: number) => void 
}) => {
  const [localVal, setLocalVal] = useState<string>(val && val !== 0 ? val.toString() : "");

  useEffect(() => {
    setLocalVal(val && val !== 0 ? val.toString() : "");
  }, [val]);

  // Use 100ms debounce so errors/totals update "instantly" as requested
  useEffect(() => {
    const v = parseFloat(localVal);
    const numericVal = isNaN(v) ? 0 : v;
    
    if (numericVal === val) return;

    const timer = setTimeout(() => {
        onChange(pid, dayStr, numericVal);
    }, 100);

    return () => clearTimeout(timer);
  }, [localVal, pid, dayStr, onChange, val]);

  return (
    <TableCell 
      sx={{ 
        p: 0, borderRight: "1px solid #e2e8f0", borderBottom: "1px solid #f1f5f9",
        width: 80, minWidth: 80, maxWidth: 80, height: 48, textAlign: "center",
        bgcolor: isToday ? "rgba(59, 130, 246, 0.04)" : "inherit",
      }}
    >
      <TextField
        type="number"
        variant="standard"
        value={localVal}
        onChange={(e) => setLocalVal(e.target.value)}
        inputProps={{ 
          min: 0, max: 24, step: 0.5,
          style: { textAlign: "center", fontSize: "0.875rem", padding: "12px 0", cursor: "pointer" } 
        }}
        InputProps={{ disableUnderline: true }}
        sx={{ width: "100%", height: "100%", "&:focus-within": { bgcolor: "primary.50" } }}
      />
    </TableCell>
  );
});

/**
 * Memoized Row Component
 * This is CRITICAL for performance. Only re-renders if this specific project's data changes.
 */
const TimesheetRow = React.memo(({
  pid,
  name,
  days,
  rowData,
  rowTotal,
  onCellChange
}: {
  pid: number;
  name: string;
  days: Date[];
  rowData: Record<string, number>;
  rowTotal: number;
  onCellChange: (pid: number, dStr: string, v: number) => void;
}) => {
  return (
    <TableRow sx={{ "&:hover": { bgcolor: "rgba(241, 245, 249, 0.5)" } }}>
      <TableCell sx={STICKY_COL_STYLE} style={{ width: 200, minWidth: 200 }} title={name}>
        {name}
      </TableCell>
      {days.map((day) => {
        const dStr = formatCellDate(day);
        return (
          <TimesheetCell
            key={dStr}
            pid={pid}
            dayStr={dStr}
            val={rowData[dStr]}
            isToday={dStr === formatCellDate(new Date())}
            onChange={onCellChange}
          />
        );
      })}
      <TableCell align="center" sx={TOTAL_COL_STYLE}>
        {rowTotal || ""}
      </TableCell>
    </TableRow>
  );
});

export default function EmployeeTimesheetGrid() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const todayRef = useRef<HTMLTableCellElement>(null);

  const days = useMemo(() => getDaysInMonth(selectedDate), [selectedDate]);
  const { data: settings, isLoading: isLoadingSettings } = useSettings();
  const {
    editedData,
    projectNames: existingProjectNames,
    isLoading: isLoadingLogs,
    handleCellChange: internalHandleCellChange,
    hasChanges,
    resetChanges,
    saveChanges,
    isSaving,
    saveError,
    errors,
    warnings,
    isValid
  } = useTimesheet(selectedDate, settings);

  // Memoize cell change to prevent re-rendering the whole table
  const handleCellChange = useCallback((pid: number, dStr: string, val: number) => {
      internalHandleCellChange(pid, parseISO(dStr), val);
  }, [internalHandleCellChange]);
 
  const { hasUnsavedChanges, pendingAction: globalPendingAction, setPendingAction: setGlobalPendingAction } = useWorkLogStore();

  useEffect(() => {
    if (globalPendingAction) {
        setPendingAction(() => globalPendingAction);
        setIsConfirmOpen(true);
        // We don't reset globalPendingAction here because we handle it in handleConfirmDiscard
    }
  }, [globalPendingAction]);

  useEffect(() => {
    if (!isConfirmOpen) {
        setGlobalPendingAction(null);
    }
  }, [isConfirmOpen, setGlobalPendingAction]);

  const { data: openProjects, isLoading: isLoadingProjects } = useProjects({ status: "Open" });

  const isDataLoading = isLoadingLogs || isLoadingProjects || isLoadingSettings;

  const projectNames = useMemo(() => {
    const names = { ...existingProjectNames };
    openProjects?.forEach((p) => {
      names[p.id] = p.name;
    });
    return names;
  }, [existingProjectNames, openProjects]);

  const allProjectIds = useMemo(() => {
    if (isDataLoading) return [];
    const openIds = new Set(openProjects?.map(p => p.id) || []);
    
    // Include project if:
    // 1. It is currently "Open" (so employee can log time)
    // 2. OR it already has some hours logged (even if it's now closed)
    const filteredIds = Object.keys(editedData)
      .map(Number)
      .filter(pid => {
        const rowData = editedData[pid] || {};
        const hasHours = Object.values(rowData).some(h => h > 0);
        return hasHours || openIds.has(pid);
      });

    // Combine and Sort by Project Name for stability
    const finalIds = Array.from(new Set([...filteredIds, ...Array.from(openIds)]));
    
    return finalIds.sort((a, b) => {
      const nameA = (projectNames[a] || "").toLowerCase();
      const nameB = (projectNames[b] || "").toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [editedData, openProjects, isDataLoading, projectNames]);

  const { rowTotals, colTotals } = useMemo(
    () => calculateTotals(editedData, days, allProjectIds),
    [editedData, days, allProjectIds]
  );

  const handlePrevMonth = () => {
    const nextDate = subMonths(selectedDate, 1);
    if (hasChanges) {
      setPendingAction(() => () => setSelectedDate(nextDate));
      setIsConfirmOpen(true);
    } else {
      setSelectedDate(nextDate);
    }
  };

  const handleNextMonth = () => {
    const nextDate = addMonths(selectedDate, 1);
    if (hasChanges) {
      setPendingAction(() => () => setSelectedDate(nextDate));
      setIsConfirmOpen(true);
    } else {
      setSelectedDate(nextDate);
    }
  };

  const handleConfirmDiscard = () => {
    resetChanges();
    if (pendingAction) {
      pendingAction();
    }
    setPendingAction(null);
    setGlobalPendingAction(null);
    setIsConfirmOpen(false);
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  const setGlobalChanges = useWorkLogStore(s => s.setHasUnsavedChanges);

  useEffect(() => {
    setGlobalChanges(hasChanges);
    return () => setGlobalChanges(false);
  }, [hasChanges, setGlobalChanges]);

  useEffect(() => {
    if (!isDataLoading && todayRef.current) {
      todayRef.current.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [isDataLoading, selectedDate]);

  if (isDataLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, p: 3 }}>
      {/* Header & Actions Section */}
      <Stack 
        direction="row" 
        justifyContent="space-between" 
        alignItems="center" 
        flexWrap="wrap" 
        gap={3}
        sx={{ pb: 1, borderBottom: "1px solid", borderColor: "divider" }}
      >
        <Stack direction="row" alignItems="center" gap={2}>
          <EventNoteIcon sx={{ color: "primary.main", fontSize: 32 }} />
          <Typography variant="h1" sx={{ fontSize: "1.75rem !important", fontWeight: 700 }}>
            Work Logs - Timesheet
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="center" gap={2}>
          {/* Month Picker */}
          <Box sx={{ display: "flex", alignItems: "center", bgcolor: "background.paper", borderRadius: 2, p: 0.5, border: "1px solid", borderColor: "divider" }}>
            <IconButton onClick={handlePrevMonth} size="small">
              <ChevronLeft />
            </IconButton>
            <Typography sx={{ px: 2, fontWeight: 700, minWidth: 160, textAlign: "center", color: "text.primary" }}>
              {format(selectedDate, "MMMM yyyy")}
            </Typography>
            <IconButton onClick={handleNextMonth} size="small">
              <ChevronRight />
            </IconButton>
          </Box>

          {/* Action Buttons at Top */}
          <Collapse in={hasChanges} orientation="horizontal" unmountOnExit>
            <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteSweepIcon />}
                onClick={() => {
                    setPendingAction(null);
                    setIsConfirmOpen(true);
                }}
                disabled={isSaving}
                sx={{ borderRadius: 2, fontWeight: 700, px: 2, height: 44, borderWidth: 2, "&:hover": { borderWidth: 2 } }}
            >
                Discard
            </Button>
          </Collapse>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            onClick={saveChanges}
            disabled={!hasChanges || !isValid || isSaving}
            sx={{ borderRadius: 2, fontWeight: 700, height: 44, px: 4, boxShadow: 2 }}
          >
            {isSaving ? "Saving..." : "Save Timesheet"}
          </Button>
        </Stack>
      </Stack>

      {/* Compact Validation Banners */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Collapse in={errors.length > 0}>
          <Alert severity="error" sx={{ borderRadius: 2, fontSize: "0.875rem" }}>
            <AlertTitle sx={{ fontWeight: 700, fontSize: "0.9rem" }}>Invalid Submission</AlertTitle>
            {errors.map((err, i) => <div key={i}>• {err}</div>)}
          </Alert>
        </Collapse>

        <Collapse in={!!saveError}>
          <Alert severity="error" variant="outlined" sx={{ borderRadius: 2, bgcolor: "#fff5f5" }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {extractErrorMessage(saveError, "Server Error")}
            </Typography>
          </Alert>
        </Collapse>

        <Collapse in={warnings.length > 0}>
          <Alert severity="warning" sx={{ borderRadius: 2, fontSize: "0.875rem" }}>
            {warnings.map((err, i) => <div key={i}>• {err}</div>)}
          </Alert>
        </Collapse>
      </Box>

      {/* Grid Container (Page Scroll, Only Horizontal Table Scroll) */}
      <Box sx={{ width: "100%", overflowX: "auto" }}>
        <Table stickyHeader sx={{ tableLayout: "fixed", minWidth: 200 + (days.length * 80) + 100, borderCollapse: "separate" }}>
          <TableHead sx={{ zIndex: 4 }}>
            <TableRow>
              <TableCell 
                sx={{ 
                  fontWeight: 800, 
                  width: 200,
                  minWidth: 200,
                  bgcolor: "#f1f5f9", 
                  position: "sticky", 
                  left: 0, 
                  top: 0,
                  zIndex: 20,
                  borderRight: "2px solid #e2e8f0",
                  borderBottom: "2px solid #e2e8f0"
                }}
              >
                Project Name
              </TableCell>
                {days.map((day) => {
                  const isToday = formatCellDate(day) === formatCellDate(new Date());
                  return (
                    <TableCell
                      key={day.toISOString()}
                      align="center"
                      ref={isToday ? todayRef : null}
                      sx={{
                        fontWeight: 700,
                        width: 80,
                        minWidth: 80,
                        bgcolor: isToday ? "primary.50" : "#f8f9fa",
                        color: isToday ? "primary.main" : "text.secondary",
                        fontSize: "0.75rem",
                        p: 1,
                        borderRight: "1px solid #e2e8f0",
                        borderBottom: "2px solid #e2e8f0"
                      }}
                    >
                      <Box sx={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>{format(day, "EEE").toUpperCase()}</span>
                        <span style={{ fontSize: "1rem", fontWeight: 800 }}>{format(day, "dd")}</span>
                      </Box>
                    </TableCell>
                  );
                })}
              <TableCell 
                align="center" 
                sx={{ 
                  fontWeight: 800, 
                  width: 100,
                  minWidth: 100,
                  bgcolor: "#f1f5f9", 
                  color: "text.primary",
                  position: "sticky",
                  right: 0,
                  top: 0,
                  zIndex: 20,
                  borderLeft: "2px solid #e2e8f0",
                  borderBottom: "2px solid #e2e8f0"
                }}
              >
                Total
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allProjectIds.map((pid) => (
              <TimesheetRow
                key={pid}
                pid={pid}
                name={projectNames[pid] || `Project #${pid}`}
                days={days}
                rowData={editedData[pid] || {}}
                rowTotal={rowTotals[pid] || 0}
                onCellChange={handleCellChange}
              />
            ))}
          </TableBody>
          <TableHead sx={{ position: "sticky", bottom: 0, zIndex: 10 }}>
            <TableRow sx={{ bgcolor: "#f1f5f9" }}>
              <TableCell 
                sx={{ 
                    fontWeight: 800, 
                    position: "sticky", 
                    left: 0, 
                    bgcolor: "#f1f5f9", 
                    zIndex: 20,
                    borderRight: "2px solid #e2e8f0",
                    borderTop: "2px solid #e2e8f0"
                }}
              >
                DAILY TOTAL
              </TableCell>
              {days.map((day) => {
                const dateStr = formatCellDate(day);
                const dayTotal = colTotals[dateStr] || 0;
                return (
                  <TableCell
                    key={dateStr}
                    align="center"
                    sx={{
                      fontWeight: 800,
                      color: dayTotal > 8 ? "error.main" : "text.primary",
                      bgcolor: dayTotal > 8 ? "error.50" : "inherit",
                      borderTop: "2px solid #e2e8f0",
                      width: 80,
                      p: 1
                    }}
                  >
                    {dayTotal || ""}
                  </TableCell>
                );
              })}
              <TableCell 
                align="center" 
                sx={{ 
                  fontWeight: 900, 
                  fontSize: "1.1rem", 
                  bgcolor: "primary.main", 
                  color: "white",
                  position: "sticky",
                  right: 0,
                  zIndex: 20,
                  borderTop: "2px solid #e2e8f0"
                }}
              >
                {Object.values(rowTotals).reduce((a, b) => a + b, 0) || ""}
              </TableCell>
            </TableRow>
          </TableHead>
        </Table>
      </Box>


      {/* Premium Discard Confirmation Dialog */}
      <Dialog
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        PaperProps={{ 
            sx: { 
                borderRadius: 4, 
                p: 2, 
                boxShadow: "0 24px 48px rgba(0,0,0,0.15)",
                maxWidth: 450
            } 
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1 }}>
            <Box sx={{ bgcolor: "error.soft", p: 1, borderRadius: 2, display: "flex", color: "error.main" }}>
                <DeleteSweepIcon />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Discard Changes?
            </Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <Typography sx={{ color: "text.secondary", lineHeight: 1.6 }}>
            You have unsaved modifications in your monthly timesheet. <br/>
            <strong>This action cannot be undone.</strong> Are you sure you want to discard your work and continue?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1, gap: 1.5 }}>
          <Button 
            onClick={() => setIsConfirmOpen(false)} 
            variant="text" 
            sx={{ borderRadius: 2, color: "text.secondary", fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDiscard} 
            variant="contained" 
            color="error"
            size="large"
            sx={{ 
                borderRadius: 2.5, 
                fontWeight: 800, 
                px: 3,
                boxShadow: "0 8px 16px rgba(211, 47, 47, 0.2)"
            }}
          >
            Discard & Proceed
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
