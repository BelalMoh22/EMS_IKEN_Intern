namespace backend.Middlewares
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
                await HandleValidationException(context, ex);
            }
            catch (NotFoundException ex)
            {
                await HandleGenericException(context, 404, ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                await HandleGenericException(context, 401, ex.Message);
            }
            catch (Exception ex)
            {
                await HandleGenericException(context, 500, ex.Message);
            }
        }

        private static async Task HandleValidationException(HttpContext context, Exceptions.ValidationException ex)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = StatusCodes.Status400BadRequest;

            var response = ApiResponse<string>.FailureResponse(
                ex.Errors,
                "Validation failed"
            );

            var json = JsonSerializer.Serialize(response);
            await context.Response.WriteAsync(json);
        }

        private static async Task HandleGenericException(HttpContext context, int statusCode, string message)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = statusCode;

            var response = new ApiResponse<string>
            {
                Success = false,
                Message = message
            };

            var json = JsonSerializer.Serialize(response);
            await context.Response.WriteAsync(json);
        }
    }
}