import { useState, useMemo } from "react";
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
import { getGeneralErrors } from "@/utils/handleApiErrors";
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

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!search) return data;
    const s = search.toLowerCase();
    return data.filter(
      (d) =>
        d.departmentName?.toLowerCase().includes(s) ||
        d.description?.toLowerCase().includes(s)
    );
  }, [data, search]);

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
            enqueueSnackbar(data?.message || "Failed to delete department", { variant: "error" });
          }
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
      header: "Manager",
      cell: (row) => {
        const m = employees?.find((e) => e.id === row.managerId);
        return m ? `${m.firstName} ${m.lastname}` : "None";
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
        data={filteredData} 
        loading={isLoading} 
        onRowClick={(row) => navigate(`/departments/${row.id}`)}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Department"
        description="Are you sure? This action cannot be undone."
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </Box>
  );
}
