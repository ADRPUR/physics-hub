import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { useAuthStore } from "../store/authStore";
import { CircularProgress, Box } from "@mui/material";
import type { RoleCode } from "../types/user";
const HomePage = lazy(() => import("../pages/HomePage"));
const SearchPage = lazy(() => import("../pages/SearchPage"));

const LoginPage = lazy(() => import("../pages/LoginPage"));
const RegisterPage = lazy(() => import("../pages/RegisterPage"));
const OverviewPage = lazy(() => import("../pages/OverviewPage"));
const ProfilePage = lazy(() => import("../pages/ProfilePage"));
const AdminUsersPage = lazy(() => import("../pages/AdminUsersPage"));
const AdminNavigationPage = lazy(() => import("../pages/AdminNavigationPage"));
const TeacherStudioPage = lazy(() => import("../pages/TeacherStudioPage"));

function Loader() {
  return (
    <Box minHeight="60vh" display="flex" alignItems="center" justifyContent="center">
      <CircularProgress />
    </Box>
  );
}

function ProtectedRoute() {
  const token = useAuthStore((state) => state.token);
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function RoleRoute({ allowed }: { allowed: RoleCode[] }) {
  const user = useAuthStore((state) => state.user);
  if (!user || !allowed.includes(user.role)) {
    return <Navigate to="/overview" replace />;
  }
  return <Outlet />;
}

function GuestRoute() {
  const token = useAuthStore((state) => state.token);
  if (token) return <Navigate to="/overview" replace />;
  return <Outlet />;
}

export default function Router() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />

          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/overview" element={<OverviewPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            <Route element={<RoleRoute allowed={["ADMIN"]} />}>
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/navigation" element={<AdminNavigationPage />} />
            </Route>

            <Route element={<RoleRoute allowed={["TEACHER", "ADMIN"]} />}>
              <Route path="/teacher/studio" element={<TeacherStudioPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
