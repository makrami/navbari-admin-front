import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { AppLayout } from "../../layouts/AppLayout";
import { DashboardPage } from "../../pages/dashboard/DashboardPage";
import { NotFoundPage } from "../../pages/misc/NotFoundPage";
import { LoginPage } from "../../pages/auth/LoginPage";
import { OverviewPage } from "../../pages/overview/OverviewPage";
import { ShipmentPage } from "../../pages/shipment/ShipmentPage";
import { SegmentsPage } from "../../pages/segments/SegmentsPage";
import { LocalCompaniesPage } from "../../pages/LocalCompanies/LocalCompianiesPage";
import { DriversPage } from "../../pages/Drivers/DriversPage";
import { FinancePage } from "../../pages/finance/FinancePage";
import { ChatAlertPage } from "../../pages/chat-alert/ChatAlertPage";
import { SettingsPage } from "../../pages/settings/SettingsPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/login" replace />,
      },
      {
        path: "login",
        element: (
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        ),
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "overview",
        element: (
          <ProtectedRoute>
            <OverviewPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "shipments",
        element: (
          <ProtectedRoute>
            <ShipmentPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "segments",
        element: (
          <ProtectedRoute>
            <SegmentsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "local-companies",
        element: (
          <ProtectedRoute>
            <LocalCompaniesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "drivers",
        element: (
          <ProtectedRoute>
            <DriversPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "finance",
        element: (
          <ProtectedRoute>
            <FinancePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "chat-alert",
        element: (
          <ProtectedRoute>
            <ChatAlertPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        ),
      },
    ],
    errorElement: <NotFoundPage />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
