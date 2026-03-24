import { useFormContext } from "react-hook-form";
import { TextField } from "@mui/material";

interface Props {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
}

export function FormInput({ name, label, type = "text", placeholder }: Props) {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[name];

  return (
    <TextField
      id={name}
      label={label}
      type={type}
      placeholder={placeholder}
      fullWidth
      size="small"
      error={!!error}
      helperText={error?.message as string}
      InputLabelProps={type === "date" ? { shrink: true } : undefined}
      {...register(name)}
    />
  );
}
