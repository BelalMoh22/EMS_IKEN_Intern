import { Grid, Card, CardContent, Typography, Box, Skeleton } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import FolderSpecialIcon from "@mui/icons-material/FolderSpecial";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

interface Props {
  totalEmployees: number;
  totalProjects: number;
  totalHours: number;
  isLoading: boolean;
}

export const ReportsSummary = ({
  totalEmployees,
  totalProjects,
  totalHours,
  isLoading,
}: Props) => {
  const cards = [
    {
      title: "Active Employees",
      value: totalEmployees,
      icon: <PeopleIcon sx={{ color: "#3b82f6" }} />,
      color: "rgba(59, 130, 246, 0.1)",
    },
    {
      title: "Active Projects",
      value: totalProjects,
      icon: <FolderSpecialIcon sx={{ color: "#10b981" }} />,
      color: "rgba(16, 185, 129, 0.1)",
    },
    {
      title: "Total Hours",
      value: `${totalHours}h`,
      icon: <AccessTimeIcon sx={{ color: "#f59e0b" }} />,
      color: "rgba(245, 158, 11, 0.1)",
      highlight: true,
    },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {cards.map((card, index) => (
        <Grid item xs={12} sm={4} key={index}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
              border: "1px solid",
              borderColor: card.highlight ? "#f59e0b" : "divider",
            }}
          >
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, p: 3 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: card.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {card.icon}
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  {card.title}
                </Typography>
                {isLoading ? (
                  <Skeleton width={60} height={40} />
                ) : (
                  <Typography variant="h5" fontWeight={800}>
                    {card.value}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
