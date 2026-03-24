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
import HomeIcon from "@mui/icons-material/Home";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import type { EmployeeProfile } from "@/types";

const roleColors: Record<string, string> = {
  Admin: "#7c3aed",
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
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 1.5 }}>
      <Box sx={{ color: "text.secondary", display: "flex" }}>{icon}</Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
          {label}
        </Typography>
        {loading ? (
          <Skeleton width={120} />
        ) : (
          <Typography variant="body2" fontWeight={500}>
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
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 900, mx: "auto" }}>
      {/* Header Card */}
      <Card
        sx={{
          background: `linear-gradient(135deg, ${roleBg}15 0%, ${roleBg}08 100%)`,
          border: `1px solid ${roleBg}30`,
          overflow: "visible",
          position: "relative",
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "center", sm: "flex-start" },
              gap: 3,
            }}
          >
            {/* Avatar */}
            <Avatar
              sx={{
                width: 96,
                height: 96,
                bgcolor: roleBg,
                fontSize: "2rem",
                fontWeight: 700,
                boxShadow: `0 8px 32px ${roleBg}40`,
                border: "4px solid white",
              }}
            >
              {initials}
            </Avatar>

            {/* Info */}
            <Box
              sx={{
                flex: 1,
                textAlign: { xs: "center", sm: "left" },
              }}
            >
              <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
                {myEmployee
                  ? `${myEmployee.firstName} ${myEmployee.lastname}`
                  : user?.username ?? "User"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                {positionName ?? "Position not assigned"}
                {departmentName ? ` · ${departmentName}` : ""}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, justifyContent: { xs: "center", sm: "flex-start" }, flexWrap: "wrap" }}>
                <Chip
                  label={user?.role ?? "Employee"}
                  size="small"
                  sx={{
                    bgcolor: roleBg,
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    px: 1,
                  }}
                />
                {myEmployee && (
                  <Chip
                    label={myEmployee.status === 1 ? "Active" : myEmployee.status === 2 ? "Inactive" : myEmployee.status === 3 ? "Suspended" : "Terminated"}
                    size="small"
                    variant="outlined"
                    color={myEmployee.status === 1 ? "success" : "default"}
                    sx={{ fontWeight: 500 }}
                  />
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Detail Cards */}
      <Grid container spacing={3}>
        {/* Personal Info */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <PersonIcon color="primary" />
                <Typography variant="h5">Personal Information</Typography>
              </Box>
              <Divider sx={{ mb: 1 }} />
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
              <InfoRow
                icon={<EmailIcon fontSize="small" />}
                label="Email"
                value={myEmployee?.email}
                loading={isLoading}
              />
              <InfoRow
                icon={<PhoneIcon fontSize="small" />}
                label="Phone Number"
                value={myEmployee?.phoneNumber}
                loading={isLoading}
              />
              <InfoRow
                icon={<CalendarMonthIcon fontSize="small" />}
                label="Date of Birth"
                value={
                  myEmployee?.dateOfBirth
                    ? new Date(myEmployee.dateOfBirth).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                    : undefined
                }
                loading={isLoading}
              />
              <InfoRow
                icon={<HomeIcon fontSize="small" />}
                label="Address"
                value={myEmployee?.address}
                loading={isLoading}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Job Info */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <WorkIcon color="primary" />
                <Typography variant="h5">Job Information</Typography>
              </Box>
              <Divider sx={{ mb: 1 }} />
              <InfoRow
                icon={<WorkIcon fontSize="small" />}
                label="Position"
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
                label="Hire Date"
                value={
                  myEmployee?.hireDate
                    ? new Date(myEmployee.hireDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                    : undefined
                }
                loading={isLoading}
              />
              <InfoRow
                icon={<AttachMoneyIcon fontSize="small" />}
                label="Salary"
                value={
                  myEmployee?.salary
                    ? `$${myEmployee.salary.toLocaleString()}`
                    : undefined
                }
                loading={isLoading}
              />
              <InfoRow
                icon={<BadgeIcon fontSize="small" />}
                label="National ID"
                value={myEmployee?.nationalId}
                loading={isLoading}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Account Info */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <SecurityIcon color="primary" />
                <Typography variant="h5">Account Information</Typography>
              </Box>
              <Divider sx={{ mb: 1 }} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <InfoRow
                    icon={<PersonIcon fontSize="small" />}
                    label="Username"
                    value={user?.username}
                    loading={false}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <InfoRow
                    icon={<SecurityIcon fontSize="small" />}
                    label="Role"
                    value={user?.role}
                    loading={false}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <InfoRow
                    icon={<BadgeIcon fontSize="small" />}
                    label="User ID"
                    value={user?.id}
                    loading={false}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
