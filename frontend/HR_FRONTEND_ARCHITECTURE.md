# HR Management System - Frontend Architecture & System Documentation

## 1. Project Overview

## The **HR Management System (HRMS)** is a production-grade, enterprise-level frontend application designed to streamline human resource operations. It serves as the primary interface for managing employees, organizational structures (departments), and job roles (positions).

## The system provides a secure, role-based environment where administrative tasks such as employee registration, data modification, and organizational oversight are centralized. Built with a focus on efficiency and security, it leverages modern frontend patterns to ensure a high-performance user experience while maintaining strict adherence to business rules and security protocols.

## 2. Technology Stack Explanation

To build a reliable and scalable HR system, the following technologies were selected:

- **React (v18+)**: The core library. Its component-based architecture and efficient reconciliation (Virtual DOM) allow for a highly responsive UI that can handle complex state updates gracefully.

- **Vite**: The build tool of choice. Vite provides an extremely fast development environment via ES modules and highly optimized production builds using Rollup, significantly reducing build times compared to legacy tools like Webpack.

- **TypeScript**: Provides static typing, which is critical for an enterprise application to prevent runtime errors, document data structures (like `Employee` and `User` types), and improve developer productivity through advanced IDE tooling.

- **React Router (v6+)**: Handles client-side navigation. It provides a declarative way to manage complex routing hierarchies, protected routes, and role-based access control. Implements React Router v7 future flags (`v7_startTransition`, `v7_relativeSplatPath`) for modern transition behavior.

- **Axios**: A promise-based HTTP client. It is used for backend communication due to its powerful interceptor support, allowing for centralized JWT handling and automatic token refreshing.

- **TanStack Query (React Query)**: The state management layer for asynchronous data. It handles caching, synchronization, and "stale-while-revalidate" logic, removing the need for manual loading/error states in global stores.

- **Zustand**: A lightweight, performant state management library for synchronous global state (Authentication, UI settings). It was chosen over Redux for its simplicity and minimal boilerplate.

- **Material UI (MUI v5/v7)**: The core design system and component library, replacing the original TailwindCSS and Shadcn structures. Ensures highly accessible, Google Material Design-compliant layouts out-of-the-box (`@mui/material`), utilizing Grid v2 sizing logic, centralized `<ThemeProvider>` theming mapping to predefined spacing and typography tokens.

- **Notistack**: Used for handling seamless snackbar and toast alert notifications recursively directly within the MUI ecosystem framework.

- **React Hook Form**: A library for managing form state. It minimizes re-renders and provides a robust solution for complex validation logic integrated directly into MUI `<TextField>` elements via Controlled wrappers.

- **Zod**: A TypeScript-first schema validation library. It is used in conjunction with React Hook Form to ensure strict data validation both at the UI level and before API submission.

---

## 3. Frontend Architecture

The project follows a **Modular Separation of Concerns (SoC)** architecture. While traditional systems often colocate everything by type, this architecture organizes code by technical responsibility, allowing for easy transitions toward a strictly **Feature-Based Architecture** as the system grows.

### Why this is Scalable:

1.  **Decoupled API Layer**: Business logic for data fetching is separated from the UI components.
2.  **Centralized State**: Global concerns like Authentication are isolated in dedicated Stores.
3.  **Primitive Reusability**: Common UI elements are abstracted into `components/shared`, strictly applying MUI `sx` overrides globally within the `src/theme.ts` provider.
4.  **Backend Agnostic Configuration**: Environment variables (`.env`) easily target interchangeable backend root API layers.

---

## 4. Complete Project Folder Structure

```text
src/
├── api/            # API client and individual service API definitions (.NET API integrations)
├── components/     # Reusable UI components
│   ├── auth/       # Authentication-specific route guards (RBAC)
│   ├── layout/     # Core application wrappers (MUI AppBars, Drawers)
│   └── shared/     # MUI Form controls and generalized DataTables components
├── hooks/          # TanStack Query custom hooks for data fetching & caching
├── pages/          # Full page components (Views using MUI Layouts)
├── stores/         # Zustand global state (Auth, UI)
├── types/          # Global TypeScript interfaces and API schemas
├── theme.ts        # Centralized explicit MUI Theme constants and styling
└── App.tsx         # Root component, Routing configuration & Providers
```

---

### Folder Purposes:

- **api/**: Contains the Axios instance and functions to interact directly with the .NET base URL endpoint specified in `.env`.
- **components/**: Houses UI building blocks. Divided into `shared` (molecular layouts) and `layout` (organismic contexts).
- **hooks/**: The "brain" of data fetching. Every API entity has a corresponding hook file.
- **pages/**: Represents the different routes. These components orchestrate the hooks and display the layout.
- **stores/**: Manages non-persisted and persisted state like the user session.
- **types/**: The single source of truth for data models shared across the application.

---

## 5. Detailed File-by-File Explanation

### API & Network Layer (`src/api/` & `.env`)

- **`.env`**: Sets up `VITE_API_BASE_URL` variables. Injects smoothly into your .NET Minimal API backend automatically bypassing local mocks.
- **`axios.ts`**: The core HTTP client. Configures `baseURL` implicitly from Vite ENV and implements **Request/Response Interceptors**. It handles JWT injection and 401 token refresh logic.
- **`authApi.ts`, `employeeApi.ts`, `departmentApi.ts`, `positionApi.ts`**: Dedicated CRUD services communicating directly via Axios paths for the respective backend models.

### State Management (`src/stores/`)

- **`auth.ts`**: The central vault for the user's session. It defines the `AuthState` interface and uses Zustand's `persist` middleware to ensure the login persists across browser restarts (`hr-auth-mui` local storage key).

### Authentication Guards (`src/components/auth/`)

- **`ProtectedRoute.tsx`**: A higher-order component that restricts access connecting natively to Zustand's token status tracking.
- **`RoleBasedRoute.tsx`**: A granular permission guard. It compares the current user's role against an array of `allowedRoles` to permit or deny access to specific routes.

### Custom Hooks (`src/hooks/`)

- **`useEmployees.ts`, `useDepartments.ts`, `usePositions.ts`**: Encapsulates TanStack Query logic for mutations/retrievals targeting server APIs.
- (All hooks directly integrate with `enqueueSnackbar` from `notistack` for dynamic visual CRUD updates.)

### Shared Components (`src/components/shared/`)

- **`DataTable.tsx`**: A generic abstraction component built heavily on MUI `<Table>`, supporting dynamic headers, accessorKeys, and `<Skeleton>` loading placeholders.
- **`FormInput.tsx` & `FormSelect.tsx`**: High-order bindings wrapping `react-hook-form` controllers seamlessly into native MUI `<TextField>` blocks with robust error-state handling.
- **`ConfirmDialog.tsx`**: Reusable modal instances driven by MUI `<Dialog>` ensuring transactional safety during `DELETE` triggers.
- **`SearchInput.tsx`**: A debounce-styled MUI TextField appended with explicit InputAdornments to trigger table filter states globally.

### Global Layout (`src/components/layout/`)

- **`DashboardLayout.tsx`**: The master template layout injecting MUI flex containers binding the sidebar and pages together.
- **`AppSidebar.tsx`**: Uses persistent MUI `<Drawer>` architecture generating role-allowed views strictly dynamically with `@mui/icons-material`.
- **`Header.tsx`**: MUI `<AppBar>` mapping the current location context and providing system profile access menus.

### Pages & Routing (`src/pages/`)

- **`Login.tsx`**: Resolves `POST /auth/login` strictly passing through API bindings.
- **`Dashboard.tsx`**: Pulls statistics synchronously via `useEmployees()` / `useDepartments()` lengths natively instead of hardcoded strings to ensure realtime reporting mapping straight onto MUI `<Card>` grids.
- **`NotFound.tsx`**: A fallback "404" page layout component.
- **`employees/`**, **`departments/`**, **`positions/`**: Complete modular CRUD views routing into isolated components using MUI `size={{ xs: 12 }}` configurations optimizing Grid v2 structural models.

---

## 6. Authentication Flow

1.  **Submission**: User enters credentials in the `Login` page hitting the backend API (`API_BASE_URL/auth/login`).
2.  **Request**: Data is validated by **Zod** schema logic locally before attempting the HTTP transaction.
3.  **Response**: Backend returns a `token`, `refreshToken`, and `User` schema payload.
4.  **Storage**: Zustand's `setAuth` updates the global state and persists it heavily encrypted inside the local vault.
5.  **Interception**: The `axios.ts` interceptor detects the new token context and appends `Authorization: Bearer <token>` to all subsequent requests silently.
6.  **Navigation**: The user is navigated straight into the protected `/dashboard` layout tree.

---

## 7. Role-Based Authorization (RBAC)

The system enforces permissions at the **UI level** via the `RoleBasedRoute` and dynamic navigation.

| Role         | Permissions                                   | Navigation Visibility              |
| :----------- | :-------------------------------------------- | :--------------------------------- |
| **HR**       | Full CRUD on all modules (Primary Admin role) | All links visible                  |
| **Manager**  | View Employees / Organizational structure     | Employees, Departments (Read Only) |
| **Employee** | View Personal Profile                         | Profile                            |

### Sidebar Implementation:

The `AppSidebar` component maps the `navItems` array matching the role matrix. Lists implicitly block users from ever opening paths they intrinsically do not possess the role clearance for.

---

## 8. Data Fetching Architecture

**TanStack Query** acts as the server-state cache manager over the REST endpoints natively avoiding Redux bloat.

- **Queries**: Handles initial dataset loaders. `staleTime` logic seamlessly merges background polling if required.
- **Mutations**: Handles mutating states. On `onSuccess()`, the engine runs `queryClient.invalidateQueries({ queryKey: [...] })` commanding the DOM to synchronously retrieve the freshly modified list immediately displaying the newest changes seamlessly.

---

## 9. System Preparation & Extensibility

This codebase has officially decoupled entirely from standalone styles and enforces heavy structural safety. By isolating all HTTP traffic exclusively via `import.meta.env.VITE_API_BASE_URL` inside `axios.ts`, the frontend assumes zero backend implementations other than pure JWT REST communication.

### Recent Backend-Frontend Integration Highlights:

- **Enum String Serialization**: The backend now uses `JsonStringEnumConverter`, ensuring Enums like `Roles` and `EmployeeStatus` are communicated via string names (e.g., "HR", "Active") rather than raw integers, simplifying frontend mapping and debugging.
- **Cascading Deletions**: Deleting an Employee record in the system now triggers a cascading delete of the associated User account in the backend to maintain referential integrity.
- **Automated HR Seeding**: The system includes a startup seeding mechanism that ensures an `admin_hr` user exists with the `HR` role for initial system access.

You are completely ready to spin up the .NET Minimal target endpoints, match the interface structures found inherently inside `/src/types/index.ts`, and observe direct full-stack CRUD interactions natively!
