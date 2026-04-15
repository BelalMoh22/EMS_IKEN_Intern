import { useNavigate } from "react-router-dom";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreatePosition } from "@/hooks/usePositions";
import { useDepartments } from "@/hooks/useDepartments";
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
  FormControlLabel,
  Switch,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const schema = z.object({
  positionName: z.string().min(1, "Position name is required"),
  departmentId: z.coerce.number().min(1, "Department is required"),
  minSalary: z.coerce.number().min(0, "Min salary must be positive"),
  maxSalary: z.coerce.number().min(0, "Max salary must be positive"),
  targetEmployeeCount: z.coerce
    .number()
    .min(1, "Target count must be at least 1"),
  isManager: z.boolean().default(false),
});

type FormData = z.infer<typeof schema>;

export default function CreatePosition() {
  const navigate = useNavigate();
  const createMutation = useCreatePosition();
  const { data: departments } = useDepartments();
  const { enqueueSnackbar } = useSnackbar();

  const methods = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      positionName: "",
      departmentId: 0,
      minSalary: 0,
      maxSalary: 0,
      targetEmployeeCount: 1,
      isManager: false,
    },
  });

  const onSubmit = (values: FormData) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        enqueueSnackbar("Position created successfully", { variant: "success" });
        navigate("/positions");
      },
      onError: (error) => {
        const message = handleApiErrors(error, methods);
        if (message) enqueueSnackbar(message, { variant: "error" });
      },
    });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton onClick={() => navigate("/positions")}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h1">Create Position</Typography>
          <Typography variant="body2" color="text.secondary">
            Add a new job position
          </Typography>
        </Box>
      </Box>
      <Card>
        <CardHeader
          title="Position Details"
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
                    name="positionName"
                    label="Position Name"
                    placeholder="Software Engineer"
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormSelect
                    name="departmentId"
                    label="Department"
                    required
                    options={
                      departments?.map((d) => ({
                        label: d.departmentName,
                        value: String(d.id),
                      })) ?? []
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormInput
                    name="minSalary"
                    label="Min Salary"
                    type="number"
                    placeholder="30000"
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormInput
                    name="maxSalary"
                    label="Max Salary"
                    type="number"
                    placeholder="80000"
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormInput
                    name="targetEmployeeCount"
                    label="Target Employee Count"
                    type="number"
                    placeholder="10"
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Controller
                    name="isManager"
                    control={methods.control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        }
                        label="Is Manager Role"
                      />
                    )}
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
                  Create Position
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/positions")}
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
