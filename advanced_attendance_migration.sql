-- =============================================
-- SQL Script: Implement Advanced Attendance System
-- Part 4: Indices and Ensure Fields
-- =============================================

-- 1. Ensure Columns exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Attendance') AND name = 'LateMinutes')
BEGIN
    ALTER TABLE Attendance ADD LateMinutes INT NOT NULL DEFAULT 0;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Attendance') AND name = 'EarlyLeaveMinutes')
BEGIN
    ALTER TABLE Attendance ADD EarlyLeaveMinutes INT NOT NULL DEFAULT 0;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Attendance') AND name = 'WorkingMinutes')
BEGIN
    ALTER TABLE Attendance ADD WorkingMinutes INT NOT NULL DEFAULT 0;
END
GO

-- 2. Create Index for EmployeeId + Date for performance (Monthly and Drill-down)
IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'IX_Attendance_EmployeeId_Date')
BEGIN
    CREATE INDEX IX_Attendance_EmployeeId_Date ON Attendance (EmployeeId, Date);
END
GO

-- 3. Update Status column type if needed (to support combined status like "Late, EarlyLeave")
-- In case it was a restricted length, we expand it.
ALTER TABLE Attendance ALTER COLUMN Status NVARCHAR(100);
GO
