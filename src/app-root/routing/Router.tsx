import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppLayout } from "../../layouts/AppLayout";
import { DashboardPage } from "../../pages/dashboard/DashboardPage";
import { NotFoundPage } from "../../pages/misc/NotFoundPage";
import { LoginPage } from "../../pages/auth/LoginPage";
import { SignUpPage } from "../../pages/auth/SignUpPage";
import { OverviewPage } from "../../pages/overview/OverviewPage";
import { ShipmentPage } from "../../pages/shipment/ShipmentPage";
import { LocalCompaniesPage } from "../../pages/LocalCompanies/LocalCompianiesPage";
import { DriversPage } from "../../pages/Drivers/DriversPage";
import { FinancePage } from "../../pages/finance/FinancePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <LoginPage /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "overview", element: <OverviewPage /> },
      { path: "shipments", element: <ShipmentPage /> },
      { path: "local-companies", element: <LocalCompaniesPage /> },
      { path: "drivers", element: <DriversPage /> },
      { path: "finance", element: <FinancePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "sign-up", element: <SignUpPage /> },
    ],
    errorElement: <NotFoundPage />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
