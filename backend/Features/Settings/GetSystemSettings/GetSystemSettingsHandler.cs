namespace backend.Features.Settings.GetSystemSettings
{
    public class GetSystemSettingsHandler : IRequestHandler<GetSystemSettingsQuery, SystemSettingsDTO>
    {
        private readonly ISystemSettingsRepository _repo;

        public GetSystemSettingsHandler(ISystemSettingsRepository repo)
        {
            _repo = repo;
        }

        public async Task<SystemSettingsDTO> Handle(GetSystemSettingsQuery request, CancellationToken cancellationToken)
        {
            var gracePeriod = await _repo.GetWorkLogGracePeriodAsync();
            var isDisabled = await _repo.IsGracePeriodDisabledAsync();
            
            if (gracePeriod <= 0) 
                gracePeriod = 7;

            return new SystemSettingsDTO
            {
                WorkLogGracePeriod = gracePeriod,
                IsDisabled = isDisabled
            };
        }
    }
}
