import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Tooltip,
  Skeleton,
  TablePagination,
} from "@mui/material";

export type MatrixData = {
  [employeeId: number]: {
    employeeName: string;
    totalHours: number;
    projects: {
      [projectId: number]: number; // hours
    };
  };
};

export type ProjectMeta = {
  id: number;
  name: string;
  totalHours: number;
};

interface Props {
  projects: ProjectMeta[];
  matrixData: MatrixData;
  isLoading: boolean;
  page: number;
  totalCount: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
}

export const ReportsTable = ({
  projects,
  matrixData,
  isLoading,
  page,
  totalCount,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: Props) => {
  const employees = Object.values(matrixData);
  
  if (isLoading) {
    return (
      <Paper sx={{ width: "100%", overflow: "hidden", borderRadius: 3 }}>
        <Box sx={{ p: 3 }}>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} animation="wave" height={50} sx={{ mb: 1 }} />
          ))}
        </Box>
      </Paper>
    );
  }

  if (employees.length === 0) {
    return (
      <Paper sx={{ width: "100%", p: 8, textAlign: "center", borderRadius: 3, bgcolor: "rgba(0,0,0,0.01)" }}>
        <Typography variant="h6" color="text.secondary">
          No report data available for this period
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3,
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          overflowX: "auto",
        }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="reports table">
          <TableHead>
            <TableRow sx={{ bgcolor: "rgba(0,0,0,0.02)" }}>
              <TableCell
                sx={{
                  position: "sticky",
                  left: 0,
                  background: "#f8fafc",
                  zIndex: 2,
                  borderRight: "1px solid",
                  borderColor: "divider",
                  fontWeight: 700,
                  minWidth: 150,
                }}
              >
                Employee
              </TableCell>
              {projects.map((proj) => (
                <TableCell
                  key={proj.id}
                  align="center"
                  sx={{ fontWeight: 700, minWidth: 120 }}
                >
                  {proj.name}
                </TableCell>
              ))}
              <TableCell
                align="center"
                sx={{
                  fontWeight: 800,
                  minWidth: 120,
                  bgcolor: "rgba(59, 130, 246, 0.05)",
                }}
              >
                Total Hours
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((emp) => (
              <TableRow key={emp.employeeName} hover>
                <TableCell
                  component="th"
                  scope="row"
                  sx={{
                    position: "sticky",
                    left: 0,
                    background: "#fff",
                    zIndex: 1,
                    borderRight: "1px solid",
                    borderColor: "divider",
                    fontWeight: 600,
                  }}
                >
                  {emp.employeeName}
                </TableCell>

                {projects.map((proj) => {
                  const hours = emp.projects[proj.id] || 0;
                  const hasHours = hours > 0;

                  return (
                    <Tooltip
                      key={proj.id}
                      title={hasHours ? `${hours} hours in ${proj.name}` : ""}
                    >
                      <TableCell
                        align="center"
                        sx={{
                          bgcolor: hasHours
                            ? "rgba(59, 130, 246, 0.1)"
                            : "inherit",
                          fontWeight: hasHours ? 600 : 400,
                          color: hasHours ? "primary.dark" : "text.secondary",
                          transition: "background-color 0.2s",
                          "&:hover": {
                            bgcolor: hasHours
                              ? "rgba(59, 130, 246, 0.2)"
                              : "rgba(0,0,0,0.02)",
                          },
                        }}
                      >
                        {hours}h
                      </TableCell>
                    </Tooltip>
                  );
                })}

                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 800,
                    bgcolor: "rgba(59, 130, 246, 0.05)",
                    color: "primary.main",
                  }}
                >
                  {emp.totalHours}h
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableHead>
            {/* Footer Row */}
            <TableRow sx={{ bgcolor: "rgba(0,0,0,0.02)" }}>
              <TableCell
                sx={{
                  position: "sticky",
                  left: 0,
                  background: "#f8fafc",
                  zIndex: 2,
                  borderRight: "1px solid",
                  borderColor: "divider",
                  fontWeight: 800,
                }}
              >
                Project Totals
              </TableCell>
              {projects.map((proj) => (
                <TableCell
                  key={proj.id}
                  align="center"
                  sx={{ fontWeight: 800, color: "text.primary" }}
                >
                  {proj.totalHours}h
                </TableCell>
              ))}
              <TableCell
                align="center"
                sx={{
                  fontWeight: 900,
                  fontSize: "1.1rem",
                  bgcolor: "rgba(59, 130, 246, 0.1)",
                  color: "primary.main",
                }}
              >
                {projects.reduce((sum, p) => sum + p.totalHours, 0)}h
              </TableCell>
            </TableRow>
          </TableHead>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        onRowsPerPageChange={(e) =>
          onRowsPerPageChange(parseInt(e.target.value, 10))
        }
        sx={{
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          borderRadius: 3,
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
            fontSize: "0.875rem",
            color: "text.secondary",
          },
        }}
      />
    </Box>
  );
};
