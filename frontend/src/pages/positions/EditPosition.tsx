import { useNavigate, useParams } from "react-router-dom";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usePosition, useUpdatePosition } from "@/hooks/usePositions";
import { useDepartments } from "@/hooks/useDepartments";
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
  FormControlLabel,
  Switch,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useEffect } from "react";

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

export default function EditPosition() {
  const { id } = useParams<{ id: string }>();
  const numId = Number(id);
  const navigate = useNavigate();
  const { data: position, isLoading } = usePosition(numId);
  const updateMutation = useUpdatePosition();
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

  useEffect(() => {
    if (position) {
      methods.reset({
        positionName: position.positionName ?? "",
        departmentId: position.departmentId ?? 0,
        minSalary: position.minSalary ?? 0,
        maxSalary: position.maxSalary ?? 0,
        targetEmployeeCount: position.targetEmployeeCount ?? 1,
        isManager: !!position.isManager,
      });
    }
  }, [position, methods]);

  const onSubmit = (values: FormData) => {
    updateMutation.mutate(
      { id: numId, data: values },
      {
        onSuccess: () => {
          enqueueSnackbar("Position updated successfully", { variant: "success" });
          navigate("/positions");
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
        <IconButton onClick={() => navigate("/positions")}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h1">Edit Position</Typography>
          <Typography variant="body2" color="text.secondary">
            Update position information
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
                  <FormInput name="positionName" label="Position Name" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormSelect
                    name="departmentId"
                    label="Department"
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
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormInput
                    name="maxSalary"
                    label="Max Salary"
                    type="number"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormInput
                    name="targetEmployeeCount"
                    label="Target Employee Count"
                    type="number"
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
