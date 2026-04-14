import { useFormContext, Controller } from "react-hook-form";
import { TextField, MenuItem } from "@mui/material";

interface Option {
  label: string;
  value: string;
  disabled?: boolean;
}

interface Props {
  name: string;
  label: string | React.ReactNode;
  placeholder?: string;
  options: Option[];
  required?: boolean;
}

export function FormSelect({
  name,
  label,
  placeholder = "Select...",
  options,
  required,
}: Props) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
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
          required={required}
          fullWidth
          size="small"
          error={!!error}
          helperText={error?.message as string}
          value={field.value || ""}
          sx={{
            "& .MuiFormLabel-asterisk": {
              color: "#d32f2f",
            },
          }}
        >
          <MenuItem value="" disabled>
            {placeholder}
          </MenuItem>
          {options.map((opt) => (
            <MenuItem key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );
}
