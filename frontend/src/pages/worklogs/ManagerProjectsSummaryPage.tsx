import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjectsSummary } from "@/hooks/useWorkLogs";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Box, Typography, Button, Chip, IconButton, Tooltip } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import type { ProjectSummaryDTO } from "@/types/worklog";

export default function ManagerProjectsSummaryPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useProjectsSummary();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const sortedData = [...(data ?? [])].sort((a, b) => b.totalHours - a.totalHours);
  const pagedData = sortedData.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );

  const columns: Column<ProjectSummaryDTO>[] = [
    {
      header: "Project Name",
      cell: (row) => (
        <Typography variant="body2" fontWeight={500}>
          {row.projectName}
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
            bgcolor: "rgba(34, 197, 94, 0.12)",
            color: "#16a34a",
          }}
        />
      ),
    },
    {
      header: "Actions",
      cell: (row) => (
        <Tooltip title="View Employees">
          <IconButton
            size="small"
            color="primary"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/worklogs/projects/${row.projectId}/employees`);
            }}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h1">Projects Summary</Typography>
        <Typography variant="body2" color="text.secondary">
          Overview of hours logged across all projects
        </Typography>
      </Box>

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
        onRowClick={(row) =>
          navigate(`/worklogs/projects/${row.projectId}/employees`)
        }
      />
    </Box>
  );
}
