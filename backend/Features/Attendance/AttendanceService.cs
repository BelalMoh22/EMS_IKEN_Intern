namespace backend.Features.Attendance
{
    public static class AttendanceStatuses
    {
        public const string Absent = "Absent";
        public const string Present = "Present";
        public const string Late = "Late";
        public const string EarlyLeave = "EarlyLeave";
        public const string LateAndEarlyLeave = "Late, EarlyLeave";
    }

    public class AttendanceCalcResult
    {
        public int LateMinutes { get; init; }
        public int EarlyLeaveMinutes { get; init; }
        public int WorkingMinutes { get; init; }
        public string Status { get; init; } = string.Empty;
    }

    public static class AttendanceService
    {
        private static readonly TimeSpan MinWorkStart = new(7, 0, 0);
        private static readonly TimeSpan LateThreshold = new(10, 0, 0);
        private static readonly TimeSpan MaxWorkEnd = new(18, 0, 0);
        private static readonly TimeSpan GracePeriod = TimeSpan.FromMinutes(15);
        private const int RequiredWorkMinutes = 480;

        public static AttendanceCalcResult Calculate(TimeSpan? checkIn, TimeSpan? checkOut)
        {
            if (IsAbsent(checkIn, checkOut))
                return CreateAbsentResult();

            var lateMinutes = CalculateLate(checkIn!.Value);
            var workingMinutes = CalculateWorkingMinutes(checkIn.Value, checkOut!.Value);
            var earlyLeaveMinutes = CalculateEarlyLeave(checkIn.Value, checkOut.Value, workingMinutes);

            var status = DetermineStatus(lateMinutes, earlyLeaveMinutes);

            return new AttendanceCalcResult
            {
                LateMinutes = lateMinutes,
                EarlyLeaveMinutes = earlyLeaveMinutes,
                WorkingMinutes = workingMinutes,
                Status = status
            };
        }

        private static bool IsAbsent(TimeSpan? checkIn, TimeSpan? checkOut)
        {
            return checkIn is null || checkOut is null;
        }

        private static AttendanceCalcResult CreateAbsentResult()
        {
            return new AttendanceCalcResult
            {
                LateMinutes = 0,
                EarlyLeaveMinutes = 0,
                WorkingMinutes = 0,
                Status = AttendanceStatuses.Absent
            };
        }

        private static int CalculateLate(TimeSpan checkIn)
        {
            if (checkIn <= LateThreshold)
                return 0;

            if (checkIn <= LateThreshold + GracePeriod)
                return 0;

            return (int)(checkIn - LateThreshold).TotalMinutes;
        }

        private static int CalculateWorkingMinutes(TimeSpan checkIn, TimeSpan checkOut)
        {
            var actualCheckIn = checkIn < MinWorkStart ? MinWorkStart : checkIn;

            if (checkOut <= actualCheckIn)
                return 0;

            return (int)(checkOut - actualCheckIn).TotalMinutes;
        }

        private static int CalculateEarlyLeave(TimeSpan checkIn, TimeSpan checkOut, int workingMinutes)
        {
            if (checkIn > LateThreshold)
            {
                if (checkOut < MaxWorkEnd)
                    return (int)(MaxWorkEnd - checkOut).TotalMinutes;

                return 0;
            }

            if (workingMinutes < RequiredWorkMinutes)
                return RequiredWorkMinutes - workingMinutes;

            return 0;
        }

        private static string DetermineStatus(int lateMinutes, int earlyLeaveMinutes)
        {
            if (lateMinutes > 0 && earlyLeaveMinutes > 0)
                return AttendanceStatuses.LateAndEarlyLeave;

            if (lateMinutes > 0)
                return AttendanceStatuses.Late;

            if (earlyLeaveMinutes > 0)
                return AttendanceStatuses.EarlyLeave;

            return AttendanceStatuses.Present;
        }
    }
}