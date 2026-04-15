import { useAuthStore } from "@/stores/auth";
import { useEmployeeByUserId } from "@/hooks/useEmployees";
import { useDepartments } from "@/hooks/useDepartments";
import { usePositions } from "@/hooks/usePositions";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Divider,
  Grid,
  Skeleton,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import WorkIcon from "@mui/icons-material/Work";
import SecurityIcon from "@mui/icons-material/Security";
import EmailIcon from "@mui/icons-material/Email";
import BadgeIcon from "@mui/icons-material/Badge";
import BusinessIcon from "@mui/icons-material/Business";
import PhoneIcon from "@mui/icons-material/Phone";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import type { EmployeeProfile } from "@/types";

const roleColors: Record<string, string> = {
  HR: "#2563eb",
  Manager: "#059669",
  Employee: "#d97706",
};

function InfoRow({
  icon,
  label,
  value,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number | null | undefined;
  loading?: boolean;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        py: 1.5,
        px: 2,
        borderRadius: 2,
        transition: "all 0.2s",
        "&:hover": {
          bgcolor: "action.hover",
          transform: "translateX(4px)",
        },
      }}
    >
      <Box
        sx={{
          color: "primary.main",
          display: "flex",
          p: 1,
          borderRadius: "12px",
          bgcolor: "primary.main",
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.main}05 100%)`,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", mb: 0.2 }}
        >
          {label}
        </Typography>
        {loading ? (
          <Skeleton width="60%" height={24} />
        ) : (
          <Typography variant="body1" fontWeight={600} color="text.primary">
            {value || "—"}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default function Profile() {
  const user = useAuthStore((s) => s.user);

  // Fetch specific employee strictly tied to this user account
  const { data: myEmployee, isLoading } = useEmployeeByUserId(user?.id);

  const initials = user?.username
    ? user.username.substring(0, 2).toUpperCase()
    : "??";

  const roleBg = roleColors[user?.role ?? "Employee"] ?? "#64748b";

  // Position and Department now come directly from the joined DTO
  const positionName = myEmployee?.positionName;
  const departmentName = myEmployee?.departmentName;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        maxWidth: 1100,
        mx: "auto",
        pb: 6,
      }}
    >
      {/* Header Card with Banner */}
      <Card
        sx={{
          overflow: "visible",
          position: "relative",
          borderRadius: 4,
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          border: "none",
        }}
      >
        {/* Banner */}
        <Box
          sx={{
            height: 160,
            background: `linear-gradient(135deg, ${roleBg} 0%, ${roleBg}dd 100%)`,
            borderTopLeftRadius: "inherit",
            borderTopRightRadius: "inherit",
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "url('https://www.transparenttextures.com/patterns/cubes.png')",
              opacity: 0.1,
            }
          }}
        />
        <CardContent sx={{ pt: 0, px: { xs: 3, md: 5 }, pb: 4 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "center", sm: "flex-end" },
              gap: 3,
              mt: -6,
            }}
          >
            {/* Avatar */}
            <Avatar
              sx={{
                width: 130,
                height: 130,
                bgcolor: roleBg,
                fontSize: "3rem",
                fontWeight: 800,
                boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                border: "6px solid white",
              }}
            >
              {initials}
            </Avatar>

            {/* Info */}
            <Box
              sx={{
                flex: 1,
                textAlign: { xs: "center", sm: "left" },
                mb: 1,
              }}
            >
              <Typography variant="h3" fontWeight={800} sx={{ mb: 0.5, letterSpacing: "-0.5px" }}>
                {myEmployee
                  ? `${myEmployee.firstName} ${myEmployee.lastname}`
                  : (user?.username ?? "User")}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: { xs: "center", sm: "flex-start" }, gap: 1.5, color: "text.secondary" }}>
                <WorkIcon sx={{ fontSize: 18 }} />
                <Typography variant="h6" fontWeight={500} sx={{ opacity: 0.8 }}>
                  {positionName ?? "Explorer"} {departmentName ? `at ${departmentName}` : ""}
                </Typography>
              </Box>
            </Box>

            {/* Quick Actions / Status */}
            <Box sx={{ display: "flex", gap: 1.5, mb: 1 }}>
              <Chip
                label={user?.role ?? "User"}
                sx={{
                  bgcolor: `${roleBg}20`,
                  color: roleBg,
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  px: 1,
                  border: `1px solid ${roleBg}40`,
                }}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Detail Cards Content */}
      <Grid container spacing={4}>
        {/* Main Column */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {/* Personal Info */}
            <Card sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.05)" }}>
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}
                >
                  <Box sx={{ bgcolor: "primary.main", color: "white", p: 1, borderRadius: 2, display: "flex" }}>
                    <PersonIcon />
                  </Box>
                  <Typography variant="h5" fontWeight={700}>Personal Details</Typography>
                </Box>
                <Grid container spacing={1}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InfoRow
                      icon={<BadgeIcon fontSize="small" />}
                      label="Full Name"
                      value={
                        myEmployee
                          ? `${myEmployee.firstName} ${myEmployee.lastname}`
                          : user?.username
                      }
                      loading={isLoading}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InfoRow
                      icon={<EmailIcon fontSize="small" />}
                      label="Work Email"
                      value={myEmployee?.email}
                      loading={isLoading}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InfoRow
                      icon={<PhoneIcon fontSize="small" />}
                      label="Contact Number"
                      value={myEmployee?.phoneNumber}
                      loading={isLoading}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InfoRow
                      icon={<CalendarMonthIcon fontSize="small" />}
                      label="Birth Date"
                      value={
                        myEmployee?.dateOfBirth
                          ? new Date(myEmployee.dateOfBirth).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )
                          : undefined
                      }
                      loading={isLoading}
                    />
                </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.05)" }}>
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}
                >
                  <Box sx={{ bgcolor: "secondary.main", color: "white", p: 1, borderRadius: 2, display: "flex" }}>
                    <SecurityIcon />
                  </Box>
                  <Typography variant="h5" fontWeight={700}>Account Security</Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <InfoRow
                      icon={<PersonIcon fontSize="small" />}
                      label="Username"
                      value={user?.username}
                      loading={false}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        </Grid>

        {/* Sidebar Column */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ height: "100%", borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.05)", bgcolor: "grey.50" }}>
            <CardContent sx={{ p: 4 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 4 }}
              >
                <Box sx={{ bgcolor: "success.main", color: "white", p: 1, borderRadius: 2, display: "flex" }}>
                  <WorkIcon />
                </Box>
                <Typography variant="h5" fontWeight={700}>Employment</Typography>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <InfoRow
                  icon={<WorkIcon fontSize="small" />}
                  label="Official Position"
                  value={positionName}
                  loading={isLoading}
                />
                <InfoRow
                  icon={<BusinessIcon fontSize="small" />}
                  label="Department"
                  value={departmentName}
                  loading={isLoading}
                />
                <InfoRow
                  icon={<CalendarMonthIcon fontSize="small" />}
                  label="Date Joined"
                  value={
                    myEmployee?.hireDate
                      ? new Date(myEmployee.hireDate).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )
                      : undefined
                  }
                  loading={isLoading}
                />
                <Divider sx={{ my: 2, borderStyle: "dashed" }} />
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: "white",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                    border: "1px solid rgba(0,0,0,0.05)",
                    textAlign: "center",
                    mt: 1
                  }}
                >
                  <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: "uppercase" }}>
                    Base Salary
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="primary" sx={{ mt: 1 }}>
                    {myEmployee?.salary
                      ? `$${myEmployee.salary.toLocaleString()}`
                      : "—"}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
