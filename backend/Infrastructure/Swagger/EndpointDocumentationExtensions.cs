using backend.Domain.Common;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using System.Text.Json;

namespace backend.Infrastructure.Swagger
{
    public static class EndpointDocumentationExtensions
    {
        public static RouteHandlerBuilder DocumentJsonRequest<TRequest>(
            this RouteHandlerBuilder builder,
            object example)
            where TRequest : notnull
        {
            return builder
                .Accepts<TRequest>("application/json")
                .WithOpenApi(operation =>
                {
                    operation.RequestBody ??= new OpenApiRequestBody();
                    operation.RequestBody.Required = true;

                    operation.RequestBody.Content["application/json"] = new OpenApiMediaType
                    {
                        Example = new OpenApiString(JsonSerializer.Serialize(example, new JsonSerializerOptions
                        {
                            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                        }))
                    };

                    return operation;
                });
        }

        public static RouteHandlerBuilder DocumentApiResponse<T>(
            this RouteHandlerBuilder builder,
            string summary,
            string description)
        {
            return builder
                .WithSummary(summary)
                .WithDescription(description)
                .Produces<ApiResponse<T>>(StatusCodes.Status200OK, contentType: "application/json")
                .Produces<ApiResponse<string>>(StatusCodes.Status400BadRequest, contentType: "application/json")
                .Produces<ApiResponse<string>>(StatusCodes.Status404NotFound, contentType: "application/json")
                .Produces<ApiResponse<string>>(StatusCodes.Status500InternalServerError, contentType: "application/json")
                // Auth middleware responses are not wrapped in ApiResponse.
                .Produces(StatusCodes.Status401Unauthorized)
                .Produces(StatusCodes.Status403Forbidden);
        }

        public static RouteHandlerBuilder DocumentApiResponse(
            this RouteHandlerBuilder builder,
            string summary,
            string description)
        {
            return builder
                .WithSummary(summary)
                .WithDescription(description)
                .Produces(StatusCodes.Status200OK)
                .Produces<ApiResponse<string>>(StatusCodes.Status400BadRequest, contentType: "application/json")
                .Produces<ApiResponse<string>>(StatusCodes.Status404NotFound, contentType: "application/json")
                .Produces<ApiResponse<string>>(StatusCodes.Status500InternalServerError, contentType: "application/json")
                .Produces(StatusCodes.Status401Unauthorized)
                .Produces(StatusCodes.Status403Forbidden);
        }
    }
}

