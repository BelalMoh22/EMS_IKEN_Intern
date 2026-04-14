using Microsoft.Data.SqlClient;

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
            catch (BusinessException ex)
            {
                await HandleGenericException(context, 400, ex.Message);
            }
            catch (NotFoundException ex)
            {
                await HandleGenericException(context, 404, ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                await HandleGenericException(context, 401, ex.Message);
            }
            catch (SqlException ex) when (ex.Number == 2601 || ex.Number == 2627)
            {
                // Duplicate key violation – translate to user-friendly validation error
                var friendlyMessage = TranslateDuplicateKeyMessage(ex.Message);
                var errors = new Dictionary<string, List<string>>
                {
                    { "general", new List<string> { friendlyMessage } }
                };
                var response = ApiResponse<string>.FailureResponse(errors, "Validation failed");

                context.Response.ContentType = "application/json";
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                await context.Response.WriteAsync(JsonSerializer.Serialize(response));
            }
            catch (Exception ex)
            {
                // Sanitize: never expose raw internal/SQL details to the client
                var safeMessage = ex.Message.Contains("Cannot insert duplicate key")
                    || ex.Message.Contains("SqlException")
                    ? "A data conflict occurred. Please refresh and try again."
                    : ex.Message;

                await HandleGenericException(context, 500, safeMessage);
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

        /// <summary>
        /// Translates raw SQL duplicate-key messages into user-friendly text.
        /// </summary>
        private static string TranslateDuplicateKeyMessage(string rawMessage)
        {
            if (rawMessage.Contains("UX_WorkLogs_Employee_Date", StringComparison.OrdinalIgnoreCase))
                return "You have already submitted work logs for this date. Please edit the existing entry instead.";

            if (rawMessage.Contains("WorkLogs", StringComparison.OrdinalIgnoreCase))
                return "A duplicate work log entry was detected. Please review your submission.";

            return "A duplicate record was detected. Please review your data and try again.";
        }
    }
}