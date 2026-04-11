import { 
  Box, 
  Card, 
  Typography, 
  Avatar, 
  Grid, 
  Stack, 
  alpha
} from "@mui/material";
import { useNavigate } from "react-router-dom";

interface EmployeeContribution {
  employeeId: number;
  employeeName: string;
  totalHours: number;
}

interface TopThreeProps {
  employees: EmployeeContribution[];
  totalProjectHours: number;
  projectId: number;
}

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

const RankCard = ({ 
  employee, 
  rank, 
  percentage, 
  isFirst,
  projectId
}: { 
  employee: EmployeeContribution; 
  rank: number; 
  percentage: number;
  isFirst?: boolean;
  projectId: number;
}) => {
  const navigate = useNavigate();
  
  const rankColors = {
    1: "#FFD700", // Gold
    2: "#C0C0C0", // Silver
    3: "#CD7F32", // Bronze
  };

  const rankLabels = {
    1: "🥇 1st Place",
    2: "🥈 2nd Place",
    3: "🥉 3rd Place",
  };

  const color = rankColors[rank as keyof typeof rankColors];
  const avatarColor = stringToColor(employee.employeeName);

  return (
    <Card
      onClick={() => 
        navigate(`/worklogs/projects/${projectId}/employees/${employee.employeeId}/report`)
      }
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        position: "relative",
        overflow: "visible",
        cursor: "pointer",
        pt: isFirst ? 4 : 3,
        pb: 2,
        px: 2,
        borderRadius: 4,
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: 6
        },
        ...(isFirst && {
          border: `2px solid ${color}`,
          boxShadow: `0 12px 24px ${alpha(color, 0.2)}`,
          transform: "scale(1.03)",
          zIndex: 2,
          "&:hover": {
            transform: "scale(1.03) translateY(-8px)",
            boxShadow: `0 16px 32px ${alpha(color, 0.3)}`,
          },
        })
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -15,
          left: "50%",
          transform: "translateX(-50%)",
          bgcolor: color,
          color: "#000",
          px: 1.5,
          py: 0.25,
          borderRadius: 2,
          fontWeight: 700,
          fontSize: "0.65rem",
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          boxShadow: 2,
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 800, fontSize: "inherit" }}>
          {rankLabels[rank as keyof typeof rankLabels]}
        </Typography>
      </Box>

      <Avatar
        sx={{
          width: isFirst ? 64 : 52,
          height: isFirst ? 64 : 52,
          bgcolor: avatarColor,
          mb: 1.5,
          boxShadow: 3,
          fontSize: isFirst ? "1.25rem" : "1rem",
          fontWeight: 700,
          border: `3px solid ${alpha(color, 0.4)}`,
        }}
      >
        {getInitials(employee.employeeName)}
      </Avatar>

      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.25, fontSize: "0.95rem" }} noWrap>
        {employee.employeeName}
      </Typography>

      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mt: "auto" }}>
        <Typography variant="h6" color="primary" sx={{ fontWeight: 800, fontSize: "1rem" }}>
          {employee.totalHours}h
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, fontSize: "0.75rem" }}>
          ({percentage.toFixed(1)}%)
        </Typography>
      </Stack>
    </Card>
  );
};

export const TopThree = ({ employees, totalProjectHours, projectId }: TopThreeProps) => {
  if (employees.length === 0) return null;

  // We need to reorder them: [2nd, 1st, 3rd] for visual appeal if we have at least 3
  const displayOrder = [];
  if (employees.length >= 2) displayOrder.push({ ...employees[1], rank: 2 });
  if (employees.length >= 1) displayOrder.push({ ...employees[0], rank: 1, isFirst: true });
  if (employees.length >= 3) displayOrder.push({ ...employees[2], rank: 3 });

  // If we have fewer than 3, just show what we have in 1st, 2nd order
  const finalItems = employees.length < 2 ? [{ ...employees[0], rank: 1, isFirst: true }] : displayOrder;

  return (
    <Box sx={{ mb: 6, mt: 2 }}>
      <Grid container spacing={3} sx={{ alignItems: "flex-end", justifyContent: "center" }}>
        {finalItems.map((emp) => (
          <Grid key={emp.employeeId} size={{ xs: 12, sm: finalItems.length === 1 ? 6 : (finalItems.length === 2 ? 6 : 4), md: 4 }}>
            <RankCard
              employee={emp}
              rank={emp.rank!}
              isFirst={emp.isFirst}
              projectId={projectId}
              percentage={
                totalProjectHours === 0 
                  ? 0 
                  : (emp.totalHours / totalProjectHours) * 100
              }
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
