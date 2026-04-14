import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { TextField, IconButton, InputAdornment, TextFieldProps } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

type Props = TextFieldProps & {
  name: string;
  label: string;
};

export function FormInput({ name, label, type = "text", placeholder, ...rest }: Props) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const [showPassword, setShowPassword] = useState(false);
  const error = errors[name];

  const togglePasswordVisibility = () => setShowPassword((show) => !show);

  // If the type is password, determine whether to show it as text or password
  const inputType = type === "password" ? (showPassword ? "text" : "password") : type;

  return (
    <TextField
      id={name}
      label={label}
      type={inputType}
      placeholder={placeholder}
      fullWidth
      size="small"
      error={!!error}
      helperText={error?.message as string}
      InputLabelProps={{
        ...(type === "date" ? { shrink: true } : {}),
        ...(rest.InputLabelProps || {}),
      }}
      InputProps={
        type === "password"
          ? {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={togglePasswordVisibility}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
              ...rest.InputProps,
            }
          : rest.InputProps
      }
      {...register(name)}
      {...rest}
      sx={{
        ...(rest.sx || {}),
        "& .MuiOutlinedInput-root": {
          borderRadius: 2,
        },
      }}
    />
  );
}
