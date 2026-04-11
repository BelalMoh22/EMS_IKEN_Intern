import { 
  Box, 
  FormControl, 
  InputLabel, 
  MenuItem, 
  Select, 
  TextField, 
  InputAdornment,
  FormControlLabel,
  Switch,
  Stack
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useEffect, useState } from "react";

interface LeaderboardControlsProps {
  onSearchChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onToggleTopThree: (value: boolean) => void;
  showTopThreeOnly: boolean;
  sortValue: string;
}

export const LeaderboardControls = ({
  onSearchChange,
  onSortChange,
  onToggleTopThree,
  showTopThreeOnly,
  sortValue,
}: LeaderboardControlsProps) => {
  const [localSearch, setLocalSearch] = useState("");

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "stretch", md: "center" },
        gap: 2,
        mb: 3,
      }}
    >
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ flex: 1 }}>
        <TextField
          placeholder="Search employee..."
          size="small"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }
          }}
          sx={{ minWidth: { sm: 300 } }}
        />

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel shrink={sortValue !== undefined}>Sort by</InputLabel>
          <Select
            value={sortValue}
            label="Sort by"
            onChange={(e) => onSortChange(e.target.value)}
            displayEmpty
          >
            <MenuItem value=""><em>None</em></MenuItem>
            <MenuItem value="hours-desc">Highest Hours</MenuItem>
            <MenuItem value="hours-asc">Lowest Hours</MenuItem>
            <MenuItem value="name-asc">Name (A → Z)</MenuItem>
            <MenuItem value="name-desc">Name (Z → A)</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <FormControlLabel
        control={
          <Switch
            checked={showTopThreeOnly}
            onChange={(e) => onToggleTopThree(e.target.checked)}
            color="primary"
          />
        }
        label="Show Top 3 Only"
        sx={{ ml: { md: 2 } }}
      />
    </Box>
  );
};
