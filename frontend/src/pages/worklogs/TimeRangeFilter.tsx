import { 
  Box, 
  ToggleButton, 
  ToggleButtonGroup, 
  TextField, 
  Typography, 
  Stack,
  Tooltip,
  IconButton
} from "@mui/material";
import { format, addDays, subDays } from "date-fns";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DateRangeIcon from "@mui/icons-material/DateRange";

export type TimeFilterType = "day" | "week" | "month" | "year";

interface TimeRangeFilterProps {
  filterType: TimeFilterType;
  onFilterTypeChange: (type: TimeFilterType) => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  label: string;
}

export const TimeRangeFilter = ({
  filterType,
  onFilterTypeChange,
  selectedDate,
  onDateChange,
  label,
}: TimeRangeFilterProps) => {
  
  const handleTypeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newType: TimeFilterType | null
  ) => {
    if (newType !== null) {
      onFilterTypeChange(newType);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    
    if (filterType === "year") {
      const year = parseInt(val);
      const newDate = new Date(selectedDate);
      newDate.setFullYear(year);
      onDateChange(newDate);
    } else {
      onDateChange(new Date(val));
    }
  };

  const shiftDate = (amount: number) => {
    let newDate = new Date(selectedDate);
    switch (filterType) {
      case "day":
        newDate = addDays(selectedDate, amount);
        break;
      case "week":
        newDate = addDays(selectedDate, amount * 7);
        break;
      case "month":
        newDate.setMonth(selectedDate.getMonth() + amount);
        break;
      case "year":
        newDate.setFullYear(selectedDate.getFullYear() + amount);
        break;
    }
    onDateChange(newDate);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "stretch", md: "center" },
        gap: 3,
        mb: 2,
        p: 2.5,
        background: "linear-gradient(to right, rgba(37, 99, 235, 0.05), rgba(37, 99, 235, 0.02))",
        borderRadius: 4,
        border: "1px solid",
        borderColor: "rgba(37, 99, 235, 0.1)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
      }}
    >
      <Stack direction={{ xs: "column", sm: "row" }} spacing={3} sx={{ alignItems: "center" }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <DateRangeIcon sx={{ color: "primary.main", fontSize: 20 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "primary.main", letterSpacing: "0.05em" }}>
            PERIOD
          </Typography>
        </Stack>
        
        <ToggleButtonGroup
          value={filterType}
          exclusive
          onChange={handleTypeChange}
          size="small"
          color="primary"
          sx={{ 
            bgcolor: "background.paper",
            borderRadius: 2.5,
            p: 0.5,
            border: "1px solid",
            borderColor: "divider",
            "& .MuiToggleButton-root": {
              border: "none",
              borderRadius: 2,
              px: { xs: 1.5, sm: 2.5 },
              py: 0.5,
              mx: 0.25,
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.8125rem",
              "&.Mui-selected": {
                bgcolor: "primary.main",
                color: "white",
                "&:hover": {
                  bgcolor: "primary.dark",
                }
              }
            }
          }}
        >
          <ToggleButton value="day">Day</ToggleButton>
          <ToggleButton value="week">Week</ToggleButton>
          <ToggleButton value="month">Month</ToggleButton>
          <ToggleButton value="year">Year</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Stack 
        direction="row" 
        spacing={2} 
        sx={{ 
          alignItems: "center", 
          flex: { md: 1 }, 
          justifyContent: { md: "flex-end" },
          bgcolor: { xs: "rgba(0,0,0,0.02)", md: "transparent" },
          p: { xs: 1, md: 0 },
          borderRadius: 3
        }}
      >
        <Box sx={{ textAlign: "right", display: { xs: "block", sm: "block" } }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary", lineHeight: 1.2 }}>
            {label}
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Selected Range
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Tooltip title="Previous">
            <IconButton onClick={() => shiftDate(-1)} size="small" sx={{ bgcolor: "background.paper", border: "1px solid", borderColor: "divider", "&:hover": { bgcolor: "grey.50" } }}>
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Box sx={{ position: "relative" }}>
            <TextField
              type={filterType === "month" ? "month" : (filterType === "year" ? "number" : "date")}
              size="small"
              value={filterType === "year" ? selectedDate.getFullYear() : format(selectedDate, filterType === "month" ? "yyyy-MM" : "yyyy-MM-dd")}
              onChange={handleDateChange}
              InputLabelProps={{ shrink: true }}
              slotProps={{
                htmlInput: filterType === "year" ? { min: 2000, max: 2100 } : {}
              }}
              sx={{ 
                width: filterType === "year" ? 90 : 160,
                bgcolor: "background.paper",
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  fontSize: "0.875rem",
                  fontWeight: 600
                }
              }}
            />
          </Box>

          <Tooltip title="Next">
            <IconButton onClick={() => shiftDate(1)} size="small" sx={{ bgcolor: "background.paper", border: "1px solid", borderColor: "divider", "&:hover": { bgcolor: "grey.50" } }}>
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Today">
            <IconButton 
              onClick={() => onDateChange(new Date())} 
              size="small" 
              color="primary"
              sx={{ bgcolor: "rgba(37, 99, 235, 0.08)", "&:hover": { bgcolor: "rgba(37, 99, 235, 0.15)" } }}
            >
              <CalendarTodayIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Box>
  );
};
