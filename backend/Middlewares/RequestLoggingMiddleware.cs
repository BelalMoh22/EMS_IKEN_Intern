namespace backend.Middlewares
{
    public class RequestLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RequestLoggingMiddleware> _logger;

        public RequestLoggingMiddleware(RequestDelegate next , ILogger<RequestLoggingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var request = context.Request;
            _logger.LogInformation("Incoming Request: {Method} {Path}",context.Request.Method,context.Request.Path);

            await _next(context);

            var response = context.Response;
            _logger.LogInformation("Outgoing Response: {StatusCode} for {Method} {Path}", response.StatusCode, request.Method, request.Path);
        }
    }
}
