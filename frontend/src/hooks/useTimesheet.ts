import { useState, useMemo, useEffect } from "react";
import { format } from "date-fns";
import { useMonthlyLogs, useSaveTimesheet } from "@/hooks/useWorkLogs";
import { transformLogsToGrid, formatCellDate } from "@/utils/timesheetUtils";
import { isAfter, startOfDay, subDays, parseISO, isEqual } from "date-fns";
import type { TimesheetEntryDTO } from "@/types/worklog";

export const useTimesheet = (days: Date[], settings?: { workLogGracePeriodDays: number; isDeleted: boolean }) => {
  // Determine unique months in the range
  const monthsToFetch = useMemo(() => {
    const list: { year: number; month: number }[] = [];
    days.forEach(d => {
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      if (!list.some(item => item.year === y && item.month === m)) {
        list.push({ year: y, month: m });
      }
    });
    return list;
  }, [days]);

  // For now, the simplest way is to fetch the "main" month to keep logic simple, 
  // but let's at least ensure we fetch enough data if range spans months.
  // Since we use useMonthlyLogs, we'll just fetch based on the first day of the range.
  // Improvement: Backend should ideally support date range query.
  const firstDay = days[0];
  const lastDay = days[days.length - 1];
  
  const { data: logs1, isLoading: isLoading1 } = useMonthlyLogs(firstDay?.getFullYear(), firstDay?.getMonth() + 1);
  const { data: logs2, isLoading: isLoading2 } = useMonthlyLogs(lastDay?.getFullYear(), lastDay?.getMonth() + 1);

  const logs = useMemo(() => {
    if (!logs1) return logs2;
    if (!logs2) return logs1;
    if (logs1 === logs2) return logs1;
    
    // Combine logs, removing duplicates if any (though getMonthlyLogs shouldn't have overlapping data if months are different)
    const combined = [...logs1];
    logs2.forEach(l => {
        if (!combined.some(c => c.projectId === l.projectId && c.date === l.date)) {
            combined.push(l);
        }
    });
    return combined;
  }, [logs1, logs2]);

  const isLoading = isLoading1 || isLoading2;
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
        if (settings && !settings.isDeleted && hours > 0 && hasChanged) {
            const graceThreshold = subDays(today, settings.workLogGracePeriodDays);
            if (dateObj < graceThreshold) {
                const errMsg = `Entry for ${date} is restricted (Exceeds ${settings.workLogGracePeriodDays}-day grace period). Please contact your manager for approval.`;
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

  const saveChanges = (options?: { onSuccess?: () => void; onError?: (error: any) => void }) => {
    if (!hasChanges || !isValid) return;

    if (entries.length > 0) {
      saveMutation.mutate({ entries }, {
          onSuccess: () => {
              setOriginalData(editedData);
              options?.onSuccess?.();
          },
          onError: (error) => {
              options?.onError?.(error);
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
