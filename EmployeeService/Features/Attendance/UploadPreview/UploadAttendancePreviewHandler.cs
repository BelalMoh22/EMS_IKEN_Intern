using OfficeOpenXml;

namespace EmployeeService.Features.Attendance.UploadPreview
{
    public class UploadAttendancePreviewHandler
        : IRequestHandler<UploadAttendancePreviewCommand, IEnumerable<AttendancePreviewDto>>
    {
        private readonly IRepository<Employee> _employeeRepo;
        private readonly AttendanceRepository _attendanceRepo;
        private readonly ILogger<UploadAttendancePreviewHandler> _logger;

        public UploadAttendancePreviewHandler(
            IRepository<Employee> employeeRepo,
            AttendanceRepository attendanceRepo,
            ILogger<UploadAttendancePreviewHandler> logger)
        {
            _employeeRepo = employeeRepo;
            _attendanceRepo = attendanceRepo;
            _logger = logger;
        }

        public async Task<IEnumerable<AttendancePreviewDto>> Handle(
            UploadAttendancePreviewCommand request,
            CancellationToken cancellationToken)
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            var results = new List<AttendancePreviewDto>();

            using var stream = request.File.OpenReadStream();
            using var package = new ExcelPackage(stream);

            var sheet = package.Workbook.Worksheets.FirstOrDefault()
                ?? throw new ArgumentException("Excel file contains no worksheets.");

            // Resolve header positions dynamically (case-insensitive)
            var headers = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
            for (int col = 1; col <= sheet.Dimension?.Columns; col++)
            {
                var header = sheet.Cells[1, col].Text?.Trim();
                if (!string.IsNullOrWhiteSpace(header))
                    headers[header] = col;
            }

            var requiredColumns = new[] { "EmployeeId", "Date", "CheckIn", "CheckOut" };
            var missingCols = requiredColumns.Where(c => !headers.ContainsKey(c)).ToList();
            if (missingCols.Any())
                throw new ArgumentException($"Missing required columns: {string.Join(", ", missingCols)}");

            int empIdCol    = headers["EmployeeId"];
            int dateCol     = headers["Date"];
            int checkInCol  = headers["CheckIn"];
            int checkOutCol = headers["CheckOut"];

            // Pre-load all employees (avoid N+1 DB calls per row)
            var allEmployees = (await _employeeRepo.GetAllAsync())
                .ToDictionary(e => e.Id);

            int totalRows = sheet.Dimension?.Rows ?? 1;

            for (int row = 2; row <= totalRows; row++)
            {
                var dto = new AttendancePreviewDto();

                // ── EmployeeId ──────────────────────────────────────
                var empIdText = sheet.Cells[row, empIdCol].Text?.Trim();
                if (!int.TryParse(empIdText, out int employeeId))
                {
                    dto.Errors.Add($"Row {row}: EmployeeId '{empIdText}' is not a valid integer.");
                    dto.IsValid = false;
                    results.Add(dto);
                    continue;
                }
                dto.EmployeeId = employeeId;

                if (!allEmployees.ContainsKey(employeeId))
                    dto.Errors.Add($"Employee with Id {employeeId} does not exist.");

                // ── Date ────────────────────────────────────────────
                var dateText = sheet.Cells[row, dateCol].Text?.Trim();
                if (!DateTime.TryParse(dateText, out DateTime parsedDate))
                    dto.Errors.Add($"Row {row}: Date '{dateText}' is not a valid date.");
                else
                {
                    dto.DateParsed = parsedDate.Date;
                    dto.Date = parsedDate.ToString("yyyy-MM-dd");

                    // Duplicate check in DB
                    if (allEmployees.ContainsKey(employeeId))
                    {
                        bool exists = await _attendanceRepo.ExistsByEmployeeAndDateAsync(employeeId, parsedDate);
                        if (exists)
                            dto.Errors.Add($"Attendance already exists for Employee {employeeId} on {dto.Date}.");
                    }
                }

                // ── CheckIn ─────────────────────────────────────────
                var checkInText = sheet.Cells[row, checkInCol].Text?.Trim();
                if (!string.IsNullOrWhiteSpace(checkInText))
                {
                    if (TimeSpan.TryParse(checkInText, out TimeSpan checkIn))
                        dto.CheckInParsed = checkIn;
                    else
                        dto.Errors.Add($"Row {row}: CheckIn '{checkInText}' is not a valid time (HH:mm).");
                }
                dto.CheckIn = dto.CheckInParsed.HasValue
                    ? dto.CheckInParsed.Value.ToString(@"hh\:mm")
                    : null;

                // ── CheckOut ────────────────────────────────────────
                var checkOutText = sheet.Cells[row, checkOutCol].Text?.Trim();
                if (!string.IsNullOrWhiteSpace(checkOutText))
                {
                    if (TimeSpan.TryParse(checkOutText, out TimeSpan checkOut))
                        dto.CheckOutParsed = checkOut;
                    else
                        dto.Errors.Add($"Row {row}: CheckOut '{checkOutText}' is not a valid time (HH:mm).");
                }
                dto.CheckOut = dto.CheckOutParsed.HasValue
                    ? dto.CheckOutParsed.Value.ToString(@"hh\:mm")
                    : null;

                // ── Business Logic (calculated server-side) ─────────
                dto.LateMinutes = AttendanceService.CalculateLateMinutes(dto.CheckInParsed);
                dto.Status      = AttendanceService.GetStatus(dto.CheckInParsed, dto.LateMinutes);

                dto.IsValid = dto.Errors.Count == 0;
                results.Add(dto);
            }

            _logger.LogInformation(
                "Upload preview processed {Total} rows — {Valid} valid, {Invalid} invalid.",
                results.Count,
                results.Count(r => r.IsValid),
                results.Count(r => !r.IsValid));

            return results;
        }
    }
}
