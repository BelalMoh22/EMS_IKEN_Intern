import { useState, useMemo } from "react";
import { format } from "date-fns";
import { useDailyLogs } from "@/hooks/useWorkLogs";
import { DataTable, type Column } from "@/components/shared/DataTable";
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import type { DailyWorkLogDTO } from "@/types/worklog";
import WorkLogDayViewDialog from "./WorkLogDayViewDialog";
import WorkLogDayFormDialog from "./WorkLogDayFormDialog";
import WorkLogQuickAddDialog from "./WorkLogQuickAddDialog";

export default function EmployeeWorkLogsPage() {
  const { data, isLoading } = useDailyLogs();

  const [viewDate, setViewDate] = useState<string | null>(null);
  const [editDate, setEditDate] = useState<string | null>(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Sort by latest date
  const sortedData = useMemo(() => {
    if (!data) return [];
    return [...data].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [data]);

  const pagedData = sortedData.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );

  const columns: Column<DailyWorkLogDTO>[] = [
    {
      header: "Date",
      cell: (row) => (
        <Typography variant="body2" fontWeight={500}>
          {format(new Date(row.date), "EEE, dd MMM yyyy")}
        </Typography>
      ),
    },
    {
      header: "Total Hours",
      cell: (row) => (
        <Chip
          label={`${row.totalHours}h`}
          size="small"
          sx={{
            fontWeight: 600,
            bgcolor:
              row.totalHours > 8
                ? "rgba(245, 158, 11, 0.12)"
                : "rgba(34, 197, 94, 0.12)",
            color: row.totalHours > 8 ? "#d97706" : "#16a34a",
          }}
        />
      ),
    },
    {
      header: "Projects",
      cell: (row) => (
        <Chip
          label={row.projectsCount}
          size="small"
          sx={{
            fontWeight: 600,
            bgcolor: "rgba(59, 130, 246, 0.1)",
            color: "#2563eb",
          }}
        />
      ),
    },
    {
      header: "Actions",
      cell: (row) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                setViewDate(format(new Date(row.date), "yyyy-MM-dd"));
              }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Day">
            <IconButton
              size="small"
              color="secondary"
              onClick={(e) => {
                e.stopPropagation();
                setEditDate(format(new Date(row.date), "yyyy-MM-dd"));
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography variant="h1">Work Logs</Typography>
          <Typography variant="body2" color="text.secondary">
            Track your daily work across projects
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setQuickAddOpen(true)}
          >
            Quick Add
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setEditDate("new")}
            sx={{
              background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              "&:hover": {
                background: "linear-gradient(135deg, #2563eb, #1e40af)",
              },
            }}
          >
            Add Day Log
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <DataTable
        columns={columns}
        data={pagedData}
        loading={isLoading}
        page={page}
        totalCount={sortedData.length}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={(rows) => {
          setRowsPerPage(rows);
          setPage(0);
        }}
      />

      {/* View Day Details Dialog */}
      {viewDate && (
        <WorkLogDayViewDialog
          date={viewDate}
          onClose={() => setViewDate(null)}
          onEdit={() => {
            setEditDate(viewDate);
            setViewDate(null);
          }}
        />
      )}

      {/* Edit / Create Day Form Dialog */}
      {editDate && (
        <WorkLogDayFormDialog
          date={editDate === "new" ? null : editDate}
          onClose={() => setEditDate(null)}
        />
      )}

      {/* Quick Add Dialog */}
      <WorkLogQuickAddDialog
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
      />
    </Box>
  );
}
