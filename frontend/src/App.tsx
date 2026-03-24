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
import DepartmentList from "@/pages/departments/DepartmentList";
import CreateDepartment from "@/pages/departments/CreateDepartment";
import EditDepartment from "@/pages/departments/EditDepartment";
import PositionList from "@/pages/positions/PositionList";
import CreatePosition from "@/pages/positions/CreatePosition";
import EditPosition from "@/pages/positions/EditPosition";
import NotFound from "@/pages/NotFound";
import ChangePassword from "@/pages/ChangePassword";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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

          {/* Dashboard – Admin, HR, Manager */}
          <Route
            path="/dashboard"
            element={
              <RoleBasedRoute allowedRoles={["Admin", "HR", "Manager"]}>
                <Dashboard />
              </RoleBasedRoute>
            }
          />

          {/* Employees – Admin, HR, Manager (Manager = read-only, enforced in UI) */}
          <Route
            path="/employees"
            element={
              <RoleBasedRoute allowedRoles={["Admin", "HR", "Manager"]}>
                <EmployeeList />
              </RoleBasedRoute>
            }
          />

          {/* Create Employee – Admin, HR only */}
          <Route
            path="/employees/create"
            element={
              <RoleBasedRoute allowedRoles={["Admin", "HR"]}>
                <CreateEmployee />
              </RoleBasedRoute>
            }
          />

          {/* Edit Employee – Admin, HR only */}
          <Route
            path="/employees/edit/:id"
            element={
              <RoleBasedRoute allowedRoles={["Admin", "HR"]}>
                <EditEmployee />
              </RoleBasedRoute>
            }
          />

          {/* Departments – Admin only */}
          <Route
            path="/departments"
            element={
              <RoleBasedRoute allowedRoles={["Admin"]}>
                <DepartmentList />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/departments/create"
            element={
              <RoleBasedRoute allowedRoles={["Admin"]}>
                <CreateDepartment />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/departments/edit/:id"
            element={
              <RoleBasedRoute allowedRoles={["Admin"]}>
                <EditDepartment />
              </RoleBasedRoute>
            }
          />

          {/* Positions – Admin only */}
          <Route
            path="/positions"
            element={
              <RoleBasedRoute allowedRoles={["Admin"]}>
                <PositionList />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/positions/create"
            element={
              <RoleBasedRoute allowedRoles={["Admin"]}>
                <CreatePosition />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/positions/edit/:id"
            element={
              <RoleBasedRoute allowedRoles={["Admin"]}>
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
