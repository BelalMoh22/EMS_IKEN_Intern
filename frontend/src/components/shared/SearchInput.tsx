import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useEffect, useState } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
}: Props) {
  const [internal, setInternal] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => onChange(internal), 300);
    return () => clearTimeout(timer);
  }, [internal, onChange]);

  useEffect(() => setInternal(value), [value]);

  return (
    <TextField
      value={internal}
      onChange={(e) => setInternal(e.target.value)}
      placeholder={placeholder}
      size="small"
      fullWidth
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" color="action" />
          </InputAdornment>
        ),
      }}
    />
  );
}
