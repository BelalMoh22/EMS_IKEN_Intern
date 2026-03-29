import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { usePositions, useDeletePosition } from "@/hooks/usePositions";
import { useDepartments } from "@/hooks/useDepartments";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { SearchInput } from "@/components/shared/SearchInput";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Box, Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { ActionButtons } from "@/components/shared/ActionButtons";
import type { Position } from "@/types";

export default function PositionList() {
  const navigate = useNavigate();
  const { data, isLoading } = usePositions();
  const { data: departments } = useDepartments();
  const deleteMutation = useDeletePosition();
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const getDeptName = useCallback(
    (deptId: number) =>
      departments?.find((d) => d.id === deptId)?.departmentName ?? "—",
    [departments]
  );

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!search) return data;
    const s = search.toLowerCase();
    return data.filter(
      (p) =>
        p.positionName?.toLowerCase().includes(s) ||
        getDeptName(p.departmentId)?.toLowerCase().includes(s)
    );
  }, [data, search, departments]);

  const handleDelete = () => {
    if (deleteTarget !== null) {
      deleteMutation.mutate(deleteTarget, {
        onSuccess: () => setDeleteTarget(null),
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
      cell: (row) => getDeptName(row.departmentId),
    },
    {
      header: "Salary Range",
      cell: (row) =>
        `$${row.minSalary?.toLocaleString()} – $${row.maxSalary?.toLocaleString()}`,
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
            Manage job positions
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

      <Box sx={{ maxWidth: 360 }}>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search positions..."
        />
      </Box>

      <DataTable 
        columns={columns} 
        data={filteredData} 
        loading={isLoading} 
        onRowClick={(row) => navigate(`/positions/${row.id}`)}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Position"
        description="Are you sure? This action cannot be undone."
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </Box>
  );
}
