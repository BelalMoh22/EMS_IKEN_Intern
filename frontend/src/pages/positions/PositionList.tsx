import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePositions, useDeletePosition } from "@/hooks/usePositions";
import { useDepartments } from "@/hooks/useDepartments";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { SearchInput } from "@/components/shared/SearchInput";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Box, Typography, Button, Chip, LinearProgress, Select, MenuItem, Grid } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { ActionButtons } from "@/components/shared/ActionButtons";
import type { Position } from "@/types";
import { getGeneralErrors } from "@/utils/handleApiErrors";
import { useSnackbar } from "notistack";
import { AxiosError } from "axios";
import { ApiResponse } from "@/types";
import BusinessIcon from "@mui/icons-material/Business";
import PeopleIcon from "@mui/icons-material/People";

export default function PositionList() {
  const navigate = useNavigate();
  const { data, isLoading: positionsLoading } = usePositions();
  const { data: departments, isLoading: departmentsLoading } = useDepartments();
  const isLoading = positionsLoading || departmentsLoading;
  const deleteMutation = useDeletePosition();
  const { enqueueSnackbar } = useSnackbar();
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState<number | "all">("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const getDeptName = useCallback(
    (deptId: number) =>
      departments?.find((d) => d.id === deptId)?.departmentName ?? "—",
    [departments],
  );

  const filteredData = useMemo(() => {
    if (!data) return [];
    
    let filtered = [...data];
    
    // Filter by Search (Position Name only)
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(p => 
        p.positionName?.toLowerCase().includes(s)
      );
    }
    
    // Filter by Department Select
    if (selectedDeptId !== "all") {
      filtered = filtered.filter(p => p.departmentId === selectedDeptId);
    }
    
    return filtered;
  }, [data, search, selectedDeptId]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [search, selectedDeptId]);

  const pagedData = filteredData.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  const handleDelete = () => {
    if (deleteTarget !== null) {
      deleteMutation.mutate(deleteTarget, {
        onSuccess: () => {
          setDeleteTarget(null);
        },
        onError: (error) => {
          const errors = getGeneralErrors(error);
          if (errors.length > 0) {
            errors.forEach((msg) => enqueueSnackbar(msg, { variant: "error" }));
          } else {
            const data = (error as AxiosError<ApiResponse<any>>)?.response?.data;
            enqueueSnackbar(data?.message || "Failed to delete position", {
              variant: "error",
            });
          }
        },
      });
    }
  };

  const columns: Column<Position>[] = [
    {
      header: "Position Name",
      cell: (row) => (
        <Typography variant="body2" fontWeight={500}>
          {row.positionName}
        </Typography>
      ),
    },
    {
      header: "Department",
      cell: (row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <BusinessIcon fontSize="small" color="disabled" />
          <Typography variant="body2">
            {getDeptName(row.departmentId)}
          </Typography>
        </Box>
      ),
    },
    {
      header: "Salary Range",
      cell: (row) => (
        <Typography variant="body2" color="primary.main" fontWeight={600}>
          ${row.minSalary?.toLocaleString()} – $
          {row.maxSalary?.toLocaleString()}
        </Typography>
      ),
    },
    {
      header: "Capacity",
      cell: (row) => {
        const isFull = row.currentEmployeeCount >= row.targetEmployeeCount;
        const progress =
          (row.currentEmployeeCount / (row.targetEmployeeCount || 1)) * 100;
        return (
          <Box sx={{ minWidth: 120 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
            >
              <Typography variant="caption" fontWeight="bold">
                {row.currentEmployeeCount} / {row.targetEmployeeCount}
              </Typography>
              {isFull && (
                <Typography variant="caption" color="error" fontWeight="bold">
                  FULL
                </Typography>
              )}
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(progress, 100)}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: "rgba(0,0,0,0.05)",
                "& .MuiLinearProgress-bar": {
                  bgcolor: isFull ? "#ef5350" : "#3b82f6",
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        );
      },
    },
    {
      header: "Status",
      cell: (row) => {
        const isFull = row.currentEmployeeCount >= row.targetEmployeeCount;
        return (
          <Chip
            label={isFull ? "Full" : "Available"}
            size="small"
            color={isFull ? "error" : "success"}
            variant="outlined"
            sx={{ fontWeight: 500 }}
          />
        );
      },
    },
    {
      header: "Manager Role",
      cell: (row) => (
        <Chip
          label={row.isManager ? "Yes" : "No"}
          size="small"
          color={row.isManager ? "primary" : "default"}
          variant={row.isManager ? "filled" : "outlined"}
          sx={{ fontWeight: 500 }}
        />
      ),
    },
    {
      header: "Add",
      cell: (row) => {
        const isFull = row.currentEmployeeCount >= row.targetEmployeeCount;
        return (
          <Button
            size="small"
            variant="outlined"
            startIcon={<PeopleIcon />}
            disabled={isFull}
            onClick={(e) => {
              e.stopPropagation();
              navigate("/employees/create", { state: { positionId: row.id } });
            }}
          >
            Employee
          </Button>
        );
      },
    },
    {
      header: "Actions",
      cell: (row) => (
        <ActionButtons
          basePath="/positions"
          id={row.id}
          canEdit={true}
          canDelete={true}
          onDelete={(id) => setDeleteTarget(Number(id))}
        />
      ),
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography variant="h1">Positions</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage job positions and capacity
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/positions/create")}
          sx={{
            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            "&:hover": {
              background: "linear-gradient(135deg, #2563eb, #1e40af)",
            },
          }}
        >
          Add Position
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search position name..."
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Box sx={{ minWidth: 200 }}>
            <Select
              fullWidth
              size="small"
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value as number | "all")}
              displayEmpty
              sx={{ bgcolor: "background.paper", borderRadius: 2 }}
            >
              <MenuItem value="all">All Departments</MenuItem>
              {departments?.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.departmentName}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </Grid>
      </Grid>

      <DataTable
        columns={columns}
        data={pagedData}
        loading={isLoading}
        page={page}
        totalCount={filteredData.length}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={(rows) => {
          setRowsPerPage(rows);
          setPage(0);
        }}
        onRowClick={(row) => navigate(`/positions/${row.id}`)}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Position"
        description="Are you sure? This will also delete all employees assigned to this position. This action cannot be undone."
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </Box>
  );
}
