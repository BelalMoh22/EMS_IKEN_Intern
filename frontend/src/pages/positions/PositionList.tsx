import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { usePositions, useDeletePosition } from "@/hooks/usePositions";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { SearchInput } from "@/components/shared/SearchInput";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Position } from "@/types";

export default function PositionList() {
  const navigate = useNavigate();
  const { data, isLoading } = usePositions();
  const deleteMutation = useDeletePosition();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!search) return data;
    const s = search.toLowerCase();
    return data.filter(p => 
      p.title.toLowerCase().includes(s) || 
      p.departmentName?.toLowerCase().includes(s) ||
      p.description.toLowerCase().includes(s)
    );
  }, [data, search]);

  const handleDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget, { onSuccess: () => setDeleteTarget(null) });
    }
  };

  const columns: Column<Position>[] = [
    { header: "Title", accessorKey: "title" },
    { header: "Department", accessorKey: "departmentName" },
    { header: "Description", accessorKey: "description" },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/positions/edit/${row.id}`)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(row.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Positions</h1>
          <p className="text-muted-foreground">Manage job positions</p>
        </div>
        <Button onClick={() => navigate("/positions/create")}>
          <Plus className="mr-2 h-4 w-4" /> Add Position
        </Button>
      </div>

      <div className="max-w-sm">
        <SearchInput value={search} onChange={setSearch} placeholder="Search positions..." />
      </div>

      <DataTable columns={columns} data={filteredData} loading={isLoading} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Position"
        description="Are you sure? This action cannot be undone."
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
