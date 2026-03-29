import { useAuthStore } from "@/stores/auth";
import { useEmployees } from "@/hooks/useEmployees";
import { useDepartments } from "@/hooks/useDepartments";
import { usePositions } from "@/hooks/usePositions";
import { Box, Card, CardContent, Typography, Grid } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import BusinessIcon from "@mui/icons-material/Business";
import WorkIcon from "@mui/icons-material/Work";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

const statConfig = [
  {
    title: "Employees",
    icon: <PeopleIcon />,
    description: "Total team members",
    gradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
  },
  {
    title: "Departments",
    icon: <BusinessIcon />,
    description: "Active departments",
    gradient: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
  },
  {
    title: "Positions",
    icon: <WorkIcon />,
    description: "Job positions",
    gradient: "linear-gradient(135deg, #06b6d4, #0891b2)",
  },
];

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const { data: employeesData } = useEmployees();
  const { data: departmentsData } = useDepartments();
  const { data: positionsData } = usePositions();

  const values = [
    employeesData?.length ?? "—",
    departmentsData?.length ?? "—",
    positionsData?.length ?? "—",
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h1">Dashboard</Typography>
        <Typography variant="body2" color="text.secondary">
          Welcome back, {user?.username}! Here's an overview of your
          organization.
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        {statConfig.map((stat, i) => (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={stat.title}>
            <Card
              sx={{
                position: "relative",
                overflow: "hidden",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                },
                transition: "all 0.2s ease",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    {stat.title}
                  </Typography>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      background: stat.gradient,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
                <Typography
                  variant="h3"
                  fontWeight={700}
                  sx={{ fontSize: "2rem" }}
                >
                  {values[i]}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    mt: 1,
                  }}
                >
                  <TrendingUpIcon
                    sx={{ fontSize: 16, color: "success.main" }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {stat.description}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
