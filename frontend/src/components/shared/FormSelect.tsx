import { useFormContext, Controller } from "react-hook-form";
import { TextField, MenuItem } from "@mui/material";

interface Option {
  label: string;
  value: string;
}

interface Props {
  name: string;
  label: string;
  placeholder?: string;
  options: Option[];
}

export function FormSelect({ name, label, placeholder = "Select...", options }: Props) {
  const { control, formState: { errors } } = useFormContext();
  const error = errors[name];

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <TextField
          {...field}
          select
          label={label}
          fullWidth
          size="small"
          error={!!error}
          helperText={error?.message as string}
          value={field.value || ""}
        >
          <MenuItem value="" disabled>
            {placeholder}
          </MenuItem>
          {options.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );
}
