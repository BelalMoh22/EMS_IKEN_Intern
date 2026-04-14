import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Button,
  Skeleton,
} from "@mui/material";
import InboxIcon from "@mui/icons-material/Inbox";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TablePagination from "@mui/material/TablePagination";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  page?: number; // 0-based for MUI TablePagination consistency
  totalCount?: number;
  rowsPerPage?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  loading?: boolean;
  onRowClick?: (row: T) => void;
  getRowSx?: (row: T) => any;
  sx?: any;
}

export function DataTable<T>({
  columns,
  data,
  page = 0,
  totalCount = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  loading,
  onRowClick,
  getRowSx,
  sx,
}: Props<T>) {
  if (loading) {
    return (
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3, overflowX: "auto", ...sx }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              {columns.map((col, i) => (
                <TableCell key={i} sx={{ fontWeight: 700, bgcolor: "rgba(0,0,0,0.02)" }}>{col.header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton variant="text" width="75%" animation="wave" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (!data.length) {
    return (
      <Paper
        variant="outlined"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: 8,
          borderRadius: 3,
          border: "1px dashed",
          borderColor: "divider",
          ...sx
        }}
      >
        <InboxIcon sx={{ fontSize: 48, color: "text.disabled" }} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          No data found
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3, overflowX: "auto", ...sx }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              {columns.map((col, i) => (
                <TableCell 
                  key={i} 
                  sx={{ 
                    fontWeight: 700, 
                    bgcolor: "rgba(0,0,0,0.02)",
                    color: "text.secondary",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em"
                  }}
                >
                  {col.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, i) => (
              <TableRow
                key={i}
                hover
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                sx={{ 
                  cursor: onRowClick ? "pointer" : "default",
                  transition: "all 0.2s",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.02) !important" },
                  ...(getRowSx ? getRowSx(row) : {})
                }}
              >
                {columns.map((col, j) => (
                  <TableCell key={j} sx={{ py: 1.5 }}>
                    {col.cell
                      ? col.cell(row)
                      : String(
                          (row as Record<string, unknown>)[
                            col.accessorKey as string
                          ] ?? "",
                        )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {onPageChange && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount || data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => onPageChange(newPage)}
          onRowsPerPageChange={
            onRowsPerPageChange
              ? (e) => onRowsPerPageChange(parseInt(e.target.value, 10))
              : undefined
          }
          sx={{
            borderTop: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
              fontSize: "0.875rem",
              color: "text.secondary"
            }
          }}
        />
      )}
    </Box>
  );
}
