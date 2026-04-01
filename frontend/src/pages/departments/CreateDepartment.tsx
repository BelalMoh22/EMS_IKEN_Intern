import { useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateDepartment, useDepartments } from "@/hooks/useDepartments";
import { useEmployees } from "@/hooks/useEmployees";
import { FormInput } from "@/components/shared/FormInput";
import { FormSelect } from "@/components/shared/FormSelect";
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

const schema = z.object({
  departmentName: z.string().min(1, "Department name is required"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function CreateDepartment() {
  const navigate = useNavigate();
  const createMutation = useCreateDepartment();
  const { data: employees } = useEmployees();
  const { data: departments } = useDepartments();
  const { enqueueSnackbar } = useSnackbar();

  const methods = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      departmentName: "",
      description: "",
    },
});

  const onSubmit = (values: FormData) => {
    createMutation.mutate(
      {
        departmentName: values.departmentName,
        description: values.description,
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

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton onClick={() => navigate("/departments")}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h1">Create Department</Typography>
          <Typography variant="body2" color="text.secondary">
            Add a new department
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
                  <FormInput
                    name="departmentName"
                    label="Department Name"
                    placeholder="Engineering"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <FormInput
                    name="description"
                    label="Description"
                    placeholder="Department description..."
                  />
                </Grid>
              </Grid>
              <Box sx={{ display: "flex", gap: 1.5, pt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={createMutation.isPending}
                  sx={{
                    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #2563eb, #1e40af)",
                    },
                  }}
                >
                  {createMutation.isPending && (
                    <CircularProgress
                      size={18}
                      sx={{ mr: 1, color: "inherit" }}
                    />
                  )}
                  Create Department
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
