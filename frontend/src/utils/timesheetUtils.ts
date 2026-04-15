import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek } from "date-fns";
import type { MonthlyWorkLogDTO } from "@/types/worklog";

export const getDaysInMonth = (date: Date) => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return eachDayOfInterval({ start, end });
};

export const getDaysInWeek = (date: Date) => {
  const start = startOfWeek(date, { weekStartsOn: 0 });
  const end = endOfWeek(date, { weekStartsOn: 0 });
  return eachDayOfInterval({ start, end });
};

export const formatCellDate = (date: Date) => format(date, "yyyy-MM-dd");

export const transformLogsToGrid = (logs: MonthlyWorkLogDTO[]) => {
  const grid: Record<number, Record<string, number>> = {};
  const projectNames: Record<number, string> = {};

  logs.forEach((log) => {
    if (!grid[log.projectId]) {
      grid[log.projectId] = {};
      projectNames[log.projectId] = log.projectName;
    }
    grid[log.projectId][log.date] = log.hours;
  });

  return { grid, projectNames };
};

export const calculateTotals = (
  grid: Record<number, Record<string, number>>,
  days: Date[],
  projectIds: number[]
) => {
  const rowTotals: Record<number, number> = {};
  const colTotals: Record<string, number> = {};

  projectIds.forEach((pid) => {
    rowTotals[pid] = 0;
    days.forEach((day) => {
      const dateStr = formatCellDate(day);
      const hours = grid[pid]?.[dateStr] || 0;
      rowTotals[pid] += hours;
      colTotals[dateStr] = (colTotals[dateStr] || 0) + hours;
    });
  });

  return { rowTotals, colTotals };
};

export const calculateTargetHours = (days: Date[], hoursPerDay: number = 8) => {
  return days.reduce((acc, day) => {
    const dayOfWeek = day.getDay(); // 0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday
    // Work week is Sunday (0) to Thursday (4)
    const isWorkDay = dayOfWeek >= 0 && dayOfWeek <= 4;
    
    if (isWorkDay) {
      return acc + hoursPerDay;
    }
    return acc;
  }, 0);
};
