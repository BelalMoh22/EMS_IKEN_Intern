import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { usePositions, useDeletePosition } from "@/hooks/usePositions";
import { useDepartments } from "@/hooks/useDepartments";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { SearchInput } from "@/components/shared/SearchInput";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Box, Typography, Button, Chip, LinearProgress } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { ActionButtons } from "@/components/shared/ActionButtons";
import type { Position } from "@/types";
import { getGeneralErrors } from "@/utils/handleApiErrors";
import { useSnackbar } from "notistack";
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

  const getDeptName = useCallback(
    (deptId: number) =>
      departments?.find((d) => d.id === deptId)?.departmentName ?? "—",
    [departments],
  );

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!search) return data;
    const s = search.toLowerCase();
    return data.filter(
      (p) =>
        p.positionName?.toLowerCase().includes(s) ||
        getDeptName(p.departmentId)?.toLowerCase().includes(s),
    );
  }, [data, search, departments, getDeptName]);

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
