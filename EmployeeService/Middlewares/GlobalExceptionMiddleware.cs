namespace EmployeeService.Middlewares
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;

        public GlobalExceptionMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exceptions.ValidationException ex)
            {
                await HandleExceptionAsync(context, 400, ex.Errors);
            }
            catch (NotFoundException ex)
            {
                await HandleExceptionAsync(context, 404, new List<string> { ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                await HandleExceptionAsync(context, 401, new List<string> { ex.Message });
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, 500,
                    new List<string> { ex.Message });
            }

        }


        private static Task HandleExceptionAsync(HttpContext context, int statusCode, List<string> errors)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = statusCode;

            var response = ApiResponse<string>.FailureResponse(
                errors,
                "An error occurred while processing your request."
            );
            
            var json = JsonSerializer.Serialize(response);

            return context.Response.WriteAsync(json);
        }
    }
}
