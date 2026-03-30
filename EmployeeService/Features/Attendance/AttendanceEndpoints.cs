namespace EmployeeService.Features.Attendance
{
    public static class AttendanceEndpoints
    {
        public static RouteGroupBuilder MapAttendanceEndpoints(this RouteGroupBuilder group)
        {
            UploadPreview.UploadAttendancePreviewEndpoint.MapEndpoint(group);
            Confirm.ConfirmAttendanceEndpoint.MapEndpoint(group);
            return group;
        }
    }
}
