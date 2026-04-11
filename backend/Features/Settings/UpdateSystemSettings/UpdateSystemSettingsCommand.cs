namespace backend.Features.Settings.UpdateSystemSettings
{
    public class UpdateSystemSettingsCommand : IRequest<bool>
    {
        public int WorkLogGracePeriod { get; set; }

        public UpdateSystemSettingsCommand(int workLogGracePeriod)
        {
            WorkLogGracePeriod = workLogGracePeriod;
        }
    }
}
