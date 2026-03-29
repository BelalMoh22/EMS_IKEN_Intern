import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Chip,
  Box,
  Avatar,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuthStore } from "@/stores/auth";
import { useNavigate } from "react-router-dom";

const roleColors: Record<string, string> = {
  HR: "#2563eb",
  Manager: "#059669",
  Employee: "#d97706",
};

interface Props {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: Props) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.username
    ? user.username.substring(0, 2).toUpperCase()
    : "??";

  const roleBg = roleColors[user?.role ?? "Employee"] ?? "#64748b";

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Toolbar sx={{ minHeight: 56 }}>
        <IconButton edge="start" onClick={onToggleSidebar} sx={{ mr: 1 }}>
          <MenuIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: roleBg,
              fontSize: "0.75rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
            onClick={() => navigate("/profile")}
          >
            {initials}
          </Avatar>
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <Typography
              variant="body2"
              fontWeight={500}
              sx={{ lineHeight: 1.2 }}
            >
              {user?.username}
            </Typography>
          </Box>
          <Chip
            label={user?.role}
            size="small"
            sx={{
              bgcolor: `${roleBg}18`,
              color: roleBg,
              fontWeight: 600,
              fontSize: "0.7rem",
              height: 24,
            }}
          />
          <Tooltip title="Logout">
            <IconButton
              size="small"
              onClick={handleLogout}
              sx={{ color: "text.secondary" }}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
