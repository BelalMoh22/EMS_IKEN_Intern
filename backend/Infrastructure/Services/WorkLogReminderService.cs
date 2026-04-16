namespace backend.Infrastructure.Services
{
    public class WorkLogReminderService
    {
        private readonly ISystemSettingsRepository _settingsRepository;
        private readonly EmployeeRepository _employeeRepository;
        private readonly IWorkLogRepository _workLogRepository;
        private readonly IEmailService _emailService;
        private readonly ILogger<WorkLogReminderService> _logger;

        public WorkLogReminderService(
            ISystemSettingsRepository settingsRepository,
            EmployeeRepository employeeRepository,
            IWorkLogRepository workLogRepository,
            IEmailService emailService,
            ILogger<WorkLogReminderService> logger)
        {
            _settingsRepository = settingsRepository;
            _employeeRepository = employeeRepository;
            _workLogRepository = workLogRepository;
            _emailService = emailService;
            _logger = logger;
        }

        public async Task CheckAndSendReminders()
        {
            _logger.LogInformation("Checking for overdue work logs...");

            // Skip on weekends (Friday & Saturday)
            if (DateTime.UtcNow.DayOfWeek == DayOfWeek.Friday || DateTime.UtcNow.DayOfWeek == DayOfWeek.Saturday)
            {
                _logger.LogInformation("Today is a weekend. Skipping reminders.");
                return;
            }

            var settings = await _settingsRepository.GetSystemSettingsAsync();
            if (!settings.IsReminderEnabled)
            {
                _logger.LogInformation("Work log reminders are disabled.");
                return;
            }

            var employees = (await _employeeRepository.GetEmployeesForReminderAsync()).ToList();
            _logger.LogInformation("Found {Count} overdue-eligible employees to check.", employees.Count);

            foreach (var employee in employees)
            {
                _logger.LogInformation("Checking status for employee: {FirstName} {LastName} (ID: {Id})", 
                    employee.FirstName, employee.Lastname, employee.Id);

                try
                {
                    var lastLog = await _workLogRepository.GetLastLogByEmployeeId(employee.Id);
                    DateTime lastLogDate = lastLog?.WorkDate ?? employee.HireDate;
                    
                    int workingDaysSinceLastLog = CalculateWorkingDays(lastLogDate, DateTime.UtcNow);

                    if (workingDaysSinceLastLog >= settings.WorkLogGracePeriodDays)
                    {
                        _logger.LogInformation("Employee {Id} is OVERDUE ({Days} working days).", employee.Id, workingDaysSinceLastLog);

                        // Check if a reminder was sent in the last 24 hours
                        if (!employee.LastReminderSentAt.HasValue || (DateTime.UtcNow - employee.LastReminderSentAt.Value).TotalHours >= 24)
                        {
                            await SendReminderEmail(employee, workingDaysSinceLastLog);
                            await _employeeRepository.UpdateLastReminderSentAtAsync(employee.Id, DateTime.UtcNow);
                        }
                        else
                        {
                            _logger.LogInformation("Skipping email for {Id}: Reminder already sent in the last 24 hours.", employee.Id);
                        }
                    }
                    else
                    {
                        _logger.LogInformation("Employee {Id} is up to date.", employee.Id);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing reminders for employee {Id}", employee.Id);
                }
            }
        }

        private int CalculateWorkingDays(DateTime start, DateTime end)
        {
            int workingDays = 0;

            for (var date = start.Date.AddDays(1); date < end.Date; date = date.AddDays(1))
            {
                if (date.DayOfWeek != DayOfWeek.Friday && date.DayOfWeek != DayOfWeek.Saturday)
                {
                    workingDays++;
                }
            }

            return workingDays;
        }

        private async Task SendReminderEmail(Employee employee, int workingDaysSinceLastLog)
        {
            string subject = "Action Required: Work Log Submission Reminder";
            string body = $@"
                <div style='font-family: sans-serif; padding: 20px; border: 1px solid #eee;'>
                    <h3>Work Log Reminder</h3>
                    <p>Hello {employee.FirstName},</p>
                    <p>You have not logged your work for <b>{workingDaysSinceLastLog} working days</b>.</p>
                    <p>Please log into the system and update your timesheet as soon as possible.</p>
                    <hr>
                    <p style='font-size: 12px; color: #888;'>
                        Best regards,<br>
                        <b>EMS Automated System</b>
                    </p>
                    <p style='font-size: 10px; color: #aaa; margin-top: 20px;'>
                        Note: If this email is in your Junk folder, please click <b>'Mark as Not Spam'</b> to receive future reminders in your Inbox.
                    </p>
                </div>";

            await _emailService.SendAsync(employee.Email, subject, body);
        }
    }
}
