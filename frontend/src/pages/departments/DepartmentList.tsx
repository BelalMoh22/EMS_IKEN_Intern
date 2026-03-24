import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDepartments, useDeleteDepartment } from "@/hooks/useDepartments";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { SearchInput } from "@/components/shared/SearchInput";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Box, Typography, Button, IconButton, Chip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type { Department } from "@/types";

export default function DepartmentList() {
  const navigate = useNavigate();
  const { data, isLoading } = useDepartments();
  const deleteMutation = useDeleteDepartment();
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!search) return data;
    const s = search.toLowerCase();
    return data.filter(
      (d) =>
        d.departmentName?.toLowerCase().includes(s) ||
        d.description?.toLowerCase().includes(s) ||
        d.email?.toLowerCase().includes(s)
    );
  }, [data, search]);

  const handleDelete = () => {
    if (deleteTarget !== null) {
      deleteMutation.mutate(deleteTarget, {
        onSuccess: () => setDeleteTarget(null),
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
    { header: "Email", accessorKey: "email" },
    {
      header: "Description",
      cell: (row) => (
        <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
          {row.description || "—"}
        </Typography>
      ),
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
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={() => navigate(`/departments/edit/${row.id}`)}
            color="primary"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setDeleteTarget(row.id)}
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
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

      <DataTable columns={columns} data={filteredData} loading={isLoading} />

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
