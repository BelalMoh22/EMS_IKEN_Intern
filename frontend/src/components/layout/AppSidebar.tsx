import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Avatar,
  Collapse,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import PeopleIcon from "@mui/icons-material/People";
import BusinessIcon from "@mui/icons-material/Business";
import WorkIcon from "@mui/icons-material/Work";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LockResetIcon from "@mui/icons-material/LockReset";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AssessmentIcon from "@mui/icons-material/Assessment";
import FolderSpecialIcon from "@mui/icons-material/FolderSpecial";
import TimerIcon from "@mui/icons-material/Timer";
import SummarizeIcon from "@mui/icons-material/Summarize";
import SettingsIcon from "@mui/icons-material/Settings";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth";
import { useWorkLogStore } from "@/stores/workLogStore";
import type { Role } from "@/types";
import React from "react";

interface NavItem {
  title: string;
  url?: string;
  icon: React.ReactNode;
  roles: Role[];
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    title: "Profile",
    url: "/profile",
    icon: <PersonIcon />,
    roles: ["HR", "Manager", "Employee"],
  },
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: <DashboardIcon />,
    roles: ["HR", "Manager"],
  },
  {
    title: "Employees",
    url: "/employees",
    icon: <PeopleIcon />,
    roles: ["HR", "Manager"],
  },
  {
    title: "Departments",
    url: "/departments",
    icon: <BusinessIcon />,
    roles: ["HR"],
  },
  {
    title: "Positions",
    url: "/positions",
    icon: <WorkIcon />,
    roles: ["HR"],
  },
  // {
  //   title: "Attendance",
  //   url: "/attendance/monthly",
  //   icon: <EventAvailableIcon />,
  //   roles: ["HR"],
  // },
  // {
  //   title: "My Attendance",
  //   url: "/attendance/my",
  //   icon: <CalendarTodayIcon />,
  //   roles: ["Employee", "HR", "Manager"],
  // },
  {
    title: "Projects",
    icon: <FolderSpecialIcon />,
    roles: ["Manager"],
    children: [
      {
        title: "Project Details",
        url: "/projects",
        icon: <SummarizeIcon sx={{ fontSize: "1.1rem" }} />,
        roles: ["Manager"],
      },
      {
        title: "Reports",
        url: "/reports",
        icon: <AssessmentIcon sx={{ fontSize: "1.1rem" }} />,
        roles: ["Manager"],
      },
      {
        title: "System Settings",
        url: "/settings",
        icon: <SettingsIcon sx={{ fontSize: "1.1rem" }} />,
        roles: ["Manager"],
      },
    ],
  },
  {
    title: "My Work Logs",
    url: "/worklogs",
    icon: <TimerIcon />,
    roles: ["Employee", "Manager"],
  },
  {
    title: "Change Password",
    url: "/change-password",
    icon: <LockResetIcon />,
    roles: ["HR", "Manager", "Employee"],
  },
];

interface Props {
  collapsed: boolean;
  width: number;
}

export function AppSidebar({ collapsed, width }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { hasUnsavedChanges, setPendingAction } = useWorkLogStore();

  const handleNav = (url: string) => {
    if (location.pathname === url) return;

    if (hasUnsavedChanges) {
      setPendingAction(() => () => navigate(url));
    } else {
      navigate(url);
    }
  };

  // State for expanded menus
  const [openMenus, setOpenMenus] = React.useState<Record<string, boolean>>({});

  const toggleMenu = (title: string) => {
    setOpenMenus(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const filteredItems = navItems.filter((item) =>
    user ? item.roles.includes(user.role) : false,
  );

  const activeItem = [...filteredItems]
    .flatMap(item => item.children ? [item, ...item.children] : [item])
    .filter(item => item.url)
    .sort((a, b) => (b.url?.length || 0) - (a.url?.length || 0))
    .find((item) => {
      if (location.pathname.startsWith("/worklogs/projects") && item.title === "Project Details") {
        return true;
      }

      if (item.url === "/profile") return location.pathname === item.url;
      return (
        location.pathname === item.url ||
        location.pathname.startsWith(item.url + "/")
      );
    });

  const handleLogout = () => {
    if (hasUnsavedChanges) {
      setPendingAction(() => () => {
        logout();
        navigate("/login");
      });
    } else {
      logout();
      navigate("/login");
    }
  };

  const initials = user?.username
    ? user.username.substring(0, 2).toUpperCase()
    : "??";

  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width,
          transition: "width 0.2s ease",
          overflowX: "hidden",
          bgcolor: "#0f172a",
          color: "#e2e8f0",
          borderRight: "1px solid #1e293b",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: "1px solid #1e293b",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          minHeight: 56,
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1.5,
            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.85rem",
            fontWeight: 700,
            flexShrink: 0,
            boxShadow: "0 4px 12px rgba(59,130,246,0.3)",
          }}
        >
          HR
        </Box>
        {!collapsed && (
          <Box>
            <Typography
              variant="body2"
              fontWeight={700}
              noWrap
              sx={{ color: "#f1f5f9" }}
            >
              HR System
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "#64748b", fontSize: "0.65rem" }}
            >
              Management Portal
            </Typography>
          </Box>
        )}
      </Box>

      {/* User Info */}
      {!collapsed && user && (
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: "1px solid #1e293b",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: "#3b82f6",
              fontSize: "0.75rem",
              fontWeight: 600,
            }}
          >
            {initials}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="body2"
              fontWeight={500}
              noWrap
              sx={{ color: "#f1f5f9", fontSize: "0.8rem" }}
            >
              {user.username}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "#64748b", fontSize: "0.65rem" }}
            >
              {user.role}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Navigation Label */}
      {!collapsed && (
        <Typography
          variant="caption"
          sx={{
            px: 2,
            pt: 2,
            pb: 0.5,
            color: "#475569",
            textTransform: "uppercase",
            letterSpacing: 1.5,
            fontSize: "0.6rem",
            fontWeight: 600,
          }}
        >
          Navigation
        </Typography>
      )}

      {/* Nav Items */}
      <List sx={{ flexGrow: 1, px: 1 }}>
        {filteredItems.map((item) => {
          const hasChildren = item.children && item.children.length > 0;
          const isOpen = openMenus[item.title];
          const isActive = activeItem?.url === item.url ||
            (hasChildren && item.children?.some(c => activeItem?.url === c.url));

          return (
            <React.Fragment key={item.title}>
              <ListItemButton
                onClick={() => {
                  if (hasChildren) {
                    toggleMenu(item.title);
                  } else if (item.url) {
                    handleNav(item.url);
                  }
                }}
                selected={isActive && !hasChildren}
                sx={{
                  borderRadius: 1.5,
                  mb: 0.5,
                  minHeight: 40,
                  justifyContent: collapsed ? "center" : "flex-start",
                  px: collapsed ? 1 : 2,
                  "&.Mui-selected": {
                    bgcolor: "rgba(59,130,246,0.12)",
                    color: "#60a5fa",
                    "& .MuiListItemIcon-root": { color: "#60a5fa" },
                    "&:hover": { bgcolor: "rgba(59,130,246,0.18)" },
                  },
                  "&:hover": { bgcolor: "rgba(255,255,255,0.04)" },
                  transition: "all 0.15s ease",
                }}
              >
                <ListItemIcon
                  sx={{ color: isActive ? "#60a5fa" : "inherit", minWidth: collapsed ? 0 : 36 }}
                >
                  {item.icon}
                </ListItemIcon>
                {!collapsed && (
                  <>
                    <ListItemText
                      primary={item.title}
                      primaryTypographyProps={{
                        fontSize: "0.85rem",
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? "#60a5fa" : "inherit"
                      }}
                    />
                    {hasChildren && (isOpen ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />)}
                  </>
                )}
              </ListItemButton>

              {hasChildren && !collapsed && (
                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children?.map((child) => {
                      const isChildActive = activeItem?.url === child.url;
                      return (
                        <ListItemButton
                          key={child.title}
                          onClick={() => child.url && handleNav(child.url)}
                          selected={isChildActive}
                          sx={{
                            pl: 5,
                            borderRadius: 1.5,
                            mb: 0.5,
                            minHeight: 36,
                            "&.Mui-selected": {
                              bgcolor: "rgba(59,130,246,0.08)",
                              color: "#60a5fa",
                              "& .MuiListItemIcon-root": { color: "#60a5fa" },
                            },
                            "&:hover": { bgcolor: "rgba(255,255,255,0.04)" },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 28, color: "inherit" }}>
                            {child.icon}
                          </ListItemIcon>
                          <ListItemText
                            primary={child.title}
                            primaryTypographyProps={{
                              fontSize: "0.8rem",
                              fontWeight: isChildActive ? 600 : 400,
                            }}
                          />
                        </ListItemButton>
                      );
                    })}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          );
        })}
      </List>

      {/* Footer */}
      <Divider sx={{ borderColor: "#1e293b" }} />
      <List sx={{ px: 1, pb: 1 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 1.5,
            minHeight: 40,
            justifyContent: collapsed ? "center" : "flex-start",
            px: collapsed ? 1 : 2,
            color: "#ef4444",
            "&:hover": { bgcolor: "rgba(239,68,68,0.08)" },
          }}
        >
          <ListItemIcon sx={{ color: "inherit", minWidth: collapsed ? 0 : 36 }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          {!collapsed && (
            <ListItemText
              primary="Logout"
              primaryTypographyProps={{
                fontSize: "0.85rem",
                fontWeight: 500,
              }}
            />
          )}
        </ListItemButton>
      </List>
    </Drawer>
  );
}
