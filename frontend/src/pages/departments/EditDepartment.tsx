import { useNavigate, useParams } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useDepartment,
  useUpdateDepartment,
  useDepartments,
} from "@/hooks/useDepartments";
import { useEmployees } from "@/hooks/useEmployees";
import { usePositions } from "@/hooks/usePositions";
import { FormInput } from "@/components/shared/FormInput";
import { FormSelect } from "@/components/shared/FormSelect";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { handleApiErrors } from "@/utils/handleApiErrors";
import { useSnackbar } from "notistack";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  CircularProgress,
  Divider,
  Grid,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useEffect } from "react";

const schema = z.object({
  departmentName: z.string().min(1, "Department name is required"),
  description: z.string().optional(),
  isActive: z.string(),
});

type FormData = z.infer<typeof schema>;

export default function EditDepartment() {
  const { id } = useParams<{ id: string }>();
  const numId = Number(id);
  const navigate = useNavigate();
  const { data: department, isLoading } = useDepartment(numId);
  const { data: employees } = useEmployees();
  const updateMutation = useUpdateDepartment();
  const { enqueueSnackbar } = useSnackbar();

  const methods = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      departmentName: "",
      description: "",
      isActive: "true",
    },
  });

  useEffect(() => {
    if (department) {
      methods.reset({
        departmentName: department.departmentName ?? "",
        description: department.description ?? "",
        isActive: department.isActive !== false ? "true" : "false",
      });
    }
  }, [department, methods]);

  const onSubmit = (values: FormData) => {
    updateMutation.mutate(
      {
        id: numId,
        data: {
          departmentName: values.departmentName,
          description: values.description,
          isActive: values.isActive === "true",
        },
      },
      {
        onSuccess: () => {
          navigate("/departments");
        },
        onError: (error) => {
          const message = handleApiErrors(error, methods);
          enqueueSnackbar(message, { variant: "error" });
        },
      },
    );
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton onClick={() => navigate("/departments")}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h1">Edit Department</Typography>
          <Typography variant="body2" color="text.secondary">
            Update department information
          </Typography>
        </Box>
      </Box>

      <Card>
        <CardHeader
          title="Department Details"
          titleTypographyProps={{ variant: "h2" }}
        />
        <Divider />
        <CardContent>
          <FormProvider {...methods}>
            <Box
              component="form"
              onSubmit={methods.handleSubmit(onSubmit)}
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormInput name="departmentName" label="Department Name" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormSelect
                    name="isActive"
                    label="Status"
                    options={[
                      { label: "Active", value: "true" },
                      { label: "Inactive", value: "false" },
                    ]}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <FormInput name="description" label="Description" />
                </Grid>
              </Grid>
              <Box sx={{ display: "flex", gap: 1.5, pt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={updateMutation.isPending}
                  sx={{
                    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #2563eb, #1e40af)",
                    },
                  }}
                >
                  {updateMutation.isPending && (
                    <CircularProgress
                      size={18}
                      sx={{ mr: 1, color: "inherit" }}
                    />
                  )}
                  Save Changes
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/departments")}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          </FormProvider>
        </CardContent>
      </Card>
    </Box>
  );
}
