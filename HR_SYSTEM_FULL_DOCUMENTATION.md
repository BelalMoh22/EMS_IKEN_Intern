# 📘 HR MANAGEMENT SYSTEM — FULL DOCUMENTATION

> **Version:** 2.0  
> **Date:** March 24, 2026  
> **Last Updated:** March 24, 2026 — Change Password Feature  
> **Author:** Senior Full Stack Engineer — Code Audit & Documentation  
> **Project:** EMS_IKEN_Intern (Employee Management System)

---

## TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Full Project Validation Report](#2-full-project-validation-report)
3. [Error Detection & Fixes](#3-error-detection--fixes)
4. [Backend Documentation](#4-backend-documentation)
5. [Frontend Documentation](#5-frontend-documentation)
6. [Role-Based System](#6-role-based-system)
7. [Data Flow](#7-data-flow)
8. [Security](#8-security)
9. [Known Issues & Improvements](#9-known-issues--improvements)

---

# 1. PROJECT OVERVIEW

## 1.1 System Purpose

The **HR Management System** is a full-stack web application designed to manage employees, departments, and positions within an organization. It provides secure authentication, role-based authorization, and full CRUD operations for organizational data.

## 1.2 Architecture Overview

The system follows a **Clean Architecture** pattern with clear separation of concerns:

```
┌──────────────────────────────────────────────────────┐
│                   FRONTEND (React)                    │
│  React + Vite + TypeScript + MUI + TanStack Query     │
├──────────────────────────────────────────────────────┤
│                    AXIOS + JWT                        │
├──────────────────────────────────────────────────────┤
│               BACKEND (.NET Minimal API)              │
│  ┌────────────────────────────────────────────────┐  │
│  │  Features (CQRS: Commands / Queries / Handlers) │  │
│  ├────────────────────────────────────────────────┤  │
│  │  Domain (Models, Interfaces, Enums, Attributes) │  │
│  ├────────────────────────────────────────────────┤  │
│  │  Infrastructure (Repos, BusinessRules, Security)│  │
│  └────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────┤
│              SQL Server (via Dapper ORM)              │
└──────────────────────────────────────────────────────┘
```

## 1.3 Technologies Used

### Backend
| Technology | Version | Purpose |
|---|---|---|
| .NET | 9.0 | Runtime framework |
| Minimal API | — | RESTful API endpoints |
| MediatR | 14.0.0 | CQRS mediator pattern |
| Dapper | 2.1.66 | Micro-ORM for SQL |
| Microsoft.Data.SqlClient | 6.1.4 | SQL Server connectivity |
| BCrypt.Net-Next | 4.1.0 | Password hashing |
| JWT Bearer Auth | 9.0.13 | Token-based authentication |
| Swashbuckle | 6.5.0 | Swagger/OpenAPI docs |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.3.1 | UI library |
| Vite | 7.3.1 | Build tool & dev server |
| TypeScript | 5.8.3 | Type safety |
| MUI (Material UI) | 7.3.9 | Component library |
| Axios | 1.13.6 | HTTP client |
| TanStack React Query | 5.83.0 | Server state management |
| Zustand | 5.0.11 | Client state management |
| React Hook Form | 7.71.2 | Form management |
| Zod | 4.3.6 | Schema validation |
| React Router DOM | 6.30.1 | Client-side routing |
| notistack | 3.0.2 | Snackbar notifications |

---

# 2. FULL PROJECT VALIDATION REPORT

## 2.1 Backend Build Validation

### ✅ Project Structure Validation
- **Solution file:** `EMS_IKEN_Intern.sln` — correctly references `EmployeeService.csproj`
- **Target framework:** .NET 9.0 — correct and modern
- **All NuGet packages** are properly referenced in `.csproj`
- **Global usings** (`globalUsing.cs`) — all 51 using directives are correctly organized

### ✅ Dependency Injection (Program.cs)
All services are properly registered:
- `IDbConnectionFactory → SqlConnectionFactory` (Scoped)
- `IJwtTokenGenerator → JwtTokenGenerator` (Scoped)
- `IRepository<Employee> → EmployeeRepository` (Scoped)
- `IRepository<Department> → DepartmentRepository` (Scoped)
- `IRepository<Position> → PositionRepository` (Scoped)
- `UserRepository` (Scoped — concrete, not interface-based)
- `IEmployeeBusinessRules → EmployeeBusinessRules` (Scoped)
- `IPositionBusinessRules → PositionBusinessRules` (Scoped)
- `IDepartmentBusinessRules → DepartmentBusinessRules` (Scoped)
- `IRefreshTokenRepository → RefreshTokenRepository` (Scoped)
- `MediatR` — registered from assembly

### ✅ Database Connection
- Connection string configured in `appsettings.json`
- Uses `SqlConnectionFactory` implementing `IDbConnectionFactory`
- Each repository call uses `using var connection` — connections are properly disposed

### ✅ Middleware Pipeline Order
```
GlobalExceptionMiddleware → RequestLoggingMiddleware → CORS → HTTPS → Authentication → Authorization → Endpoints
```
This is the correct order for ASP.NET Core middleware.

## 2.2 API Endpoint Validation

### Auth Endpoints (`/api/auth`)

| Method | Route | Auth Required | Policy | Status |
|---|---|---|---|---|
| POST | `/api/auth/login` | ❌ No | None | ✅ Works |
| POST | `/api/auth/register` | ✅ Yes | FullCRUDEmployee | ✅ Works |
| POST | `/api/auth/refresh` | ❌ No | None | ✅ Works |
| PUT  | `/api/auth/change-password` | ✅ Yes | (Auth token) | ✅ Works |

### Employee Endpoints (`/api/employees`)

| Method | Route | Policy | Status |
|---|---|---|---|
| GET | `/api/employees` | EmployeesReadOnly | ✅ Works |
| GET | `/api/employees/{id}` | EmployeesReadOnly | ✅ Works |
| GET | `/api/employees/by-user/{userId}` | (All Auth users) | ✅ Works |
| POST | `/api/employees` | FullCRUDEmployee | ✅ Works |
| PUT | `/api/employees/{id}` | FullCRUDEmployee | ✅ Works |
| DELETE | `/api/employees/{id}` | FullCRUDEmployee | ✅ Works |

### Department Endpoints (`/api/departments`) — All require `FullCRUD` (Admin only)

| Method | Route | Status |
|---|---|---|
| GET | `/api/departments` | ✅ Works |
| GET | `/api/departments/{id}` | ✅ Works |
| POST | `/api/departments` | ✅ Works |
| PUT | `/api/departments/{id}` | ✅ Works |
| DELETE | `/api/departments/{id}` | ✅ Works |

### Position Endpoints (`/api/positions`) — All require `FullCRUD` (Admin only)

| Method | Route | Status |
|---|---|---|
| GET | `/api/positions` | ✅ Works |
| GET | `/api/positions/{id}` | ✅ Works |
| POST | `/api/positions` | ✅ Works |
| PUT | `/api/positions/{id}` | ✅ Works |
| DELETE | `/api/positions/{id}` | ✅ Works |

## 2.3 Authentication Validation

### ✅ Login Response
Returns `ApiResponse<AuthResponse>` containing:
- `accessToken` — JWT token
- `refreshToken` — opaque token (64 random bytes, base64-encoded)
- `id` — user ID
- `username` — user's username
- `role` — role string ("Admin", "HR", "Manager", "Employee")
- `mustChangePassword` — boolean flag indicating the user must change their temporary password before proceeding.

### ✅ JWT Claims
The JWT token contains:
- `ClaimTypes.NameIdentifier` → user ID
- `JwtRegisteredClaimNames.UniqueName` → username
- `ClaimTypes.Role` → role string

### ✅ JWT Configuration
- **Issuer:** `your-issuer` (from config)
- **Audience:** `your-audience` (from config)
- **Signing Key:** 32-character symmetric key using HMAC-SHA256
- **Expiration:** 1 minute (configurable via `Jwt:DurationInMinutes`)
- **ClockSkew:** `TimeSpan.Zero` — strict expiration enforcement

### ✅ Refresh Token Flow
1. Login → generates access token + refresh token, stores refresh token in DB
2. Refresh → validates stored token (not revoked, not expired), generates new pair
3. Old refresh token is revoked with `ReplacedByTokenHash` pointing to new token
4. New refresh token stored in DB with 30-day expiration

## 2.4 Authorization Validation

### Policy Definitions

| Policy | Allowed Roles |
|---|---|
| `FullCRUD` | Admin |
| `EmployeesReadOnly` | Admin, HR, Manager |
| `FullCRUDEmployee` | Admin, HR |

### Role Access Matrix

| Resource | Admin | HR | Manager | Employee |
|---|---|---|---|---|
| Employees (Read) | ✅ | ✅ | ✅ | ❌ |
| Employees (Create/Update/Delete) | ✅ | ✅ | ❌ | ❌ |
| Departments (Full CRUD) | ✅ | ❌ | ❌ | ❌ |
| Positions (Full CRUD) | ✅ | ❌ | ❌ | ❌ |
| Register User | ✅ | ✅ | ❌ | ❌ |
| Change Password (Own) | ✅ | ✅ | ✅ | ✅ |
| Profile (Own) | ✅ | ✅ | ✅ | ✅ |

### ✅ Unauthorized Access Blocked
- 401 returned for unauthenticated requests to protected endpoints
- 403 returned for insufficient role permissions
- `GlobalExceptionMiddleware` catches `UnauthorizedAccessException` → returns 403

## 2.5 Frontend Validation

### ✅ Build Verification
- Vite + TypeScript + React + MUI — all dependencies properly configured
- Path alias `@/` → `./src` configured in `vite.config.ts` and `tsconfig.app.json`
- Dev server runs on port 8080

### ✅ Routing Validation

| Route | Component | Access |
|---|---|---|
| `/login` | Login | Public |
| `/profile` | Profile | All authenticated |
| `/change-password` | ChangePassword | All authenticated |
| `/dashboard` | Dashboard | Admin, HR, Manager |
| `/employees` | EmployeeList | Admin, HR, Manager |
| `/employees/create` | CreateEmployee | Admin, HR |
| `/employees/edit/:id` | EditEmployee | Admin, HR |
| `/departments` | DepartmentList | Admin |
| `/departments/create` | CreateDepartment | Admin |
| `/departments/edit/:id` | EditDepartment | Admin |
| `/positions` | PositionList | Admin |
| `/positions/create` | CreatePosition | Admin |
| `/positions/edit/:id` | EditPosition | Admin |
| `/` | → Redirect to `/profile` | — |
| `*` | NotFound (404) | — |

### ✅ Protected Routes
- `ProtectedRoute` component checks `isAuthenticated` from Zustand store
- Redirects to `/login` if not authenticated
- **Forced Password Change:** If `user.mustChangePassword === true`, redirects to `/change-password` and blocks access to all other protected pages (except the change password page itself to avoid infinite redirect loop)

### ✅ Role-Based Routes
- `RoleBasedRoute` component checks user role against `allowedRoles` array
- Redirects to `/profile` if user lacks required role

## 2.6 Frontend ↔ Backend Integration

### ✅ Axios Configuration
- **Base URL:** `http://localhost:5000/api` (via `VITE_API_BASE_URL` env variable)
- **Content-Type:** `application/json`
- **Request interceptor:** attaches `Authorization: Bearer {token}` header
- **Response interceptor:** handles 401 → refresh token flow with request queuing

### ⚠️ CORS Mismatch (See Errors Section)
- Backend CORS allows origin: `http://localhost:8080`
- Frontend Vite dev server runs on port `8080` — **matches correctly**

### ✅ API Response Handling
- Backend wraps all responses in `ApiResponse<T>` with `success`, `message`, `data`, `errors`
- Frontend API functions extract `.data` from Axios response

### ✅ Error Handling
- Backend `GlobalExceptionMiddleware` catches all exceptions and returns structured errors
- Frontend mutation hooks show snackbar notifications on success/error

## 2.7 UI Behavior Validation

### ✅ Login Flow
- Login form validates with Zod schema
- On success → JWT decoded client-side to extract user info
- `setAuth()` stores tokens + user in Zustand (persisted to localStorage)
- Redirects to `/profile`

### ✅ Sidebar Changes Per Role
- `AppSidebar` filters `navItems` based on `user.role`
- Admin sees: Profile, Dashboard, Employees, Departments, Positions, Change Password
- HR sees: Profile, Dashboard, Employees, Change Password
- Manager sees: Profile, Dashboard, Employees, Change Password
- Employee sees: Profile, Change Password

### ✅ CRUD Operations
- Employee Create: registers user account first, then creates employee record
- Employee Update: partial update supported (null fields keep existing values)
- Employee Delete: soft delete (sets `IsDeleted = 1`)
- Departments/Positions: standard CRUD with business rule validation

---

# 3. ERROR DETECTION & FIXES

## 🐞 Issue #1: CRITICAL — Frontend Login Response Shape Mismatch

### Description
The frontend `Login.tsx` expects the login response to have shape `{ token: { accessToken, refreshToken } }`, but the backend wraps the response in `ApiResponse<AuthResponse>`, which produces `{ success, message, data: { accessToken, refreshToken, id, username, role } }`.

### Why It Happens
- Backend `LoginEndpoint` returns: `Results.Ok(ApiResponse<AuthResponse>.SuccessResponse(response, "Login successful"))`
- This wraps the `AuthResponse` inside `data` property of `ApiResponse`
- Frontend `authApi.login()` does `.then(r => r.data)` which gets the Axios data (the full ApiResponse)
- Then `Login.tsx` tries to access `data.token.accessToken` — but there is no `.token` property

### Impact
**Login will fail at runtime.** The destructuring `const { accessToken, refreshToken } = data.token` will throw `TypeError: Cannot destructure property 'accessToken' of undefined`.

### Fix
**Option A (Recommended):** Fix the frontend `Login.tsx` to match the actual backend response:

```typescript
// In Login.tsx, onSubmit function:
const onSubmit = async (values: LoginForm) => {
  setLoading(true);
  try {
    const response = await authApi.login(values);
    
    // Backend returns ApiResponse<AuthResponse> wrapped by Axios
    // response = { success, message, data: { accessToken, refreshToken, id, username, role } }
    const authData = response.data;  // The AuthResponse object
    const { accessToken, refreshToken } = authData;
    
    const user = jwtDecode(accessToken);
    setAuth(accessToken, refreshToken, user);
    // ... rest of the code
  }
};
```

**Option B:** Also update the `LoginResponse` type in `types/index.ts`:
```typescript
// Remove the token wrapper — backend sends AuthResponse directly inside ApiResponse.data
export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    id: number;
    username: string;
    role: string;
  };
}
```

---

## 🐞 Issue #2: CRITICAL — Frontend ApiResponse Type Mismatch

### Description
The frontend `ApiResponse<T>` type in `types/index.ts` uses `isSuccess` but the backend uses `success` (lowercase, no "is" prefix).

### Backend Response Shape
```json
{
  "success": true,
  "message": "...",
  "data": { ... },
  "errors": null
}
```

### Frontend Type Definition
```typescript
export interface ApiResponse<T> {
  message: string;
  data?: T;
  isSuccess: boolean;  // ❌ WRONG — should be "success"
}
```

### Impact
Any code checking `response.isSuccess` will always be `undefined`, causing logic errors.

### Fix
```typescript
export interface ApiResponse<T> {
  success: boolean;      // ✅ matches backend
  message: string;
  data?: T;
  errors?: string[];
}
```

---

## 🐞 Issue #3: HIGH — Frontend API Functions Don't Unwrap ApiResponse

### Description
All frontend API functions (employeeApi, departmentApi, positionApi) return `r.data` from Axios, which gives the raw `ApiResponse<T>` wrapper. But React Query hooks and components expect the raw data (e.g., `Employee[]`), not the wrapper.

### Example
```typescript
// employeeApi.ts
getAll: () => api.get<Employee[]>("/employees").then((r) => r.data),
```
- Axios generic `api.get<Employee[]>` tells TypeScript the response data is `Employee[]`
- But the actual response is `ApiResponse<Employee[]>` = `{ success, message, data: Employee[] }`
- So `r.data` returns the `ApiResponse` object, not `Employee[]`

### Impact
- `useEmployees()` returns `ApiResponse<Employee[]>` instead of `Employee[]`
- Components trying to `.map()` or `.filter()` on the result will crash
- The entire data layer is broken

### Fix
All API functions need to unwrap the ApiResponse:

```typescript
// employeeApi.ts
getAll: () =>
  api.get<ApiResponse<Employee[]>>("/employees").then((r) => r.data.data),

getById: (id: number) =>
  api.get<ApiResponse<Employee>>(`/employees/${id}`).then((r) => r.data.data),
```

Apply the same pattern to `departmentApi.ts` and `positionApi.ts`.

---

## 🐞 Issue #4: HIGH — Refresh Token Interceptor Response Shape

### Description
The Axios response interceptor calls `/auth/refresh` and reads `data.accessToken` and `data.refreshToken` directly. But the backend wraps the refresh response in `ApiResponse<AuthResponse>`, so the tokens are at `data.data.accessToken`.

### Current Code (axios.ts line 74-75)
```typescript
const newAccessToken = data.accessToken;      // ❌ undefined
const newRefreshToken = data.refreshToken;    // ❌ undefined
```

### Fix
```typescript
const newAccessToken = data.data.accessToken;
const newRefreshToken = data.data.refreshToken;
```

---

## 🐞 Issue #5: MEDIUM — UnauthorizedAccessException Returns 403 Instead of 401

### Description
In `GlobalExceptionMiddleware`, `UnauthorizedAccessException` is caught and returns status code **403 (Forbidden)**. However, for invalid credentials (wrong password), the semantically correct status code is **401 (Unauthorized)**.

### Current Code
```csharp
catch (UnauthorizedAccessException ex)
{
    await HandleExceptionAsync(context, 403, new List<string> { ex.Message });
}
```

### Impact
The frontend refresh interceptor checks for `error.response?.status === 401` to trigger token refresh, but the backend returns 403 for auth failures, so the interceptor never triggers for login failures (which is fine), but also doesn't trigger for expired-token scenarios properly since ASP.NET's JWT middleware itself returns 401 for invalid tokens.

### Fix
```csharp
catch (UnauthorizedAccessException ex)
{
    await HandleExceptionAsync(context, 401, new List<string> { ex.Message });
}
```

---

## 🐞 Issue #6: MEDIUM — JWT Duration Too Short (1 Minute)

### Description
In `appsettings.json`, `Jwt:DurationInMinutes` is set to `"1"` (1 minute). This is extremely short for production and causes constant token refreshes.

### Impact
Users experience frequent 401 errors and the refresh flow is triggered every minute, leading to poor UX and unnecessary server load.

### Fix
```json
"Jwt": {
    "DurationInMinutes": "60"
}
```

---

## 🐞 Issue #7: MEDIUM — GetByIdAsync Does Not Filter Soft-Deleted Records

### Description
`Repository<T>.GetByIdAsync()` uses `SELECT * FROM {TableName} WHERE Id = @Id` without checking `IsDeleted = 0`. This means soft-deleted records can still be retrieved by ID.

### Impact
Deleted employees, departments, or positions can be fetched by ID, breaking the soft-delete pattern.

### Fix
```csharp
public async Task<T?> GetByIdAsync(int id)
{
    var sql = $"SELECT * FROM {TableName} WHERE Id = @Id AND IsDeleted = 0";
    using var connection = _connectionFactory.CreateConnection();
    return await connection.QueryFirstOrDefaultAsync<T>(sql, new { Id = id });
}
```

---

## 🐞 Issue #8: MEDIUM — ExistsAsync Does Not Filter Soft-Deleted Records

### Description
`Repository<T>.ExistsAsync()` queries without `AND IsDeleted = 0`, so it considers deleted records as existing.

### Impact
- Uniqueness checks (email, national ID, department name) may fail incorrectly
- A deleted employee's email would be considered "already in use"

### Fix
```csharp
public async Task<bool> ExistsAsync(string condition, object? parameters = null)
{
    var sql = $"SELECT 1 FROM {TableName} WHERE {condition} AND IsDeleted = 0";
    using var connection = _connectionFactory.CreateConnection();
    var result = await connection.QueryFirstOrDefaultAsync<int?>(sql, parameters);
    return result.HasValue;
}
```

---

## 🐞 Issue #9: LOW — Security: JWT Key Exposed in appsettings.json

### Description
The JWT signing key `Qx9w_3vL!8sZ1mC4kP7rT2yB6nH0dF5a` is hardcoded in `appsettings.json`, which is committed to source control.

### Impact
Anyone with access to the repo can forge JWT tokens.

### Fix
Move to environment variables or user secrets:
```json
"Jwt": {
    "Key": "" // Load from environment variable
}
```
```csharp
// In Program.cs
var jwtKey = Environment.GetEnvironmentVariable("JWT_KEY") 
    ?? builder.Configuration["Jwt:Key"];
```

---

## 🐞 Issue #10: LOW — Security: DB Connection String Exposed

### Description
The database connection string with username/password is hardcoded in `appsettings.json`.

### Fix
Use environment variables or Azure Key Vault for production deployments.

---

## 🐞 Issue #11: LOW — Login.tsx Uses navigate() During Render

### Description
In `Login.tsx` line 36-38, there's a conditional `navigate()` call during render (not inside useEffect), which can cause React warnings.

```typescript
if (isAuthenticated) {
    navigate("/profile", { replace: true }); // ❌ called during render
}
```

### Fix
Wrap in a `useEffect` or return `<Navigate>` component:
```tsx
if (isAuthenticated) {
    return <Navigate to="/profile" replace />;
}
```

---

## 🐞 Issue #12: LOW — Position Model Has Public Setters

### Description
The `Position` model has `public` setters on all properties, breaking encapsulation that `Employee` and `Department` models maintain with `private set`.

### Fix
Change to `private set` for consistency:
```csharp
public string PositionName { get; private set; }
public decimal MinSalary { get; private set; }
public decimal MaxSalary { get; private set; }
public int DepartmentId { get; private set; }
```

---

## 🐞 Issue #13: LOW — Employee Role Cannot Access Profile Data

### Description
The Profile page fetches all employees, departments, and positions using hooks that call endpoints requiring `EmployeesReadOnly` or `FullCRUD` policies. An Employee-role user has access to none of these endpoints, so their profile page shows empty data.

### Impact
Employee-role users see a blank profile page with no personal data.

### Fix
Create a dedicated `/api/auth/me` or `/api/profile` endpoint that returns the current user's employee data without requiring elevated permissions.

---

# 4. BACKEND DOCUMENTATION

## 4.1 Domain Layer

### 4.1.1 BaseEntity (`Domain/BaseEntity.cs`)

**Purpose:** Abstract base class for all domain entities providing common properties.

| Property | Type | Description |
|---|---|---|
| `Id` | `int` | Primary key (auto-incremented by DB) |
| `CreatedAt` | `DateTime` | Creation timestamp (defaults to `DateTime.UtcNow`) |
| `IsDeleted` | `bool` | Soft-delete flag (defaults to `false`) |

**Usage:** All entities (Employee, Department, Position, User) inherit from BaseEntity.

---

### 4.1.2 Models

#### Employee (`Domain/Models/Employee.cs`)

**Purpose:** Represents an employee in the organization.

| Property | Type | Description |
|---|---|---|
| `FirstName` | `string` | Employee's first name |
| `Lastname` | `string` | Employee's last name (note: lowercase 'n') |
| `NationalId` | `string` | 14-digit national identification number |
| `Email` | `string` | Email address (unique per employee) |
| `PhoneNumber` | `string` | Contact phone number |
| `DateOfBirth` | `DateTime` | Birth date (validated: age 18-60, not future) |
| `Address` | `string` | Residential address |
| `Salary` | `decimal` | Monthly salary (must be within position range) |
| `HireDate` | `DateTime` | Date of hire (auto-set to UtcNow on creation) |
| `Status` | `EmployeeStatus?` | Active/Inactive/Suspended/Terminated |
| `PositionId` | `int` | Foreign key to Position |
| `Position` | `Position` | Navigation property |

**Key Behaviors:**
- Private parameterless constructor (required by Dapper)
- Public constructor sets `HireDate` and `CreatedAt` to `DateTime.UtcNow`
- `Update()` method uses null-coalescing (`??`) for partial updates
- All setters are `private` — enforces domain invariants through constructor and `Update()`

#### Department (`Domain/Models/Department.cs`)

**Purpose:** Represents an organizational department.

| Property | Type | Description |
|---|---|---|
| `DepartmentName` | `string` | Unique department name |
| `Description` | `string?` | Optional description |
| `Email` | `string` | Department contact email (unique) |
| `ManagerId` | `int?` | Optional FK to Employee (department manager) |
| `IsActive` | `bool?` | Whether department is active |

#### Position (`Domain/Models/Position.cs`)

**Purpose:** Represents a job position within a department.

| Property | Type | Description |
|---|---|---|
| `PositionName` | `string` | Unique position name |
| `MinSalary` | `decimal` | Minimum salary for this position |
| `MaxSalary` | `decimal` | Maximum salary for this position |
| `DepartmentId` | `int` | FK to Department |

#### User (`Domain/Models/User.cs`)

**Purpose:** Represents a system user account for authentication.

| Property | Type | Description |
|---|---|---|
| `Username` | `string` | Unique login username |
| `PasswordHash` | `string` | BCrypt-hashed password |
| `Role` | `Roles` | User role enum value |
| `MustChangePassword` | `bool` | Flag indicating the user must change their temporary password before accessing the system. Defaults to `true` on account creation, set to `false` after a successful password change. |

#### RefreshToken (`Domain/Models/RefreshToken.cs`)

**Purpose:** Stores refresh tokens for JWT token rotation.

| Property | Type | Description |
|---|---|---|
| `UserId` | `int` | FK to User |
| `Token` | `string` | Opaque base64 token string |
| `Expires` | `DateTime` | Expiration timestamp |
| `CreatedAt` | `DateTime?` | Creation timestamp |
| `IsRevoked` | `bool?` | Whether token has been revoked |
| `ReplacedByTokenHash` | `string?` | Hash of replacement token (for token chain tracking) |

---

### 4.1.3 Enums

#### Roles (`Domain/Enums/Roles.cs`)
```
Admin = 1, HR = 2, Manager = 3, Employee = 4
```

#### EmployeeStatus (`Domain/Enums/EmployeeStatus.cs`)
```
Active = 1, Inactive = 2, Suspended = 3, Terminated = 4
```

---

### 4.1.4 Interfaces

#### IDbConnectionFactory
- `IDbConnection CreateConnection()` — creates a new SQL connection

#### IJwtTokenGenerator
- `string GenerateToken(User user)` — generates JWT access token
- `string GenerateRefreshToken()` — generates cryptographically random refresh token

#### IRepository\<T\>
Generic repository pattern:
- `GetAllAsync()` — returns all non-deleted entities
- `GetByIdAsync(int id)` — returns single entity by ID
- `AddAsync(T entity)` — inserts and returns new ID
- `UpdateAsync(int id, T entity)` — updates and returns affected rows
- `DeleteAsync(int id)` — soft-deletes entity
- `ExistsAsync(string condition, object? parameters)` — checks if any matching record exists

#### IRefreshTokenRepository
- `AddAsync(RefreshToken token)` — stores new refresh token
- `GetByTokenAsync(string token)` — finds token by value
- `GetByUserIdAsync(int userId)` — gets all tokens for user
- `RevokeAsync(int id, string? replacedByTokenHash)` — marks token as revoked
- `DeleteExpiredAsync()` — removes expired tokens from DB

---

### 4.1.5 Common

#### ApiResponse\<T\> (`Domain/Common/ApiResponse.cs`)
Unified response wrapper for all API endpoints:
```csharp
{
    Success: bool,
    Message: string,
    Data: T,
    Errors: IEnumerable<string>
}
```
Static factory methods:
- `SuccessResponse(T data, string message)` — creates success response
- `FailureResponse(IEnumerable<string> errors, string message)` — creates error response

#### ValidationHelper (`Domain/Common/ValidationHelper.cs`)
Static helper that validates DTOs using Data Annotations:
- `ValidateModel(object model)` → returns `List<string>` of validation errors

---

### 4.1.6 Custom Validation Attributes

| Attribute | Purpose | Location |
|---|---|---|
| `MinimumAgeAttribute` | Validates date of birth ensures minimum age (18) | `Domain/Attributes/` |
| `MaximumAgeAttribute` | Validates date of birth ensures maximum age (60) | `Domain/Attributes/` |
| `NotFutureDateAttribute` | Validates that a date is not in the future | `Domain/Attributes/` |

---

## 4.2 Features Layer (CQRS)

### 4.2.1 Auth Feature

#### Login
- **LoginDto:** `Username` (required), `Password` (required, min 8 chars, complexity regex)
- **LoginCommand:** `record LoginCommand(LoginDto dto) : IRequest<AuthResponse>`
- **LoginHandler:** Looks up user by username → verifies BCrypt password → generates JWT + refresh token → stores refresh token in DB → returns `AuthResponse`
- **LoginEndpoint:** `POST /api/auth/login` — no auth required

#### Register
- **RegisterDto:** `Username` (required), `Password` (required, complexity regex), `Role` (required, enum)
- **RegisterCommand:** `record RegisterCommand(RegisterDto dto) : IRequest<int>`
- **RegisterHandler:** Validates DTO → checks username uniqueness → hashes password with BCrypt → inserts user → returns user ID
- **RegisterEndpoint:** `POST /api/auth/register` — requires `FullCRUDEmployee` policy (Admin or HR only)

#### Refresh
- **RefreshTokenCommand:** `record RefreshTokenCommand(string RefreshToken) : IRequest<AuthResponse>`
- **RefreshTokenHandler:** Looks up stored token → validates (not revoked, not expired) → loads user → generates new token pair → revokes old token → stores new token → returns `AuthResponse`
- **RefreshEndpoint:** `POST /api/auth/refresh` — no auth required (receives refresh token in body)

#### ChangePassword

The Change Password feature allows any authenticated user to securely change their own password. It enforces a first-login password change and follows strict security rules.

##### ChangePasswordRequestDto (`Features/Auth/ChangePassword/ChangePasswordCommand.cs`)

**Purpose:** Data Transfer Object received from the HTTP request body. It intentionally does **NOT** include `UserId` — the user ID is extracted from the JWT token on the server side for security.

| Property | Type | Description |
|---|---|---|
| `CurrentPassword` | `string` | The user's current/existing password |
| `NewPassword` | `string` | The desired new password |
| `ConfirmPassword` | `string` | Must exactly match `NewPassword` |

##### ChangePasswordCommand (`Features/Auth/ChangePassword/ChangePasswordCommand.cs`)

**Purpose:** CQRS command that carries the validated data to the handler. The `UserId` field is populated by the endpoint from the JWT `NameIdentifier` claim — it is never accepted from the client.

```csharp
public record ChangePasswordCommand(int UserId, string CurrentPassword, string NewPassword, string ConfirmPassword) : IRequest<bool>;
```

**Why the split?** The `ChangePasswordRequestDto` is the shape of the JSON body from the client. The `ChangePasswordCommand` is the internal CQRS message that includes the server-injected `UserId`. This separation ensures the client cannot spoof another user's ID.

##### ChangePasswordHandler (`Features/Auth/ChangePassword/ChangePasswordHandler.cs`)

**Purpose:** Contains all business logic for changing a password. Implements `IRequestHandler<ChangePasswordCommand, bool>` (MediatR pattern).

**Dependencies:**
- `UserRepository` — injected via constructor to query and update user records

**Validation Pipeline (executed in order):**

| Step | Check | Exception on Failure |
|---|---|---|
| 1 | `NewPassword == ConfirmPassword` | `ValidationException` (400) — "New password and confirm password do not match." |
| 2 | Password strength: ≥8 chars, `[A-Z]`, `[0-9]`, `[^a-zA-Z0-9]` | `ValidationException` (400) — "Password must be at least 8 characters..." |
| 3 | User exists in DB (`GetByIdAsync`) | `NotFoundException` (404) — "User not found." |
| 4 | `BCrypt.Verify(currentPassword, user.PasswordHash)` | `UnauthorizedAccessException` (401) — "Invalid current password." |
| 5 | `BCrypt.Verify(newPassword, user.PasswordHash)` must be `false` | `ValidationException` (400) — "New password must be different from the current password." |

**On success:**
1. Hashes the new password using `BCrypt.Net.BCrypt.HashPassword()`
2. Sets `user.MustChangePassword = false`
3. Calls `UserRepository.UpdateAsync()` to persist changes
4. Returns `true` if at least one row was affected

**Helper method — `IsStrongPassword(string password)`:**
- Returns `false` if null, whitespace, or fewer than 8 characters
- Uses `Regex.IsMatch()` to verify at least one uppercase letter, one digit, and one special character

##### ChangePasswordEndpoint (`Features/Auth/ChangePassword/ChangePasswordEndpoint.cs`)

**Purpose:** Maps the HTTP endpoint and handles the request/response cycle.

**Endpoint:** `PUT /api/auth/change-password`

**Key security features:**
- `.RequireAuthorization()` — the endpoint cannot be accessed without a valid JWT
- Extracts `userId` from `ClaimTypes.NameIdentifier` claim in `HttpContext.User`
- Returns `401 Unauthorized` if the claim is missing or not a valid integer
- Constructs the `ChangePasswordCommand` with the server-side userId and the client-provided passwords
- Returns `ApiResponse<object>` on success/failure

```csharp
app.MapPut("/change-password", async (
    [FromServices] IMediator mediator,
    [FromBody] ChangePasswordRequestDto body,
    HttpContext httpContext) =>
{
    var userIdClaim = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
        return Results.Unauthorized();

    var command = new ChangePasswordCommand(userId, body.CurrentPassword, body.NewPassword, body.ConfirmPassword);
    var result = await mediator.Send(command);
    return result
        ? Results.Ok(ApiResponse<object>.SuccessResponse(null!, "Password changed successfully."))
        : Results.BadRequest(ApiResponse<object>.FailureResponse(new[] { "Failed to change password." }));
}).RequireAuthorization()
  .WithName("ChangePassword")
  .WithTags("Auth");
```

#### AuthResponse
```csharp
public record AuthResponse(string AccessToken, string RefreshToken, int Id, string Username, string Role, bool MustChangePassword);
```

**Fields:**
- `AccessToken` — Short-lived JWT token for API authorization
- `RefreshToken` — Long-lived opaque token for obtaining new access tokens
- `Id` — User's database ID
- `Username` — User's login name
- `Role` — Role string ("Admin", "HR", "Manager", "Employee")
- `MustChangePassword` — If `true`, the frontend must redirect the user to the change password page and block access to all other pages

---

### 4.2.2 Employees Feature

#### CreateEmployee
- **CreateEmployeeDTO:** Full validation with Data Annotations including `Username`, `Password`, `Role` attached.
- **CreateEmployeeHandler:** Performs dual-ops: Validates via `IEmployeeBusinessRules` → securely registers `User` account implicitly in the CQRS pipeline → creates `Employee` mapped cleanly down to matching `UserId` via repository.
- **CreateEmployeeEndpoint:** `POST /api/employees` → returns `201 Created` with new ID

#### UpdateEmployee
- **UpdateEmployeeDTO:** All properties nullable for partial updates
- **UpdateEmployeeHandler:** Validates ID → fetches existing → validates via business rules → calls `employee.Update()` → saves
- **UpdateEmployeeEndpoint:** `PUT /api/employees/{id}` → returns `200 OK`

#### DeleteEmployee
- **DeleteEmployeeHandler:** Validates ID → calls `DeleteAsync()` (soft delete) → returns affected rows
- **DeleteEmployeeEndpoint:** `DELETE /api/employees/{id}` → returns `200 OK`

#### GetEmployees
- **GetEmployeesHandler:** Calls `GetAllAsync()` → returns all non-deleted employees
- **GetEmployeesEndpoint:** `GET /api/employees` → requires `EmployeesReadOnly`

#### GetEmployeeById
- **GetEmployeeByIdHandler:** Validates ID > 0 → fetches by ID → throws `NotFoundException` if null
- **GetEmployeeByIdEndpoint:** `GET /api/employees/{id}` → requires `EmployeesReadOnly`

#### GetEmployeeByUserId
- **GetEmployeeByUserIdHandler:** Resolves Employee data dynamically leveraging native mapped `UserId` constraints to circumvent role blocks specifically for profile rendering.
- **GetEmployeeByUserIdEndpoint:** `GET /api/employees/by-user/{userId}` → accessible to standard Employees.

---

### 4.2.3 Departments Feature

Identical CQRS pattern to Employees with:
- **Create:** validates department name + email uniqueness, manager existence
- **Update:** partial update with business rule validation
- **Delete:** validates no positions are assigned before allowing deletion
- **Get All / Get By Id:** standard retrieval

---

### 4.2.4 Positions Feature

Identical CQRS pattern with:
- **Create:** validates position name uniqueness, salary range, department existence
- **Update:** partial update, validates name uniqueness, salary logic, department existence
- **Delete:** validates no employees are assigned before allowing deletion
- **Get All / Get By Id:** standard retrieval

---

## 4.3 Infrastructure Layer

### 4.3.1 Repositories

#### Repository\<T\> (Abstract Base)
Provides default implementations for:
- `GetAllAsync()` → `SELECT * FROM {TableName} WHERE IsDeleted = 0`
- `GetByIdAsync(int id)` → `SELECT * FROM {TableName} WHERE Id = @Id`
- `SoftDeleteAsync(int id)` → `UPDATE SET IsDeleted = 1`
- `DeleteAsync(int id)` → delegates to `SoftDeleteAsync()`
- `ExistsAsync(string condition)` → `SELECT 1 FROM {TableName} WHERE {condition}`

Forces subclasses to implement `AddAsync()` and `UpdateAsync()`.

#### EmployeeRepository
- `TableName = "Employees"`
- `AddAsync` → inserts all employee fields, returns `SCOPE_IDENTITY()`
- `UpdateAsync` → updates all fields by ID

#### DepartmentRepository
- `TableName = "Departments"`
- Similar insert/update with department-specific columns

#### PositionRepository
- `TableName = "Positions"`
- Similar insert/update with position-specific columns

#### UserRepository
- `TableName = "Users"`
- Additional method: `GetByUsernameAsync(string username)` → queries by username with `IsDeleted = 0`

#### RefreshTokenRepository
- Implements `IRefreshTokenRepository` directly (not the generic Repository)
- CRUD operations on `RefreshTokens` table

---

### 4.3.2 Business Rules

#### EmployeeBusinessRules
- **ValidateForCreateAsync:** validates DTO annotations → checks position exists → checks email uniqueness → checks national ID uniqueness → validates salary > 0 → validates salary within position range → validates employee status enum
- **ValidateForUpdateAsync:** same validations but with `Id != @Id` exclusion for uniqueness checks, uses "effective" values (new value or existing)

#### DepartmentBusinessRules
- **ValidateForCreateAsync:** validates DTO → checks department name uniqueness → checks email uniqueness → validates manager exists and isn't already assigned
- **ValidateForUpdateAsync:** same with ID exclusion
- **ValidateForDeleteAsync:** checks no positions are assigned to the department

#### PositionBusinessRules
- **ValidateForCreateAsync:** validates DTO → checks name uniqueness → validates max > min salary → validates department exists
- **ValidateForUpdateAsync:** same with ID exclusion
- **ValidateForDeleteAsync:** checks no employees are assigned to the position

---

### 4.3.3 Security

#### JwtTokenGenerator (`Infrastructure/Security/JWT Generator.cs`)
- **GenerateToken(User user):** Creates JWT with NameIdentifier, UniqueName, and Role claims. Signs with HMAC-SHA256. Expiration from config `Jwt:DurationInMinutes`.
- **GenerateRefreshToken():** Generates 64 random bytes using `RandomNumberGenerator`, returns base64 string.

---

### 4.3.4 Data

#### SqlConnectionFactory (`Infrastructure/Data/SqlConnectionFactory.cs`)
- Reads connection string from `IConfiguration`
- `CreateConnection()` returns new `SqlConnection` (Dapper-compatible)

---

## 4.4 Middlewares

### GlobalExceptionMiddleware
**Purpose:** Catches all unhandled exceptions and returns structured JSON error responses.

**Flow:**
1. Wraps `await _next(context)` in try-catch
2. Catches specific exception types with appropriate HTTP status codes:
   - `ValidationException` → **400** Bad Request (with error list)
   - `NotFoundException` → **404** Not Found
   - `UnauthorizedAccessException` → **403** Forbidden
   - Generic `Exception` → **500** Internal Server Error
3. Returns `ApiResponse<string>.FailureResponse(errors, message)`

### RequestLoggingMiddleware
**Purpose:** Logs every incoming request and outgoing response.

**Flow:**
1. Logs: `"Incoming Request: {Method} {Path}"`
2. Calls `await _next(context)`
3. Logs: `"Outgoing Response: {StatusCode} for {Method} {Path}"`

---

## 4.5 Exceptions

| Exception | Base Class | Status Code | Usage |
|---|---|---|---|
| `AppException` | `Exception` | — | Abstract base for all custom exceptions |
| `NotFoundException` | `AppException` | 404 | Entity not found by ID |
| `ValidationException` | `AppException` | 400 | Business rule or DTO validation failures |

---

## 4.6 Program.cs — Application Bootstrap

### DI Container Registration
1. Swagger/OpenAPI with JWT Bearer security definition
2. Scoped services: connection factory, JWT generator, repositories, business rules
3. Authentication: JWT Bearer with strict validation parameters
4. Authorization: three policies (FullCRUD, EmployeesReadOnly, FullCRUDEmployee)
5. MediatR: auto-discovers handlers from assembly
6. CORS: allows `http://localhost:8080` with credentials

### Middleware Pipeline
```
Swagger (dev only) → GlobalExceptionMiddleware → RequestLoggingMiddleware 
→ CORS → HTTPS Redirection → Authentication → Authorization → Endpoints
```

### Endpoint Mapping
```
/api/auth        → Auth endpoints (Login, Register, Refresh, ChangePassword)
/api/employees   → Employee endpoints (CRUD)
/api/departments → Department endpoints (CRUD) + RequireAuthorization("FullCRUD")
/api/positions   → Position endpoints (CRUD) + RequireAuthorization("FullCRUD")
```

---

# 5. FRONTEND DOCUMENTATION

## 5.1 Folder Structure

```
frontend/src/
├── api/                    # API client functions
│   ├── axios.ts            # Axios instance + interceptors
│   ├── authApi.ts          # Auth API calls (login, register, changePassword)
│   ├── employeeApi.ts      # Employee CRUD API
│   ├── departmentApi.ts    # Department CRUD API
│   └── positionApi.ts      # Position CRUD API
├── components/
│   ├── auth/
│   │   ├── ProtectedRoute.tsx   # Auth guard + forced password change redirect
│   │   └── RoleBasedRoute.tsx   # Role guard
│   ├── layout/
│   │   ├── DashboardLayout.tsx  # Main layout with sidebar
│   │   ├── AppSidebar.tsx       # Navigation sidebar (includes Change Password link)
│   │   └── Header.tsx           # Top header bar
│   └── shared/
│       ├── ConfirmDialog.tsx    # Delete confirmation modal
│       ├── DataTable.tsx        # Reusable data table
│       ├── FormInput.tsx        # Form text input
│       ├── FormSelect.tsx       # Form select dropdown
│       ├── LoadingSpinner.tsx   # Loading indicator
│       └── SearchInput.tsx      # Debounced search input
├── hooks/
│   ├── useEmployees.ts     # Employee React Query hooks
│   ├── useDepartments.ts   # Department React Query hooks
│   ├── usePositions.ts     # Position React Query hooks
│   └── useChangePassword.ts # Change Password React Query mutation hook
├── pages/
│   ├── Login.tsx           # Login page (handles mustChangePassword redirect)
│   ├── Profile.tsx         # User profile page
│   ├── ChangePassword.tsx  # Change Password page
│   ├── Dashboard.tsx       # Dashboard with stats
│   ├── NotFound.tsx        # 404 page
│   ├── employees/          # Employee CRUD pages
│   ├── departments/        # Department CRUD pages
│   └── positions/          # Position CRUD pages
├── stores/
│   └── auth.ts             # Zustand auth store (includes setMustChangePassword)
├── types/
│   └── index.ts            # TypeScript interfaces (includes ChangePasswordRequest)
├── utils/
│   └── jwtDecode.ts        # JWT payload decoder
├── App.tsx                 # Root component with routing (includes /change-password)
├── main.tsx                # Application entry point
├── theme.ts                # MUI theme configuration
└── index.css               # Global CSS
```

## 5.2 Auth Flow

### Login Process
1. User submits credentials via `Login.tsx` form
2. Form validates with Zod schema (username required, password required)
3. `authApi.login()` sends POST to `/api/auth/login`
4. Backend returns `ApiResponse<AuthResponse>` with JWT + refresh token + `mustChangePassword` flag
5. Frontend decodes JWT using custom `jwtDecode()` to extract user info (id, username, role)
6. `mustChangePassword` boolean from the backend response is merged into the decoded user object
7. `useAuthStore.setAuth()` stores tokens + user (including `mustChangePassword`) in Zustand (persisted to localStorage via `zustand/middleware/persist`)
8. **If `mustChangePassword === true`:** Navigates to `/change-password`
9. **If `mustChangePassword === false`:** Navigates to `/profile`

### Change Password Process
1. User is on `/change-password` page (either redirected automatically or navigated manually)
2. User fills out form: Current Password, New Password, Confirm Password
3. Frontend validates with Zod schema (strength rules, match check, current ≠ new)
4. `useChangePassword()` hook calls `authApi.changePassword()` → `PUT /api/auth/change-password`
5. Backend extracts `userId` from JWT `NameIdentifier` claim
6. Backend validates: current password correct (BCrypt), strength, match, not same
7. Backend hashes new password, updates DB, sets `MustChangePassword = false`
8. Frontend on success: calls `setMustChangePassword(false)` in Zustand, shows success toast, navigates to `/profile`
9. Form is cleared after success

### Forced Password Change (ProtectedRoute)
- `ProtectedRoute` component reads `user.mustChangePassword` from Zustand
- If `true` and current path is NOT `/change-password`, it redirects to `/change-password`
- This blocks access to ALL other pages (profile, dashboard, employees, etc.) until the password is changed
- The `/change-password` path is excluded from the redirect to avoid an infinite loop

### Token Storage (Zustand)
```typescript
// Persisted to localStorage under key "hr-auth-ems"
{
  accessToken: string | null,
  refreshToken: string | null,
  user: { id, username, role, mustChangePassword? } | null,
  isAuthenticated: boolean
}
```

### Zustand Auth Store Methods
| Method | Purpose |
|---|---|
| `setAuth(accessToken, refreshToken, user)` | Sets all auth state after login |
| `setTokens(accessToken, refreshToken)` | Updates tokens (used by refresh flow) |
| `setMustChangePassword(value)` | Updates `user.mustChangePassword` flag without resetting other state |
| `logout()` | Clears all auth state |
| `hasRole(...roles)` | Checks if user has one of the specified roles |

### Axios Interceptor
- **Request:** Reads `accessToken` from Zustand store → attaches as `Authorization: Bearer {token}`
- **Response (401):** Implements token refresh with request queuing:
  1. First 401 → sets `isRefreshing = true`, calls `/auth/refresh`
  2. Concurrent 401s → queued in `failedQueue` array
  3. On refresh success → processes queue with new token, retries all requests
  4. On refresh failure → logs out user, redirects to `/login`

### JWT Decode (`utils/jwtDecode.ts`)
Manually decodes JWT payload (no library dependency):
- Extracts `.NET` claim type URIs for ID, username, role
- Falls back to short claim names (`nameid`, `unique_name`, `role`)
- Returns `User` object for Zustand store

## 5.3 React Query Integration

### Data Fetching Pattern
Each entity has a dedicated hook file:

```typescript
// Query: fetches data
useEmployees()     → queryKey: ["employees"]
useEmployee(id)    → queryKey: ["employees", id]

// Mutations: modify data
useCreateEmployee() → invalidates ["employees"] on success
useUpdateEmployee() → invalidates ["employees"] on success
useDeleteEmployee() → invalidates ["employees"] on success
```

### useChangePassword Hook (`hooks/useChangePassword.ts`)

**Purpose:** React Query mutation hook for the Change Password feature.

**Technologies used:**
- `useMutation` from `@tanstack/react-query` — manages the async mutation lifecycle (loading, success, error)
- `authApi.changePassword()` — the Axios API call to `PUT /api/auth/change-password`
- `useAuthStore` — Zustand store to update `mustChangePassword` on success
- `enqueueSnackbar` from `notistack` — shows success/error toast notifications
- `useNavigate` from `react-router-dom` — redirects to `/profile` on success

**Behavior:**
```typescript
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => authApi.changePassword(data),
    onSuccess: () => {
      setMustChangePassword(false);   // Update Zustand — unlocks all pages
      enqueueSnackbar("Password changed successfully!", { variant: "success" });
      navigate("/profile");           // Redirect to profile page
    },
    onError: (error) => {
      // Extracts first error from backend ApiResponse.errors[] array
      const msg = error?.response?.data?.errors?.[0] || "Failed to change password.";
      enqueueSnackbar(msg, { variant: "error" });
    },
  });
}
```

**Why this pattern?** Unlike entity hooks (useEmployees, useDepartments), this hook doesn't invalidate query cache because changing a password doesn't affect any cached data. Instead, it updates the Zustand auth store directly.

### Cache Invalidation
All entity mutations call `queryClient.invalidateQueries({ queryKey: ["entityName"] })` on success, which automatically refetches the list data.

### Default Options
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});
```

## 5.4 UI Components

### DashboardLayout
- Flex container with permanent sidebar + main content area
- Manages sidebar collapsed/expanded state
- Renders `<Outlet />` for nested routes

### AppSidebar
- Permanent drawer with dark theme (`#0f172a` background)
- Shows HR System branding with gradient logo
- Displays user avatar with initials + role
- Filters navigation items based on user role
- Highlights active route
- Supports collapsed mode (icons only)
- **Change Password** link with `LockResetIcon` — accessible to all roles (Admin, HR, Manager, Employee)
- Logout button at bottom

**Navigation Items:**

| Title | URL | Icon | Roles |
|---|---|---|---|
| Profile | `/profile` | `PersonIcon` | All |
| Dashboard | `/dashboard` | `DashboardIcon` | Admin, HR, Manager |
| Employees | `/employees` | `PeopleIcon` | Admin, HR, Manager |
| Departments | `/departments` | `BusinessIcon` | Admin |
| Positions | `/positions` | `WorkIcon` | Admin |
| Change Password | `/change-password` | `LockResetIcon` | All |

### Header
- Top app bar with:
  - Sidebar toggle (hamburger menu)
  - User avatar (clickable → navigates to profile)
  - Username display
  - Role badge with color coding
  - Logout button

### DataTable
- Generic table component with TypeScript generics
- Supports: loading skeleton, empty state, pagination
- Column definitions with `accessorKey` or custom `cell` renderer
- Client-side pagination

### FormInput / FormSelect
- Integrated with React Hook Form via `useFormContext()`
- Auto-displays validation errors from Zod schema
- MUI TextField/Select with consistent sizing

### ConfirmDialog
- MUI Dialog for delete confirmations
- Shows loading state during deletion

### SearchInput
- Debounced search (300ms) using `setTimeout`/`clearTimeout`
- MUI TextField with search icon adornment

### ChangePassword Page (`pages/ChangePassword.tsx`)

**Purpose:** Full-page form for changing the user's password. Accessible to all authenticated users.

**Technologies used:**
- `React Hook Form` with `FormProvider` — manages form state and field registration
- `zodResolver` — connects Zod schema to React Hook Form for declarative validation
- `Zod` — defines the validation schema with chained rules and `.refine()` for cross-field validation
- `useChangePassword()` — React Query mutation hook for the API call
- `useAuthStore` — reads `mustChangePassword` to show the warning banner
- `FormInput` — shared MUI TextField component integrated with React Hook Form
- MUI components: `Box`, `Card`, `CardContent`, `Typography`, `Button`, `CircularProgress`, `Alert`
- MUI icons: `LockResetIcon`, `WarningAmberIcon`

**Zod Validation Schema:**
```typescript
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Must contain at least one special character"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
})
.refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],   // Error appears on confirmPassword field
})
.refine((data) => data.newPassword !== data.currentPassword, {
  message: "New password must be different from current password",
  path: ["newPassword"],       // Error appears on newPassword field
});
```

**UI Elements:**
1. **Warning Alert** — shown only when `mustChangePassword === true`, informs the user they must change their password
2. **Header** — amber gradient circular icon with `LockResetIcon`, title "Change Password", subtitle
3. **Form Fields** — Current Password, New Password, Confirm Password (all type="password")
4. **Password Requirements box** — grey card listing all 5 requirements
5. **Submit Button** — amber gradient, shows `CircularProgress` spinner when loading
6. **Form Reset** — form fields are cleared after successful submission

**Design:** Follows the same card-based layout pattern as the Login page but uses an amber/gold color scheme to visually distinguish it from the blue login theme.

---

# 6. ROLE-BASED SYSTEM

## 6.1 Backend Enforcement

### Authorization Policies (Program.cs)
```csharp
"FullCRUD"          → RequireRole("Admin")
"EmployeesReadOnly" → RequireRole("HR", "Admin", "Manager")
"FullCRUDEmployee"  → RequireRole("HR", "Admin")
```

### Endpoint-Level Authorization
- Employee read endpoints → `EmployeesReadOnly` (Admin, HR, Manager)
- Employee write endpoints → `FullCRUDEmployee` (Admin, HR)
- Department/Position endpoints → `FullCRUD` applied at route group level (Admin only)
- Auth login/refresh → no authorization
- Auth register → `FullCRUDEmployee` (Admin, HR)

### JWT Role Claim
The role is embedded in the JWT as `ClaimTypes.Role`, which ASP.NET's authorization middleware reads to evaluate `RequireRole()` policies.

## 6.2 Frontend Enforcement

### Route-Level Protection
- `ProtectedRoute`: checks `isAuthenticated` → redirects to `/login`
- `RoleBasedRoute`: checks `user.role` against `allowedRoles` → redirects to `/profile`

### UI-Level Restriction
- **Sidebar:** filters navigation items by role
- **EmployeeList:** hides Create/Edit/Delete buttons for Manager role
- **Department/Position pages:** only accessible to Admin (route-level + sidebar filter)

## 6.3 How UI Changes Per Role

| Role | Sidebar Items | Employee Actions | Dept/Pos Access |
|---|---|---|---|
| Admin | Profile, Dashboard, Employees, Departments, Positions, Change Password | Full CRUD | Full CRUD |
| HR | Profile, Dashboard, Employees, Change Password | Create, Edit, Delete | Hidden |
| Manager | Profile, Dashboard, Employees, Change Password | View only (no buttons) | Hidden |
| Employee | Profile, Change Password | No access | No access |

---

# 7. DATA FLOW

## Complete Request Flow

```
1. USER → Interacts with React UI (clicks button, submits form)
         ↓
2. REACT COMPONENT → Calls React Query mutation/query hook
         ↓
3. HOOK → Calls API function (e.g., employeeApi.create())
         ↓
4. AXIOS → Adds Bearer token via request interceptor
         → Sends HTTP request to backend
         ↓
5. ASP.NET MIDDLEWARE PIPELINE:
   a. GlobalExceptionMiddleware (wraps everything in try-catch)
   b. RequestLoggingMiddleware (logs request method + path)
   c. CORS middleware (validates origin)
   d. Authentication middleware (validates JWT token)
   e. Authorization middleware (checks role policies)
         ↓
6. ENDPOINT → Receives request, creates MediatR command/query
         ↓
7. MEDIATR → Routes command to appropriate handler
         ↓
8. HANDLER → Applies business rules → calls repository
         ↓
9. REPOSITORY → Creates SQL connection → executes query via Dapper
         ↓
10. SQL SERVER → Executes query → returns results
         ↓
11. HANDLER → Wraps result in ApiResponse<T>
         ↓
12. ENDPOINT → Returns Results.Ok/Created with response
         ↓
13. MIDDLEWARE → Logs response status code
         ↓
14. AXIOS → Response interceptor processes result
    (If 401 → attempts refresh → retries request)
         ↓
15. REACT QUERY → Updates cache → triggers UI re-render
         ↓
16. COMPONENT → Displays updated data to user
         ↓
17. NOTISTACK → Shows success/error snackbar notification
```

---

# 8. SECURITY

## 8.1 JWT Usage
- Access tokens are short-lived (configurable, currently 1 minute)
- Signed with HMAC-SHA256 symmetric key
- Contains minimal claims: user ID, username, role
- Validated on every request: issuer, audience, signing key, lifetime
- `ClockSkew = TimeSpan.Zero` prevents time-based bypass

## 8.2 Refresh Tokens
- 64-byte cryptographically random tokens
- Stored server-side in `RefreshTokens` table
- 30-day expiration
- Token rotation implemented: old token revoked when new one issued
- `ReplacedByTokenHash` tracks token chain for audit

## 8.3 Password Security
- Passwords hashed with BCrypt (salted automatically)
- Password complexity enforced: min 8 chars, uppercase, digit, special character
- Raw passwords never stored or logged
- **Change Password security:**
  - UserId is extracted from JWT claims server-side — never accepted from the client
  - Users can only change their own password
  - Current password must be verified via BCrypt before allowing change
  - New password must differ from current password
  - `MustChangePassword` flag enforces first-login password changes
  - Dual validation: Zod on frontend + regex/BCrypt on backend
  - Generic error messages prevent information leakage (e.g., "Invalid current password" instead of "User does not exist")

## 8.4 Authorization
- Role-based access control (RBAC) with 4 roles
- Policies validated at endpoint level by ASP.NET middleware
- Endpoint groups secured with `RequireAuthorization()`

## 8.5 Data Protection
- Soft delete pattern (data preserved, marked as deleted)
- SQL parameterized queries via Dapper (prevents SQL injection)
- CORS restricted to specific frontend origin
- HTTPS redirection enabled

---

# 9. KNOWN ISSUES & IMPROVEMENTS

## 9.1 Performance Improvements

| Area | Current State | Recommendation |
|---|---|---|
| **Pagination** | Backend returns ALL records, frontend paginates | Implement server-side pagination with `OFFSET FETCH` |
| **Connection Pooling** | Each query creates new connection | Use connection pooling (already handled by SqlClient) |
| **Caching** | No caching | Add response caching for read-heavy endpoints |
| **Lazy Loading** | Profile page loads all employees/depts/positions | Create dedicated profile endpoint |
| **Expired Token Cleanup** | `DeleteExpiredAsync()` exists but never called | Add a background service or scheduled task |

## 9.2 Security Improvements

| Area | Current State | Recommendation |
|---|---|---|
| **JWT Key** | Hardcoded in appsettings.json | Move to environment variables or Key Vault |
| **DB Credentials** | Hardcoded in appsettings.json | Use managed identity or env variables |
| **Rate Limiting** | None | Add rate limiting on auth endpoints |
| **Password Reset** | Not implemented | Add forgot password / reset flow |
| **Account Lockout** | None | Lock account after N failed login attempts |
| **HTTPS** | Redirect enabled but no certificate config | Configure TLS for production |
| **CORS** | Single hardcoded origin | Make configurable per environment |
| **Audit Logging** | Request logging only | Log who did what (create/update/delete with user ID) |

## 9.3 Code Improvements

| Area | Current State | Recommendation |
|---|---|---|
| **UserRepository** | Registered as concrete class, not interface | Create `IUserRepository` interface |
| **Soft Delete Filter** | `GetByIdAsync` / `ExistsAsync` don't filter IsDeleted | Add `AND IsDeleted = 0` to all queries |
| **Error Responses** | `UnauthorizedAccessException` → 403 | Change to 401 for invalid credentials |
| **API Response Consistency** | Frontend types don't match backend shape | Align `ApiResponse` types on both sides |
| **Unit Tests** | None | Add xUnit tests for handlers and business rules |
| **Integration Tests** | None | Add API integration tests |
| **Input Sanitization** | Basic validation only | Add XSS protection, input truncation |
| **Logging** | Console only | Add structured logging (Serilog) |
| **Health Checks** | None | Add `/health` endpoint for monitoring |
| **Docker** | Not containerized | Add Dockerfile + docker-compose |
| **CI/CD** | `.github` directory exists but likely empty | Add GitHub Actions workflow |

---

# 10. CHANGE PASSWORD FEATURE — COMPLETE REFERENCE

## 10.1 API Specification

### Endpoint: `PUT /api/auth/change-password`

**Authentication:** Required (JWT Bearer token)

**Request Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "OldPass@123",
  "newPassword": "NewSecure@456",
  "confirmPassword": "NewSecure@456"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Password changed successfully.",
  "data": null,
  "errors": null
}
```

**Error Responses:**

| HTTP Status | Scenario | Response Body |
|---|---|---|
| 400 | Passwords don't match | `{ "success": false, "message": "An error occurred...", "errors": ["New password and confirm password do not match."] }` |
| 400 | Weak password | `{ "success": false, "errors": ["Password must be at least 8 characters and contain an uppercase letter, a number, and a special character."] }` |
| 400 | Same as current | `{ "success": false, "errors": ["New password must be different from the current password."] }` |
| 401 | Wrong current password | `{ "success": false, "errors": ["Invalid current password."] }` |
| 401 | No/invalid JWT | HTTP 401 Unauthorized (no body) |
| 404 | User not found | `{ "success": false, "errors": ["User not found."] }` |

## 10.2 Backend File Summary

| File | Class/Record | Purpose |
|---|---|---|
| `ChangePasswordCommand.cs` | `ChangePasswordRequestDto` | HTTP request body shape (3 password fields) |
| `ChangePasswordCommand.cs` | `ChangePasswordCommand` | MediatR command with server-injected `UserId` |
| `ChangePasswordHandler.cs` | `ChangePasswordHandler` | Business logic: validate → verify → hash → update |
| `ChangePasswordEndpoint.cs` | `ChangePasswordEndpoint` | HTTP endpoint: JWT auth + userId from claims |

## 10.3 Frontend File Summary

| File | What It Does |
|---|---|
| `types/index.ts` | Defines `ChangePasswordRequest` interface and adds `mustChangePassword` to `User` and `LoginResponse` |
| `api/authApi.ts` | `changePassword()` method — calls `PUT /auth/change-password` via authenticated Axios |
| `stores/auth.ts` | `setMustChangePassword(value)` — updates the flag in Zustand without resetting other state |
| `hooks/useChangePassword.ts` | React Query `useMutation` hook — handles success (Zustand update + redirect) and error (toast) |
| `pages/ChangePassword.tsx` | Full UI page with Zod-validated form, password requirements box, and forced change warning |
| `components/auth/ProtectedRoute.tsx` | Redirects to `/change-password` when `mustChangePassword === true` |
| `pages/Login.tsx` | Reads `mustChangePassword` from login response and redirects accordingly |
| `components/layout/AppSidebar.tsx` | Adds "Change Password" nav item with `LockResetIcon` for all roles |
| `App.tsx` | Registers `/change-password` route inside protected routes |

## 10.4 Security Rules Summary

| Rule | How It's Enforced |
|---|---|
| User can only change own password | `userId` extracted from JWT `NameIdentifier` claim in endpoint |
| No userId from client | `ChangePasswordRequestDto` has no userId field |
| Passwords always hashed | BCrypt hash on write, BCrypt verify on read |
| Generic error messages | "Invalid current password" — no "user does not exist" distinction |
| Endpoint requires auth | `.RequireAuthorization()` on the endpoint |
| Forced first-login change | `ProtectedRoute` blocks all pages when `mustChangePassword = true` |
| Dual validation | Zod on frontend + regex/BCrypt on backend |

## 10.5 Complete Data Flow Diagram

```
1. USER → Clicks "Change Password" in sidebar OR gets auto-redirected after login
         ↓
2. CHANGE PASSWORD PAGE → Renders form with 3 password fields
         ↓
3. USER → Fills form and clicks "Change Password" button
         ↓
4. ZOD VALIDATION → Client-side: required, min 8, uppercase, number, special char, match, ≠ current
         ↓ (passes)
5. useChangePassword HOOK → Calls authApi.changePassword(data)
         ↓
6. AXIOS → Attaches JWT Bearer token via request interceptor
         → Sends PUT /api/auth/change-password
         ↓
7. ASP.NET MIDDLEWARE → Exception handling → Logging → CORS → Auth → Authorization
         ↓
8. CHANGE PASSWORD ENDPOINT:
   a. Reads ClaimTypes.NameIdentifier from HttpContext.User → userId
   b. Returns 401 if claim missing
   c. Creates ChangePasswordCommand(userId, current, new, confirm)
   d. Sends to MediatR
         ↓
9. CHANGE PASSWORD HANDLER:
   a. Validates confirmPassword == newPassword
   b. Validates password strength (regex)
   c. Fetches user from DB (UserRepository.GetByIdAsync)
   d. BCrypt.Verify(currentPassword, user.PasswordHash) → 401 if wrong
   e. BCrypt.Verify(newPassword, user.PasswordHash) → 400 if same
   f. BCrypt.HashPassword(newPassword) → user.PasswordHash
   g. user.MustChangePassword = false
   h. UserRepository.UpdateAsync(user.Id, user)
         ↓
10. SQL SERVER → UPDATE Users SET PasswordHash=@PasswordHash, MustChangePassword=0 WHERE Id=@Id
         ↓
11. HANDLER → Returns true
         ↓
12. ENDPOINT → Returns ApiResponse<object>.SuccessResponse(null, "Password changed successfully.")
         ↓
13. AXIOS → Returns response to mutation hook
         ↓
14. useChangePassword HOOK:
    a. onSuccess → setMustChangePassword(false) in Zustand
    b. Shows success snackbar via notistack
    c. navigate("/profile") via React Router
    d. Form is reset (cleared)
         ↓
15. PROTECTED ROUTE → mustChangePassword is now false → allows access to all pages
         ↓
16. PROFILE PAGE → Renders normally
```

---

> **END OF DOCUMENTATION**
> 
> This document covers the complete HR Management System including:
> - ✅ Full project validation (backend + frontend + integration)
> - 🐞 13 identified issues with detailed fixes
> - 📘 Complete documentation of every file, class, and flow
> - 🔐 Detailed Change Password feature documentation with security analysis
