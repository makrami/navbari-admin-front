import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppLayout } from "../../layouts/AppLayout";
import { DashboardPage } from "../../pages/dashboard/DashboardPage";
import { NotFoundPage } from "../../pages/misc/NotFoundPage";
import { LoginPage } from "../../pages/auth/LoginPage";
import { SignUpPage } from "../../pages/auth/SignUpPage";
import { OverviewPage } from "../../pages/overview/OverviewPage";
import { ShipmentPage } from "../../pages/shipment/ShipmentPage";
import { SettingsPage } from "../../pages/settings/SettingsPage";
import { UsersPage } from "../../pages/users/UsersPage";
import { BillingPage } from "../../pages/billing/BillingPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <LoginPage /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "overview", element: <OverviewPage /> },
      { path: "shipments", element: <ShipmentPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "users", element: <UsersPage /> },
      { path: "billing", element: <BillingPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "sign-up", element: <SignUpPage /> },
    ],
    errorElement: <NotFoundPage />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
