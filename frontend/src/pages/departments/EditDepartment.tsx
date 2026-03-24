import { useNavigate, useParams } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { useDepartment, useUpdateDepartment } from "@/hooks/useDepartments";
import { FormInput } from "@/components/shared/FormInput";
import { FormSelect } from "@/components/shared/FormSelect";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
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
  email: z.string().email("Valid email is required"),
  managerId: z.coerce.number().optional(),
  isActive: z.string(),
});

type FormData = z.infer<typeof schema>;

export default function EditDepartment() {
  const { id } = useParams<{ id: string }>();
  const numId = Number(id);
  const navigate = useNavigate();
  const { data: department, isLoading } = useDepartment(numId);
  const updateMutation = useUpdateDepartment();

  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      departmentName: "",
      description: "",
      email: "",
      managerId: undefined,
      isActive: "true",
    },
  });

  useEffect(() => {
    if (department) {
      methods.reset({
        departmentName: department.departmentName ?? "",
        description: department.description ?? "",
        email: department.email ?? "",
        managerId: department.managerId ?? undefined,
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
          email: values.email,
          managerId: values.managerId || null,
          isActive: values.isActive === "true",
        },
      },
      { onSuccess: () => navigate("/departments") }
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
                  <FormInput name="email" label="Department Email" type="email" />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <FormInput name="description" label="Description" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormInput name="managerId" label="Manager ID" type="number" />
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
