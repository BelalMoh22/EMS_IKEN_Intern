using System;
using System.Data;
using Microsoft.Data.SqlClient;
using Dapper;

class Program {
    static void Main() {
        string conn = "Server=(localdb)\\MSSQLLocalDB;Database=EMS_DB;Trusted_Connection=True;TrustServerCertificate=True;";
        try {
            using var db = new SqlConnection(conn);
            var records = db.Query("SELECT TOP 5 * FROM Attendance");
            foreach (var r in records) {
                Console.WriteLine($"ID: {r.Id}, Emp: {r.EmployeeId}, Date: {r.Date}, Status: {r.Status}");
            }
            var count = db.ExecuteScalar<int>("SELECT COUNT(*) FROM Attendance");
            Console.WriteLine($"Total Count: {count}");
            
            var marchCount = db.ExecuteScalar<int>("SELECT COUNT(*) FROM Attendance WHERE MONTH(Date) = 3 AND YEAR(Date) = 2026");
            Console.WriteLine($"March 2026 Count: {marchCount}");
        } catch (Exception ex) {
            Console.WriteLine("Error: " + ex.Message);
        }
    }
}
