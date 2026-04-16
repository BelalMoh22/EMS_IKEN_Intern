namespace backend.Infrastructure.Services.EmailService
{
    public class EmailService : IEmailService
    {
        private readonly ILogger<EmailService> _logger;
        private readonly IConfiguration _configuration;

        public EmailService(ILogger<EmailService> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        public async Task SendAsync(string to, string subject, string body)
        {
            var smtpServer = _configuration["EmailSettings:SmtpServer"];
            var port = int.Parse(_configuration["EmailSettings:Port"] ?? "587");
            var senderEmail = _configuration["EmailSettings:SenderEmail"];
            var password = _configuration["EmailSettings:Password"];
            var senderName = _configuration["EmailSettings:SenderName"];

            try
            {
                _logger.LogInformation("Sending email to {Email}", to);

                using var mailMessage = new MailMessage
                {
                    From = new MailAddress(senderEmail!, senderName),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true
                };
                
                mailMessage.To.Add(to);
                
                mailMessage.Sender = new MailAddress(senderEmail!, senderName);

                mailMessage.ReplyToList.Add(new MailAddress(senderEmail!, senderName));
                mailMessage.Headers.Add("X-Auto-Response-Suppress", "All");
                mailMessage.Headers.Add("Precedence", "bulk");

                using var smtpClient = new SmtpClient(smtpServer)
                {
                    Port = port,
                    Credentials = new NetworkCredential(senderEmail, password),
                    EnableSsl = true
                };

                await smtpClient.SendMailAsync(mailMessage);

                _logger.LogInformation("Email sent successfully to {Email}", to);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {Email}", to);
                throw;
            }
        }
    }
}
