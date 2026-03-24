import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useEmployees, useDeleteEmployee } from "@/hooks/useEmployees";
import { useAuthStore } from "@/stores/auth";
import { usePositions } from "@/hooks/usePositions";
import { useDepartments } from "@/hooks/useDepartments";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { SearchInput } from "@/components/shared/SearchInput";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Box, Typography, Button, IconButton, Chip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type { Employee } from "@/types";

const PAGE_SIZE = 10;

export default function EmployeeList() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const canCreate = user?.role === "Admin" || user?.role === "HR";
  const canEdit = user?.role === "Admin" || user?.role === "HR";
  const canDelete = user?.role === "Admin" || user?.role === "HR";

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const { data: employees, isLoading } = useEmployees();
  const { data: positions } = usePositions();
  const { data: departments } = useDepartments();
  const deleteMutation = useDeleteEmployee();

  // Client-side search & pagination since backend returns full array
  const filtered = useMemo(() => {
    if (!employees) return [];
    if (!search) return employees;
    const s = search.toLowerCase();
    return employees.filter(
      (e) =>
        e.firstName?.toLowerCase().includes(s) ||
        e.lastname?.toLowerCase().includes(s) ||
        e.email?.toLowerCase().includes(s) ||
        e.phoneNumber?.toLowerCase().includes(s)
    );
  }, [employees, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getPositionName = (posId: number) =>
    positions?.find((p) => p.id === posId)?.positionName ?? "—";

  const getDepartmentName = (posId: number) => {
    const pos = positions?.find((p) => p.id === posId);
    if (!pos) return "—";
    return departments?.find((d) => d.id === pos.departmentId)?.departmentName ?? "—";
  };

  const handleDelete = () => {
    if (deleteTarget !== null) {
      deleteMutation.mutate(deleteTarget, {
        onSuccess: () => setDeleteTarget(null),
      });
    }
  };

  const statusColor = (status: string | null) => {
    switch (status) {
      case "Active":
        return "success";
      case "Inactive":
        return "default";
      case "Suspended":
        return "warning";
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
    ...(canEdit
      ? [
          {
            header: "Actions" as const,
            cell: (row: Employee) => (
              <Box sx={{ display: "flex", gap: 0.5 }}>
                <IconButton
                  size="small"
                  onClick={() => navigate(`/employees/edit/${row.id}`)}
                  color="primary"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                {canDelete && (
                  <IconButton
                    size="small"
                    onClick={() => setDeleteTarget(row.id)}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            ),
          },
        ]
      : []),
  ];

  const handleSearch = useCallback(
    (v: string) => {
      setSearch(v);
      setPage(1);
    },
    []
  );

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

      <Box sx={{ maxWidth: 360 }}>
        <SearchInput
          value={search}
          onChange={handleSearch}
          placeholder="Search employees..."
        />
      </Box>

      <DataTable
        columns={columns}
        data={paged}
        loading={isLoading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Employee"
        description="Are you sure you want to delete this employee? This action cannot be undone."
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </Box>
  );
}
