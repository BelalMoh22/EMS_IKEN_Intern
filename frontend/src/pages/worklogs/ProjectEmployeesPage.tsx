import { useNavigate, useParams } from "react-router-dom";
import { useProjectEmployees } from "@/hooks/useWorkLogs";
import {
  Box,
  Typography,
  Button,
  Chip,
  Grid,
  Card,
  CardContent,
  Avatar,
  LinearProgress,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

// Helper for avatar colors
const stringToColor = (string: string) => {
  let hash = 0;
  for (let i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

export default function ProjectEmployeesPage() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const pid = Number(projectId);
  const { data, isLoading } = useProjectEmployees(pid);

  const employees = [...(data ?? [])].sort(
    (a, b) => b.totalHours - a.totalHours
  );

  const totalProjectHours = employees.reduce(
    (sum, emp) => sum + emp.totalHours,
    0
  );
  const maxEmployeeHours =
    employees.length > 0 ? employees[0].totalHours : 1;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h1" sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            Project Contributions
            {totalProjectHours > 0 && (
              <Chip
                icon={<TrendingUpIcon />}
                label={`${totalProjectHours}h Total`}
                sx={{
                  bgcolor: "rgba(59, 130, 246, 0.1)",
                  color: "#2563eb",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  "& .MuiChip-icon": { color: "#2563eb" },
                }}
              />
            )}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Visualize and track individual employee effort assigned to this project. Click on an employee to view their detailed report.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/worklogs/projects-summary")}
          sx={{ borderRadius: 2 }}
        >
          Back to Summary
        </Button>
      </Box>

      {/* Content */}
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : employees.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" color="text.secondary">
            No employees have logged hours on this project yet.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {employees.map((emp) => {
            const avatarColor = stringToColor(emp.employeeName);
            const percentageOfTotal =
              totalProjectHours > 0
                ? Math.round((emp.totalHours / totalProjectHours) * 100)
                : 0;

            const percentageOfMax =
              maxEmployeeHours > 0
                ? (emp.totalHours / maxEmployeeHours) * 100
                : 0;

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={emp.employeeId}>
                <Card
                  onClick={() =>
                    navigate(
                      `/worklogs/projects/${pid}/employees/${emp.employeeId}/report`
                    )
                  }
                  sx={{
                    borderRadius: 3,
                    cursor: "pointer",
                    transition: "all 0.2s ease-in-out",
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                      borderColor: avatarColor,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                      <Avatar
                        sx={{
                          bgcolor: avatarColor,
                          width: 56,
                          height: 56,
                          fontWeight: 600,
                          fontSize: "1.2rem",
                        }}
                      >
                        {getInitials(emp.employeeName)}
                      </Avatar>
                      <Box sx={{ overflow: "hidden" }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {emp.employeeName}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 0.5,
                          alignItems: "baseline",
                        }}
                      >
                        <Typography
                          variant="h4"
                          sx={{ fontWeight: 700, color: "text.primary" }}
                        >
                          {emp.totalHours}
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.secondary"
                            sx={{ ml: 0.5, fontWeight: 500 }}
                          >
                            hours
                          </Typography>
                        </Typography>
                        <Chip
                          label={`${percentageOfTotal}% of total`}
                          size="small"
                          sx={{
                            bgcolor: "rgba(16, 185, 129, 0.1)",
                            color: "#059669",
                            fontWeight: 600,
                            fontSize: "0.75rem",
                          }}
                        />
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={percentageOfMax}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: "rgba(0,0,0,0.05)",
                          "& .MuiLinearProgress-bar": {
                            bgcolor: avatarColor,
                            borderRadius: 4,
                          },
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
