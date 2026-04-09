import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProjectEmployees } from "@/hooks/useWorkLogs";
import { DataTable, type Column } from "@/components/shared/DataTable";
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AssessmentIcon from "@mui/icons-material/Assessment";
import type { EmployeeContributionDTO } from "@/types/worklog";

export default function ProjectEmployeesPage() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const pid = Number(projectId);
  const { data, isLoading } = useProjectEmployees(pid);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const sortedData = [...(data ?? [])].sort(
    (a, b) => b.totalHours - a.totalHours
  );
  const pagedData = sortedData.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );

  const columns: Column<EmployeeContributionDTO>[] = [
    {
      header: "Employee Name",
      cell: (row) => (
        <Typography variant="body2" fontWeight={500}>
          {row.employeeName}
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
        <Tooltip title="View Report">
          <IconButton
            size="small"
            color="primary"
            onClick={(e) => {
              e.stopPropagation();
              navigate(
                `/worklogs/projects/${pid}/employees/${row.employeeId}/report`
              );
            }}
          >
            <AssessmentIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography variant="h1">Project Employees</Typography>
          <Typography variant="body2" color="text.secondary">
            Hours breakdown by employee
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/worklogs/projects-summary")}
        >
          Back to Summary
        </Button>
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
          navigate(
            `/worklogs/projects/${pid}/employees/${row.employeeId}/report`
          )
        }
      />
    </Box>
  );
}
