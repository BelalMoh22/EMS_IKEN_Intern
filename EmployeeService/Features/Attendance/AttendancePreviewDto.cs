namespace EmployeeService.Features.Attendance
{
    /// <summary>
    /// The per-row result returned from the upload-preview endpoint.
    /// No data is saved to the database at this stage.
    /// </summary>
    public class AttendancePreviewDto
    {
        public int EmployeeId { get; set; }

        /// <summary>ISO date string  "yyyy-MM-dd"</summary>
        public string Date { get; set; } = string.Empty;

        /// <summary>HH:mm or null</summary>
        public string? CheckIn { get; set; }

        /// <summary>HH:mm or null</summary>
        public string? CheckOut { get; set; }

        public int LateMinutes { get; set; }
        public string Status { get; set; } = string.Empty;

        public bool IsValid { get; set; }
        public List<string> Errors { get; set; } = [];

        // Internal-only — not serialised  ─────────────────────────
        internal TimeSpan? CheckInParsed { get; set; }
        internal TimeSpan? CheckOutParsed { get; set; }
        internal DateTime DateParsed { get; set; }
    }
}
