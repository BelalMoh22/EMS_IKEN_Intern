import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleBasedRoute } from "@/components/auth/RoleBasedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Login from "@/pages/Login";
import Profile from "@/pages/Profile";
import Dashboard from "@/pages/Dashboard";
import EmployeeList from "@/pages/employees/EmployeeList";
import CreateEmployee from "@/pages/employees/CreateEmployee";
import EditEmployee from "@/pages/employees/EditEmployee";
import EmployeeDetails from "@/pages/employees/EmployeeDetails";
import DepartmentList from "@/pages/departments/DepartmentList";
import CreateDepartment from "@/pages/departments/CreateDepartment";
import EditDepartment from "@/pages/departments/EditDepartment";
import DepartmentDetails from "@/pages/departments/DepartmentDetails";
import PositionList from "@/pages/positions/PositionList";
import CreatePosition from "@/pages/positions/CreatePosition";
import EditPosition from "@/pages/positions/EditPosition";
import PositionDetails from "@/pages/positions/PositionDetails";
import NotFound from "@/pages/NotFound";
import ChangePassword from "@/pages/ChangePassword";

const queryClient = new QueryClient({
  defaultOptions: {
    // These are default behaviors for all queries , Instead of writing options in every useQuery, you define them once here
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
}); // Creates a global configuration object for React Query
// All useQuery() calls in your app will follow these rules

const App = () => (
  <QueryClientProvider client={queryClient}>
    {/* Without this: useQuery will NOT work*/}
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes (require authentication) */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Profile – accessible by ALL authenticated users */}
          <Route path="/profile" element={<Profile />} />

          {/* Change Password – accessible by ALL authenticated users */}
          <Route path="/change-password" element={<ChangePassword />} />
          {/* =================================================================== */}
          {/* Dashboard – HR, Manager */}
          <Route
            path="/dashboard"
            element={
              <RoleBasedRoute allowedRoles={["HR", "Manager"]}>
                <Dashboard />
              </RoleBasedRoute>
            }
          />

          {/* Employees – HR, Manager (Manager = read-only, enforced in UI) */}
          <Route
            path="/employees"
            element={
              <RoleBasedRoute allowedRoles={["HR", "Manager"]}>
                <EmployeeList />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/employees/:id"
            element={
              <RoleBasedRoute allowedRoles={["HR", "Manager"]}>
                <EmployeeDetails />
              </RoleBasedRoute>
            }
          />

          {/* Create Employee – HR only */}
          <Route
            path="/employees/create"
            element={
              <RoleBasedRoute allowedRoles={["HR"]}>
                <CreateEmployee />
              </RoleBasedRoute>
            }
          />

          {/* Edit Employee – HR only */}
          <Route
            path="/employees/edit/:id"
            element={
              <RoleBasedRoute allowedRoles={["HR"]}>
                <EditEmployee />
              </RoleBasedRoute>
            }
          />

          {/* Departments – HR only */}
          <Route
            path="/departments"
            element={
              <RoleBasedRoute allowedRoles={["HR"]}>
                <DepartmentList />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/departments/:id"
            element={
              <RoleBasedRoute allowedRoles={["HR"]}>
                <DepartmentDetails />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/departments/create"
            element={
              <RoleBasedRoute allowedRoles={["HR"]}>
                <CreateDepartment />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/departments/edit/:id"
            element={
              <RoleBasedRoute allowedRoles={["HR"]}>
                <EditDepartment />
              </RoleBasedRoute>
            }
          />

          {/* Positions – HR only */}
          <Route
            path="/positions"
            element={
              <RoleBasedRoute allowedRoles={["HR"]}>
                <PositionList />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/positions/:id"
            element={
              <RoleBasedRoute allowedRoles={["HR"]}>
                <PositionDetails />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/positions/create"
            element={
              <RoleBasedRoute allowedRoles={["HR"]}>
                <CreatePosition />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/positions/edit/:id"
            element={
              <RoleBasedRoute allowedRoles={["HR"]}>
                <EditPosition />
              </RoleBasedRoute>
            }
          />
        </Route>

        {/* Default: redirect to /profile */}
        <Route path="/" element={<Navigate to="/profile" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
