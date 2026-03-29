//using EmployeeService.Domain.Enums;
//using EmployeeService.Domain.Models;
//using EmployeeService.Infrastructure.Repositories;
//using BCrypt.Net;

//namespace EmployeeService.Infrastructure.Data
//{
//    public static class DatabaseSeeder
//    {
//        public static async Task SeedAsync(IServiceProvider serviceProvider)
//        {
//            using var scope = serviceProvider.CreateScope();
//            var userRepository = scope.ServiceProvider.GetRequiredService<UserRepository>();


//            // Check if seeding is already done (or simple check like if any users exist)
//            // But we specifically want these 14 seed users.
//            // Let's seed them only if they don't exist by username.

//            var managers = new List<string> { "manager1", "manager2", "manager3", "manager4", "manager5", "manager6" };
//            var employees = new List<string> { "employee1", "employee2", "employee3", "employee4", "employee5", "employee6", "employee7", "employee8" };

//            // For simplicity and following user request exactly: 6 Managers and 8 Employees.
//            // We'll also check for an HR admin.
            
//            await SeedUserIfNotExists(userRepository, "HR", "HR@123456", Roles.HR);


//            foreach (var username in managers)
//            {
//                await SeedUserIfNotExists(userRepository, username, "Manager@123", Roles.Manager);

//            }

//            foreach (var username in employees)
//            {
//                await SeedUserIfNotExists(userRepository, username, "Employee@123", Roles.Employee);
//            }
//        }

//        private static async Task SeedUserIfNotExists(UserRepository userRepository, string username, string password, Roles role)
//        {
//            var exists = await userRepository.GetByUsernameAsync(username);
//            if (exists == null)
//            {

//                var user = new User
//                {
//                    Username = username,
//                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
//                    Role = role,
//                    MustChangePassword = true
//                };
//                await userRepository.AddAsync(user);
//            }
//        }
//    }
//}