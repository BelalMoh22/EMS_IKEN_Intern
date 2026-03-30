namespace EmployeeService.Features.Attendance.UploadPreview
{
    public static class UploadAttendancePreviewEndpoint
    {
        public static RouteGroupBuilder MapEndpoint(this RouteGroupBuilder group)
        {
            group.MapPost("/upload-preview", async (
                IFormFile file,
                [FromServices] IMediator mediator) =>
            {
                if (file is null || file.Length == 0)
                    return Results.BadRequest(
                        ApiResponse<string>.FailureResponse(
                            new() { { "file", ["No file was provided or the file is empty."] } },
                            "Upload failed"));

                var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (ext is not ".xlsx" and not ".csv")
                    return Results.BadRequest(
                        ApiResponse<string>.FailureResponse(
                            new() { { "file", ["Only .xlsx and .csv files are accepted."] } },
                            "Invalid file type"));

                var command = new UploadAttendancePreviewCommand(file);
                var result = await mediator.Send(command);

                return Results.Ok(
                    ApiResponse<IEnumerable<AttendancePreviewDto>>.SuccessResponse(
                        result, "Preview generated successfully"));
            })
            .WithName("UploadAttendancePreview")
            .WithTags("Attendance")
            .DisableAntiforgery()   // required for multipart/form-data in Minimal APIs
            .RequireAuthorization("FullCRUD");

            return group;
        }
    }
}
