import { Box, Container } from "@mui/material";
import EmployeeTimesheetGrid from "./EmployeeTimesheetGrid";

export default function EmployeeWorkLogsPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <EmployeeTimesheetGrid />
      </Box>
    </Container>
  );
}
