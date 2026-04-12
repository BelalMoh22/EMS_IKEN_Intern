import { Box } from "@mui/material";
import { SearchInput } from "@/components/shared/SearchInput";
import { TimeRangeFilter, type TimeFilterType } from "@/pages/worklogs/TimeRangeFilter";

interface Props {
  filterType: TimeFilterType;
  onFilterTypeChange: (type: TimeFilterType) => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  dateLabel: string;
}

export const ReportsFilters = ({
  filterType,
  onFilterTypeChange,
  selectedDate,
  onDateChange,
  searchQuery,
  onSearchChange,
  dateLabel,
}: Props) => {
  return (
    <Box sx={{ mb: 4, display: "flex", flexDirection: "column", gap: 2 }}>
      <TimeRangeFilter
        filterType={filterType}
        onFilterTypeChange={onFilterTypeChange}
        selectedDate={selectedDate}
        onDateChange={onDateChange}
        label={dateLabel}
      />

      <Box sx={{ maxWidth: 400 }}>
        <SearchInput
          placeholder="Search employee by name..."
          value={searchQuery}
          onChange={onSearchChange}
        />
      </Box>
    </Box>
  );
};
