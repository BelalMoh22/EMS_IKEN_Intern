import { useMemo } from "react";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useForm, FormProvider } from "react-hook-form";
import { useCreateProject, useUpdateProject } from "@/hooks/useProjects";
import type { Project } from "@/types/project";
import { handleApiErrors } from "@/utils/handleApiErrors";

// ─── Types ───────────────────────────────────────────────
export interface ProjectFormValues {
  name: string;
  description: string;
}

// ─── Props ───────────────────────────────────────────────
interface Props {
  open: boolean;
  onClose: () => void;
  editTarget: Project | null;
}

export function ProjectFormDialog({ open, onClose, editTarget }: Props) {
  const isEdit = editTarget !== null;
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();

  const methods = useForm<ProjectFormValues>({
    defaultValues: { name: "", description: "" },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = methods;

  // Sync form values when open/editTarget changes
  useMemo(() => {
    if (open) {
      reset({
        name: editTarget?.name ?? "",
        description: editTarget?.description ?? "",
      });
    }
  }, [open, editTarget, reset]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const { enqueueSnackbar } = useSnackbar();

  const onSubmit = (values: ProjectFormValues) => {
    if (isEdit && editTarget) {
      updateMutation.mutate(
        { id: editTarget.id, data: { name: values.name, description: values.description } },
        { 
          onSuccess: () => {
            enqueueSnackbar("Project updated successfully", { variant: "success" });
            onClose();
          },
          onError: (err) => {
            const msg = handleApiErrors(err, methods);
            enqueueSnackbar(msg, { variant: "error" });
          }
        }
      );
    } else {
      createMutation.mutate(
        { name: values.name, description: values.description },
        { 
          onSuccess: () => {
            enqueueSnackbar("Project created successfully", { variant: "success" });
            onClose();
          },
          onError: (err) => {
            const msg = handleApiErrors(err, methods);
            enqueueSnackbar(msg, { variant: "error" });
          }
        }
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        {isEdit ? "Edit Project" : "Create Project"}
      </DialogTitle>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              id="project-name"
              label="Project Name"
              size="small"
              fullWidth
              error={!!errors.name}
              helperText={errors.name?.message as string}
              {...register("name", { required: "Project name is required" })}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
            <TextField
              id="project-description"
              label="Description"
              size="small"
              fullWidth
              multiline
              rows={3}
              error={!!errors.description}
              helperText={errors.description?.message as string}
              {...register("description")}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isPending}
              sx={{
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                "&:hover": {
                  background: "linear-gradient(135deg, #2563eb, #1e40af)",
                },
              }}
            >
              {isPending ? (
                <CircularProgress size={18} color="inherit" />
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Create Project"
              )}
            </Button>
          </DialogActions>
        </form>
      </FormProvider>
    </Dialog>
  );
}
