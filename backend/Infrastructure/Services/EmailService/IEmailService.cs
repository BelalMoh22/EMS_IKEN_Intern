namespace backend.Infrastructure.Services.EmailService
{
    public interface IEmailService
    {
        Task SendAsync(string to, string subject, string body);
    }
}
