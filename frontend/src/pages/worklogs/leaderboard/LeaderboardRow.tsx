import { 
  Box, 
  Typography, 
  Avatar, 
  LinearProgress, 
  Button, 
  Stack, 
  Tooltip 
} from "@mui/material";
import { useNavigate } from "react-router-dom";

interface EmployeeContribution {
  employeeId: number;
  employeeName: string;
  totalHours: number;
}

interface LeaderboardRowProps {
  rank: number;
  employee: EmployeeContribution;
  percentage: number;
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

export const LeaderboardRow = ({ rank, employee, percentage, projectId }: LeaderboardRowProps) => {
  const navigate = useNavigate();
  const avatarColor = stringToColor(employee.employeeName);

  return (
    <Box
      onClick={() => 
        navigate(`/worklogs/projects/${projectId}/employees/${employee.employeeId}/report`)
      }
      sx={{
        display: "flex",
        alignItems: "center",
        p: 2,
        gap: 2,
        borderRadius: 2,
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          bgcolor: "rgba(0, 0, 0, 0.04)",
          transform: "translateX(4px)",
        },
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      {/* Column 1: Rank */}
      <Box sx={{ width: 50, flexShrink: 0 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            color: "text.secondary",
          }}
        >
          #{rank}
        </Typography>
      </Box>

      {/* Column 2: Avatar & Name */}
      <Box sx={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", gap: 2 }}>
        <Avatar
          sx={{
            bgcolor: avatarColor,
            width: 36,
            height: 36,
            fontSize: "0.8rem",
            fontWeight: 600,
          }}
        >
          {getInitials(employee.employeeName)}
        </Avatar>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {employee.employeeName}
        </Typography>
      </Box>

      <Box sx={{ width: { md: 200, lg: 300 }, display: { xs: "none", md: "block" }, flexShrink: 0 }}>
        <Tooltip title={`${employee.totalHours}h (${percentage.toFixed(1)}%)`} arrow>
          <LinearProgress
            variant="determinate"
            value={percentage}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: "rgba(0,0,0,0.05)",
              "& .MuiLinearProgress-bar": {
                borderRadius: 3,
                bgcolor: avatarColor,
              },
            }}
          />
        </Tooltip>
      </Box>

      {/* Column 4: Percentage Label */}
      <Box sx={{ width: 60, flexShrink: 0, textAlign: "right", display: { xs: "none", sm: "block" } }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {Math.round(percentage)}%
        </Typography>
      </Box>

      {/* Column 5: Hours */}
      <Box sx={{ width: 80, flexShrink: 0, textAlign: "right" }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {employee.totalHours}h
        </Typography>
      </Box>

      {/* Column 6: View Details Button */}
      <Box sx={{ width: 80, flexShrink: 0, textAlign: "right" }}>
        <Button
          variant="text"
          size="small"
          sx={{ 
            minWidth: "auto",
            fontWeight: 600
          }}
        >
          View
        </Button>
      </Box>
    </Box>
  );
};
