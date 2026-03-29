import {
  Box,
  Typography,
  Button,
  Paper,
  Breadcrumbs,
  Link as MuiLink,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Link as RouterLink, useNavigate } from "react-router-dom";

interface DetailsPageLayoutProps {
  title: string;
  basePath: string; // e.g. "/employees"
  basePathName: string; // e.g. "Employees"
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function DetailsPageLayout({
  title,
  basePath,
  basePathName,
  children,
  actions,
}: DetailsPageLayoutProps) {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        maxWidth: "1000px",
        margin: "0 auto",
        width: "100%",
      }}
    >
      {/* Breadcrumbs & Back Button */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          <MuiLink
            component={RouterLink}
            color="inherit"
            to="/"
            underline="hover"
          >
            Home
          </MuiLink>
          <MuiLink
            component={RouterLink}
            color="inherit"
            to={basePath}
            underline="hover"
          >
            {basePathName}
          </MuiLink>
          <Typography color="text.primary">Details</Typography>
        </Breadcrumbs>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(basePath)}
              color="inherit"
              sx={{ textTransform: "none", fontWeight: 500 }}
            >
              Back
            </Button>
            <Typography variant="h4" component="h1" fontWeight={700}>
              {title}
            </Typography>
          </Box>
          {actions && <Box sx={{ display: "flex", gap: 1 }}>{actions}</Box>}
        </Box>
      </Box>

      {/* Main Content Area */}
      <Paper elevation={0} variant="outlined" sx={{ p: 5, borderRadius: 2 }}>
        {children}
      </Paper>
    </Box>
  );
}
