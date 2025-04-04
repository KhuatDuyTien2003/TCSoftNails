namespace NailsTcsoft3.repository
{
    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string body);
    }
}
