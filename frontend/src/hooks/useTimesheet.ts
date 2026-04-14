import { useState, useMemo, useEffect } from "react";
import { format } from "date-fns";
import { useMonthlyLogs, useSaveTimesheet } from "@/hooks/useWorkLogs";
import { transformLogsToGrid, formatCellDate } from "@/utils/timesheetUtils";
import { isAfter, startOfDay, subDays, parseISO, isEqual } from "date-fns";
import type { TimesheetEntryDTO } from "@/types/worklog";

export const useTimesheet = (selectedDate: Date, settings?: { workLogGracePeriod: number; isDisabled: boolean }) => {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth() + 1;

  const { data: logs, isLoading } = useMonthlyLogs(year, month);
  const saveMutation = useSaveTimesheet();

  const [editedData, setEditedData] = useState<Record<number, Record<string, number>>>({});
  const [originalData, setOriginalData] = useState<Record<number, Record<string, number>>>({});
  const [projectNames, setProjectNames] = useState<Record<number, string>>({});

  useEffect(() => {
    if (logs) {
      const { grid, projectNames: names } = transformLogsToGrid(logs);
      setOriginalData(grid);
      setEditedData(grid);
      setProjectNames(names);
    }
  }, [logs]);

  const handleCellChange = (projectId: number, date: Date, hours: number) => {
    const dateStr = formatCellDate(date);
    setEditedData((prev) => ({
      ...prev,
      [projectId]: {
        ...(prev[projectId] || {}),
        [dateStr]: hours,
      },
    }));
  };

  const { entries, errors, warnings, isValid, hasChanges } = useMemo(() => {
    const errorList: string[] = [];
    const warningList: string[] = [];
    const changeList: TimesheetEntryDTO[] = [];
    const today = startOfDay(new Date());
    const dailyTotals: Record<string, number> = {};

    Object.entries(editedData).forEach(([pidStr, dates]) => {
      const projectId = Number(pidStr);
      Object.entries(dates).forEach(([date, hours]) => {
        const dateObj = parseISO(date);
        const originalHours = originalData[projectId]?.[date] || 0;
        const hasChanged = hours !== originalHours;
        
        dailyTotals[date] = (dailyTotals[date] || 0) + hours;

        // Warnings (Non-blocking)
        if (hours > 0 && isAfter(dateObj, today)) {
            if (!warningList.some(e => e.includes("future dates"))) {
                warningList.push("You are logging hours for future dates.");
            }
        }

        // Errors (Blocking)
        if (settings && !settings.isDisabled && hours > 0 && hasChanged) {
            const graceThreshold = subDays(today, settings.workLogGracePeriod);
            if (dateObj < graceThreshold) {
                const errMsg = `Entry for ${date} is restricted (Exceeds ${settings.workLogGracePeriod}-day grace period). Please contact your manager for approval.`;
                if (!errorList.includes(errMsg)) {
                    errorList.push(errMsg);
                }
            }
        }

        if (hasChanged) {
          changeList.push({ projectId, date, hours });
        }
      });
    });

    Object.entries(dailyTotals).forEach(([date, total]) => {
        if (total > 24) {
            errorList.push(`Total hours for ${date} cannot exceed 24 hours (Current: ${total})`);
        }
    });

    return { 
        entries: changeList, 
        errors: errorList, 
        warnings: warningList,
        isValid: errorList.length === 0,
        hasChanges: changeList.length > 0
    };
  }, [editedData, originalData, settings]);

  const resetChanges = () => {
    setEditedData(originalData);
  };

  const saveChanges = () => {
    if (!hasChanges || !isValid) return;

    if (entries.length > 0) {
      saveMutation.mutate({ entries }, {
          onSuccess: () => {
              setOriginalData(editedData);
          }
      });
    }
  };

  return {
    editedData,
    projectNames,
    isLoading,
    handleCellChange,
    hasChanges,
    resetChanges,
    saveChanges,
    isSaving: saveMutation.isPending,
    saveError: saveMutation.error,
    errors,
    warnings,
    isValid
  };
};
