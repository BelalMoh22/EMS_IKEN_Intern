/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useEmployees, useDeleteEmployee, useResetCredentials } from "@/hooks/useEmployees";
import { useAuthStore } from "@/stores/auth";
import { usePositions } from "@/hooks/usePositions";
import { useDepartments } from "@/hooks/useDepartments";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { SearchInput } from "@/components/shared/SearchInput";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ResetCredentialsDialog } from "./ResetCredentialsDialog";
import { Box, Typography, Button, Chip, Select, MenuItem, Grid } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { ActionButtons } from "@/components/shared/ActionButtons";
import type { Employee } from "@/types";
import { getGeneralErrors } from "@/utils/handleApiErrors";
import { useSnackbar } from "notistack";

// Initial page size
const INITIAL_PAGE_SIZE = 10;

export default function EmployeeList() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const canCreate = user?.role === "HR";
  const canEdit = user?.role === "HR";
  const canDelete = user?.role === "HR";

  const [search, setSearch] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState<number | "all">("all");
  const [selectedPosId, setSelectedPosId] = useState<number | "all">("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(INITIAL_PAGE_SIZE);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [resetTarget, setResetTarget] = useState<Employee | null>(null);

  const { data: employees, isLoading } = useEmployees();
  const { data: positions } = usePositions();
  const { data: departments } = useDepartments();
  const deleteMutation = useDeleteEmployee();
  const resetMutation = useResetCredentials();
  const { enqueueSnackbar } = useSnackbar();

  // Client-side search & pagination since backend returns full array
  const filtered = useMemo(() => {
    if (!employees) return [];
    
    let result = [...employees];

    // Filter by Search
    if (search) {
      const s = search.toLowerCase();
      result = result.filter((e) => {
        const fullName = `${e.firstName} ${e.lastname}`.toLowerCase();
        return (
          fullName.includes(s) ||
          e.email?.toLowerCase().includes(s) ||
          e.phoneNumber?.toLowerCase().includes(s)
        );
      });
    }

    // Filter by Department (Requires checking position's departmentId)
    if (selectedDeptId !== "all") {
      result = result.filter(e => {
        const pos = positions?.find(p => p.id === e.positionId);
        return pos?.departmentId === selectedDeptId;
      });
    }

    // Filter by Position
    if (selectedPosId !== "all") {
      result = result.filter(e => e.positionId === selectedPosId);
    }

    return result;
  }, [employees, search, selectedDeptId, selectedPosId, positions]);

  // Reset page when filters change
  useMemo(() => {
    setPage(0);
  }, [search, selectedDeptId, selectedPosId]);

  const paged = filtered.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  const getPositionName = (posId: number) =>
    positions?.find((p) => p.id === posId)?.positionName ?? "—";

  const getDepartmentName = (posId: number) => {
    const pos = positions?.find((p) => p.id === posId);
    if (!pos) return "—";
    return (
      departments?.find((d) => d.id === pos.departmentId)?.departmentName ?? "—"
    );
  };

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
            const data = (error as any)?.response?.data;
            enqueueSnackbar(data?.message || "Failed to delete employee", {
              variant: "error",
            });
          }
        },
      });
    }
  };

  const statusColor = (status: string | null | undefined) => {
    switch (status) {
      case "Active":
        return "success";
      case "Inactive":
        return "default";
      case "Terminated":
        return "error";
      default:
        return "default";
    }
  };

  const columns: Column<Employee>[] = [
    {
      header: "Name",
      cell: (row) => (
        <Typography variant="body2" fontWeight={500}>
          {row.firstName} {row.lastname}
        </Typography>
      ),
    },
    { header: "Email", accessorKey: "email" },
    { header: "Phone No", accessorKey: "phoneNumber" },
    {
      header: "Department",
      cell: (row) => getDepartmentName(row.positionId),
    },
    {
      header: "Position",
      cell: (row) => getPositionName(row.positionId),
    },
    {
      header: "Status",
      cell: (row) => (
        <Chip
          label={row.status ?? "Active"}
          size="small"
          color={statusColor(row.status)}
          variant="outlined"
          sx={{ fontWeight: 500 }}
        />
      ),
    },
    {
      header: "Actions" as const,
      cell: (row: Employee) => (
        <ActionButtons
          basePath="/employees"
          id={row.id}
          canEdit={canEdit}
          canDelete={canDelete}
          onDelete={(id) => setDeleteTarget(Number(id))}
          onResetPassword={() => setResetTarget(row)}
        />
      ),
    },
  ];

  const handleSearch = useCallback((v: string) => {
    setSearch(v);
    setPage(0);
  }, []);

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
          <Typography variant="h1">Employees</Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.role === "Manager"
              ? "View your team members"
              : "Manage your team members"}
          </Typography>
        </Box>
        {canCreate && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/employees/create")}
            sx={{
              background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              "&:hover": {
                background: "linear-gradient(135deg, #2563eb, #1e40af)",
              },
            }}
          >
            Add Employee
          </Button>
        )}
      </Box>

      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <SearchInput
            value={search}
            onChange={handleSearch}
            placeholder="Search employees..."
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Select
            fullWidth
            size="small"
            value={selectedDeptId}
            onChange={(e) => {
              setSelectedDeptId(e.target.value as any);
              setSelectedPosId("all"); // Reset position when dept changes
            }}
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
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Select
            fullWidth
            size="small"
            value={selectedPosId}
            onChange={(e) => setSelectedPosId(e.target.value as any)}
            displayEmpty
            sx={{ bgcolor: "background.paper", borderRadius: 2 }}
          >
            <MenuItem value="all">All Positions</MenuItem>
            {(selectedDeptId === "all" 
              ? positions 
              : positions?.filter(p => p.departmentId === selectedDeptId)
            )?.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.positionName}
              </MenuItem>
            ))}
          </Select>
        </Grid>
      </Grid>

      <DataTable
        columns={columns}
        data={paged}
        loading={isLoading}
        page={page}
        totalCount={filtered.length}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={(rows) => {
          setRowsPerPage(rows);
          setPage(0);
        }}
        onRowClick={(row) => navigate(`/employees/${row.id}`)}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Employee"
        description="Are you sure you want to delete this employee? This action cannot be undone."
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />

      <ResetCredentialsDialog
        open={resetTarget !== null}
        onClose={() => setResetTarget(null)}
        employee={resetTarget}
        loading={resetMutation.isPending}
        onConfirm={async (userId, username, newPassword) => {
          await resetMutation.mutateAsync({
            userId,
            data: { username, newPassword },
          });
          setResetTarget(null);
        }}
      />
    </Box>
  );
}
