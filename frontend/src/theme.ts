import { createTheme } from "@mui/material/styles";
const theme = createTheme({
  palette: {
    primary: {
      main: "#3b82f6",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#64748b",
      contrastText: "#ffffff",
    },
    success: {
      main: "#22c55e",
      contrastText: "#ffffff",
    },
    warning: {
      main: "#f59e0b",
      contrastText: "#ffffff",
    },
    error: {
      main: "#ef4444",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
    text: {
      primary: "#1e293b",
      secondary: "#64748b",
    },
    divider: "#e2e8f0",
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "1.5rem",
      lineHeight: "2rem",
      fontWeight: 700,
      letterSpacing: "-0.025em",
    },
    h2: {
      fontSize: "1.25rem",
      lineHeight: "1.75rem",
      fontWeight: 600,
      letterSpacing: "-0.025em",
    },
    h3: { fontSize: "1.125rem", lineHeight: "1.75rem", fontWeight: 600 },
    h4: { fontSize: "1rem", lineHeight: "1.5rem", fontWeight: 600 },
    h5: { fontSize: "0.875rem", lineHeight: "1.25rem", fontWeight: 600 },
    h6: { fontSize: "0.875rem", lineHeight: "1.25rem", fontWeight: 500 },
    body1: { fontSize: "1rem", lineHeight: "1.5rem" },
    body2: { fontSize: "0.875rem", lineHeight: "1.25rem" },
    subtitle1: { fontSize: "1rem", lineHeight: "1.5rem", fontWeight: 500 },
    subtitle2: { fontSize: "0.875rem", lineHeight: "1.25rem", fontWeight: 500 },
    caption: { fontSize: "0.75rem", lineHeight: "1rem" },
    button: {
      fontSize: "0.875rem",
      lineHeight: "1.25rem",
      fontWeight: 500,
      textTransform: "none",
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          padding: "8px 16px",
          borderRadius: 6,
        },
        sizeSmall: { padding: "4px 12px", fontSize: "0.8125rem" },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid #e2e8f0",
          boxShadow:
            "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
          borderRadius: 8,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 500,
          color: "#64748b",
          fontSize: "0.875rem",
          borderBottom: "1px solid #e2e8f0",
        },
        root: { borderColor: "#e2e8f0", padding: "16px", fontSize: "0.875rem" },
      },
    },
    MuiTextField: {
      defaultProps: { size: "small", variant: "outlined" },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
          boxShadow:
            "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 9999, fontWeight: 500 },
      },
    },
  },
});
export default theme;
