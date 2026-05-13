import { createBrowserRouter } from "react-router";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { StudentDashboard } from "./pages/StudentDashboard";
import { ClassroomOverview } from "./pages/ClassroomOverview";
import { CalendarView } from "./pages/CalendarView";
import { ReservationFlow } from "./pages/ReservationFlow";
import { ReservationHistory } from "./pages/ReservationHistory";
import { Notifications } from "./pages/Notifications";
import { AdminDashboard } from "./pages/AdminDashboard";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import { AuthLayout } from "./layouts/AuthLayout";
import { MainLayout } from "./layouts/MainLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      { index: true, element: <Login /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
    ],
  },
  {
    path: "/app",
    element: <ProtectedRoute><MainLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <StudentDashboard /> },
      { path: "dashboard", element: <StudentDashboard /> },
      { path: "classrooms", element: <ClassroomOverview /> },
      { path: "calendar", element: <CalendarView /> },
      { path: "reserve", element: <ReservationFlow /> },
      { path: "reserve/:classroomId", element: <ReservationFlow /> },
      { path: "history", element: <ReservationHistory /> },
      { path: "notifications", element: <Notifications /> },
    ],
  },
  {
    path: "/admin",
    element: <AdminRoute><MainLayout isAdmin /></AdminRoute>,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "dashboard", element: <AdminDashboard /> },
    ],
  },
]);
