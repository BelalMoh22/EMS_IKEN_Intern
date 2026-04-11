import { Box, Typography, Stack, Paper } from "@mui/material";
import { LeaderboardRow } from "./LeaderboardRow";

interface EmployeeContribution {
  employeeId: number;
  employeeName: string;
  totalHours: number;
}

interface LeaderboardListProps {
  employees: EmployeeContribution[];
  totalProjectHours: number;
  projectId: number;
  offset?: number;
}

export const LeaderboardList = ({ 
  employees, 
  totalProjectHours, 
  projectId,
  offset = 0 
}: LeaderboardListProps) => {
  if (employees.length === 0) {
    return (
      <Paper
        sx={{
          p: 4,
          textAlign: "center",
          bgcolor: "background.paper",
          borderRadius: 3,
          border: "1px dashed",
          borderColor: "divider",
        }}
      >
        <Typography color="text.secondary">
          No employees found matching your search.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
        {/* Header Row */}
        <Box 
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            px: 2, 
            py: 1.5, 
            bgcolor: "rgba(0,0,0,0.02)", 
            borderBottom: "1px solid", 
            borderColor: "divider",
            gap: 2
          }}
        >
          <Typography variant="caption" sx={{ width: 50, fontWeight: 700, color: "text.secondary" }}>RANK</Typography>
          <Typography variant="caption" sx={{ flex: 1, minWidth: 200, fontWeight: 700, color: "text.secondary" }}>EMPLOYEE</Typography>
          <Typography variant="caption" sx={{ width: { md: 200, lg: 300 }, display: { xs: "none", md: "block" }, fontWeight: 700, color: "text.secondary" }}>CONTRIBUTION</Typography>
          <Typography variant="caption" sx={{ width: 60, flexShrink: 0, textAlign: "right", display: { xs: "none", sm: "block" }, fontWeight: 700, color: "text.secondary" }}>%</Typography>
          <Typography variant="caption" sx={{ width: 80, flexShrink: 0, textAlign: "right", fontWeight: 700, color: "text.secondary" }}>HOURS</Typography>
          <Box sx={{ width: 80, flexShrink: 0 }} /> {/* Spacer for View button */}
        </Box>
        <Stack>
          {employees.map((emp, index) => (
            <LeaderboardRow
              key={emp.employeeId}
              rank={offset + index + 1}
              employee={emp}
              projectId={projectId}
              percentage={
                totalProjectHours === 0 
                  ? 0 
                  : (emp.totalHours / totalProjectHours) * 100
              }
            />
          ))}
        </Stack>
      </Paper>
    </Box>
  );
};
