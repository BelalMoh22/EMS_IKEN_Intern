using OfficeOpenXml;

namespace EmployeeService.Features.Attendance.Sync
{
    public class SyncAttendanceHandler
        : IRequestHandler<SyncAttendanceCommand, SyncResultDto>
    {
        private readonly IRepository<Employee> _employeeRepo;
        private readonly AttendanceRepository _attendanceRepo;
        private readonly ILogger<SyncAttendanceHandler> _logger;

        public SyncAttendanceHandler(
            IRepository<Employee> employeeRepo,
            AttendanceRepository attendanceRepo,
            ILogger<SyncAttendanceHandler> logger)
        {
            _employeeRepo = employeeRepo;
            _attendanceRepo = attendanceRepo;
            _logger = logger;
        }

        public async Task<SyncResultDto> Handle(
            SyncAttendanceCommand request,
            CancellationToken cancellationToken)
        {
            try
            {
                ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

                var result = new SyncResultDto();

                // Static file path (root of the solution/project)
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "..", "attendance_template.xlsx");
                
                if (!File.Exists(filePath))
                {
                    // Backup check in case we are running from project root
                    if (!File.Exists(filePath))
                    {
                        filePath = Path.Combine(Directory.GetCurrentDirectory(), "attendance_template.xlsx");
                    }
                }

                if (!File.Exists(filePath))
                {
                    result.Errors.Add($"Static file not found at: {filePath}");
                    return result;
                }

                using var stream = File.OpenRead(filePath);
                using var package = new ExcelPackage(stream);

                var sheet = package.Workbook.Worksheets.FirstOrDefault()
                    ?? throw new ArgumentException("Excel file contains no worksheets.");

                // ── Resolve header positions ────────────────────────────
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

                // Pre-load all employees
                var allEmployees = (await _employeeRepo.GetAllAsync())
                    .ToDictionary(e => e.Id);

                int totalRows = sheet.Dimension?.Rows ?? 1;

                for (int row = 2; row <= totalRows; row++)
                {
                    // ── Empty row check ─────────────────────────────────
                    var empIdText = sheet.Cells[row, empIdCol].Text?.Trim();
                    var dateTextRow = sheet.Cells[row, dateCol].Text?.Trim();
                    
                    if (string.IsNullOrWhiteSpace(empIdText) && string.IsNullOrWhiteSpace(dateTextRow))
                        continue;

                    // ── EmployeeId ──────────────────────────────────────
                    if (!int.TryParse(empIdText, out int employeeId))
                    {
                        result.Errors.Add($"Row {row}: EmployeeId '{empIdText}' is not a valid integer.");
                        result.Skipped++;
                        continue;
                    }

                    if (!allEmployees.ContainsKey(employeeId))
                    {
                        result.Errors.Add($"Row {row}: Employee with Id {employeeId} does not exist.");
                        result.Skipped++;
                        continue;
                    }

                    // ── Date ────────────────────────────────────────────
                    var dateText = sheet.Cells[row, dateCol].Text?.Trim();
                    if (!DateTime.TryParse(dateText, out DateTime parsedDate))
                    {
                        result.Errors.Add($"Row {row}: Date '{dateText}' is not a valid date.");
                        result.Skipped++;
                        continue;
                    }

                    // ── CheckIn ─────────────────────────────────────────
                    TimeSpan? checkIn = null;
                    var checkInRaw = sheet.Cells[row, checkInCol].Value;
                    if (checkInRaw != null)
                    {
                        var checkInText = checkInRaw.ToString()?.Trim();
                        if (!string.IsNullOrWhiteSpace(checkInText))
                        {
                            if (TimeSpan.TryParse(checkInText, out TimeSpan ci))
                                checkIn = ci;
                            else if (DateTime.TryParse(checkInText, out DateTime dt))
                                checkIn = dt.TimeOfDay;
                            else
                            {
                                result.Errors.Add($"Row {row}: CheckIn '{checkInText}' is not a valid time.");
                                result.Skipped++;
                                continue;
                            }
                        }
                    }

                    // ── CheckOut ────────────────────────────────────────
                    TimeSpan? checkOut = null;
                    var checkOutRaw = sheet.Cells[row, checkOutCol].Value;
                    if (checkOutRaw != null)
                    {
                        var checkOutText = checkOutRaw.ToString()?.Trim();
                        if (!string.IsNullOrWhiteSpace(checkOutText))
                        {
                            if (TimeSpan.TryParse(checkOutText, out TimeSpan co))
                                checkOut = co;
                            else if (DateTime.TryParse(checkOutText, out DateTime dt))
                                checkOut = dt.TimeOfDay;
                            else
                            {
                                result.Errors.Add($"Row {row}: CheckOut '{checkOutText}' is not a valid time.");
                                result.Skipped++;
                                continue;
                            }
                        }
                    }

                    // ── Business Logic ──────────────────────────────────
                    var calc = AttendanceService.Calculate(checkIn, checkOut);

                    // Add to result records for UI review
                    var emp = allEmployees[employeeId];
                    result.Records.Add(new AttendanceRecordDto
                    {
                        EmployeeId = employeeId,
                        EmployeeName = $"{emp.FirstName} {emp.Lastname}",
                        Date = parsedDate.ToString("yyyy-MM-dd"),
                        CheckIn = checkIn?.ToString(@"hh\:mm"),
                        CheckOut = checkOut?.ToString(@"hh\:mm"),
                        LateMinutes = calc.LateMinutes,
                        EarlyLeaveMinutes = calc.EarlyLeaveMinutes,
                        WorkingMinutes = calc.WorkingMinutes,
                        Status = calc.Status
                    });

                    // ── Check existing record ───────────────────────────
                    var existing = await _attendanceRepo.GetByEmployeeAndDateAsync(employeeId, parsedDate);

                    if (existing is not null)
                    {
                        // Update only if CheckIn or CheckOut changed
                        bool checkInChanged = existing.CheckIn != checkIn;
                        bool checkOutChanged = existing.CheckOut != checkOut;

                        if (checkInChanged || checkOutChanged)
                        {
                            await _attendanceRepo.UpdateAsync(existing.Id, new Domain.Models.Attendance
                            {
                                Id = existing.Id,
                                EmployeeId = employeeId,
                                Date = parsedDate.Date,
                                CheckIn = checkIn,
                                CheckOut = checkOut,
                                LateMinutes = calc.LateMinutes,
                                EarlyLeaveMinutes = calc.EarlyLeaveMinutes,
                                WorkingMinutes = calc.WorkingMinutes,
                                Status = calc.Status,
                                CreatedAt = existing.CreatedAt
                            });
                            result.Updated++;
                        }
                        else
                        {
                            result.Skipped++;
                        }
                    }
                    else
                    {
                        // Insert new record
                        await _attendanceRepo.InsertAsync(new Domain.Models.Attendance
                        {
                            EmployeeId = employeeId,
                            Date = parsedDate.Date,
                            CheckIn = checkIn,
                            CheckOut = checkOut,
                            LateMinutes = calc.LateMinutes,
                            EarlyLeaveMinutes = calc.EarlyLeaveMinutes,
                            WorkingMinutes = calc.WorkingMinutes,
                            Status = calc.Status,
                            CreatedAt = DateTime.UtcNow
                        });
                        result.Inserted++;
                    }
                }

                _logger.LogInformation(
                    "Sync completed — Inserted: {Inserted}, Updated: {Updated}, Skipped: {Skipped}, Errors: {Errors}",
                    result.Inserted, result.Updated, result.Skipped, result.Errors.Count);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error syncing attendance");
                return new SyncResultDto { Errors = new List<string> { $"Fatal Error: {ex.Message}" } };
            }
        }
    }
}
