import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import { AppSidebar } from "./AppSidebar";
import { Header } from "./Header";

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 64;

export function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppSidebar collapsed={collapsed} width={sidebarWidth} />
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Header onToggleSidebar={() => setCollapsed((prev) => !prev)} />
        <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: "auto" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
