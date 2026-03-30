namespace EmployeeService.Features.Attendance
{
    public static class AttendanceService
    {
        private static readonly TimeSpan WorkStart = new(9, 0, 0);
        private static readonly TimeSpan GracePeriod = new(0, 15, 0);

        /// <summary>
        /// Returns the number of late minutes.
        /// If checkIn is null or within the grace window, returns 0.
        /// </summary>
        public static int CalculateLateMinutes(TimeSpan? checkIn)
        {
            if (checkIn is null)
                return 0;

            if (checkIn.Value > WorkStart + GracePeriod)
                return (int)(checkIn.Value - WorkStart).TotalMinutes;

            return 0;
        }

        /// <summary>
        /// Derives attendance status from checkIn and lateMinutes.
        /// </summary>
        public static string GetStatus(TimeSpan? checkIn, int lateMinutes)
        {
            if (checkIn is null)
                return "Absent";

            return lateMinutes > 0 ? "Late" : "Present";
        }
    }
}
