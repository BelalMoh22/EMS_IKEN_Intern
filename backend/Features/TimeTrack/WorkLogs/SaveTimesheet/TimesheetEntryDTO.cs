using System.ComponentModel.DataAnnotations;

namespace backend.Features.TimeTrack.WorkLogs.SaveTimesheet
{
    public class TimesheetEntryDTO
    {
        [Required]
        public int ProjectId { get; set; }

        [Required]
        public string Date { get; set; } = string.Empty;

        [Range(0, 24)]
        public decimal Hours { get; set; }

        public string? Notes { get; set; }
    }

    public class SaveTimesheetDTO
    {
        [Required]
        public List<TimesheetEntryDTO> Entries { get; set; } = new();
    }
}
