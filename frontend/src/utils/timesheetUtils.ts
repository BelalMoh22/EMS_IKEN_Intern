import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek } from "date-fns";
import type { MonthlyWorkLogDTO } from "@/types/worklog";

/** Returns true for working days (Sunday=0 through Thursday=4). Friday(5) and Saturday(6) are holidays. */
export const isWorkingDay = (date: Date) => {
  const day = date.getDay();
  return day >= 0 && day <= 4; // Sun-Thu
};

export const getDaysInMonth = (date: Date) => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return eachDayOfInterval({ start, end }).filter(isWorkingDay);
};

export const getDaysInWeek = (date: Date) => {
  const start = startOfWeek(date, { weekStartsOn: 0 });
  const end = endOfWeek(date, { weekStartsOn: 0 });
  return eachDayOfInterval({ start, end }).filter(isWorkingDay);
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
  // Since days are already filtered to exclude Fri/Sat holidays,
  // every day in the array is a working day.
  return days.length * hoursPerDay;
};
