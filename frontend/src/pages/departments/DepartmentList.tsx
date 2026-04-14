import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDepartments, useDeleteDepartment } from "@/hooks/useDepartments";
import { useEmployees } from "@/hooks/useEmployees";
import { usePositions } from "@/hooks/usePositions";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { SearchInput } from "@/components/shared/SearchInput";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Box, Typography, Button, Chip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { ActionButtons } from "@/components/shared/ActionButtons";
import type { Department } from "@/types";
import { extractErrorMessage } from "@/utils/handleApiErrors";
import { useSnackbar } from "notistack";

export default function DepartmentList() {
  const navigate = useNavigate();
  const { data, isLoading: departmentsLoading } = useDepartments();
  const { data: employees, isLoading: employeesLoading } = useEmployees();
  const { data: positions, isLoading: positionsLoading } = usePositions();
  const isLoading = departmentsLoading || employeesLoading || positionsLoading;
  const deleteMutation = useDeleteDepartment();
  const { enqueueSnackbar } = useSnackbar();
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!search) return data;
    const s = search.toLowerCase();
    return data.filter((d) => d.departmentName?.toLowerCase().includes(s));
  }, [data, search]);

  // Reset page when search changes
  useEffect(() => {
    setPage(0);
  }, [search]);

  const pagedData = filteredData.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  const handleDelete = () => {
    if (deleteTarget !== null) {
      deleteMutation.mutate(deleteTarget, {
        onSuccess: () => {
          setDeleteTarget(null);
          enqueueSnackbar("Department deleted successfully", { variant: "success" });
        },
        onError: (error) => {
          enqueueSnackbar(extractErrorMessage(error, "Failed to delete department"), { variant: "error" });
        },
      });
    }
  };

  const columns: Column<Department>[] = [
    {
      header: "Department Name",
      cell: (row) => (
        <Typography variant="body2" fontWeight={500}>
          {row.departmentName}
        </Typography>
      ),
    },
    {
      header: "Description",
      cell: (row) => (
        <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
          {row.description || "—"}
        </Typography>
      ),
    },
    {
      header: "Managers",
      cell: (row) => {
        const deptPositionIds = positions
          ?.filter((p) => p.departmentId === row.id && p.isManager)
          .map((p) => p.id);
        const deptManagers = employees?.filter((e) =>
          deptPositionIds?.includes(e.positionId) && e.status === "Active"
        );
        
        if (!deptManagers || deptManagers.length === 0) return "None";
        if (deptManagers.length === 1) return `${deptManagers[0].firstName} ${deptManagers[0].lastname}`;
        return `${deptManagers.length} Managers`;
      },
    },
    {
      header: "Employees",
      cell: (row) => {
        const deptPositionIds = positions
          ?.filter((p) => p.departmentId === row.id)
          .map((p) => p.id);
        const count = employees?.filter((e) =>
          deptPositionIds?.includes(e.positionId)
        ).length;
        return (
          <Chip
            label={count || 0}
            size="small"
            sx={{ fontWeight: "bold", bgcolor: "rgba(59, 130, 246, 0.1)", color: "#2563eb" }}
          />
        );
      },
    },
    {
      header: "Status",
      cell: (row) => (
        <Chip
          label={row.isActive !== false ? "Active" : "Inactive"}
          size="small"
          color={row.isActive !== false ? "success" : "default"}
          variant="outlined"
          sx={{ fontWeight: 500 }}
        />
      ),
    },
    {
      header: "Actions",
      cell: (row) => (
        <ActionButtons
          basePath="/departments"
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
          <Typography variant="h1">Departments</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage company departments
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/departments/create")}
          sx={{
            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            "&:hover": {
              background: "linear-gradient(135deg, #2563eb, #1e40af)",
            },
          }}
        >
          Add Department
        </Button>
      </Box>

      <Box sx={{ maxWidth: 360 }}>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search departments..."
        />
      </Box>

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
        onRowClick={(row) => navigate(`/departments/${row.id}`)}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Department"
        description="Are you sure you want to delete this department? This action cannot be undone."
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </Box>
  );
}
