import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Box, Typography, Link } from "@mui/material";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "grey.100",
      }}
    >
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h3" fontWeight={700} gutterBottom>
          404
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Oops! Page not found
        </Typography>
        <Link href="/" underline="hover" color="primary">
          Return to Home
        </Link>
      </Box>
    </Box>
  );
};

export default NotFound;
