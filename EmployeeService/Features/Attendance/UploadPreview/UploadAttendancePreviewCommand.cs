namespace EmployeeService.Features.Attendance.UploadPreview
{
    public record UploadAttendancePreviewCommand(IFormFile File)
        : IRequest<IEnumerable<AttendancePreviewDto>>;
}
