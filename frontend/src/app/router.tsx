import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import { AdminGuard } from "./guards/AdminGuard";
import { CourierGuard } from "./guards/CourierGuard";
import { RecipientGuard } from "./guards/RecipientGuard";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { DashboardPage } from "./pages/admin/DashboardPage";
import { LocationListPage } from "./pages/admin/locations/LocationListPage";
import { LocationCreatePage } from "./pages/admin/locations/LocationCreatePage";
import { LockerListPage } from "./pages/admin/lockers/LockerListPage";
import { LockerWizardPage } from "./pages/admin/lockers/LockerWizardPage";
import { CompartmentListPage } from "./pages/admin/compartments/CompartmentListPage";
import { ExpireJobPage } from "./pages/admin/tools/ExpireJobPage";
import { CreateParcelPage } from "./pages/courier/parcels/CreateParcelPage";
import { ReserveParcelPage } from "./pages/courier/parcels/ReserveParcelPage";
import { DepositParcelPage } from "./pages/courier/parcels/DepositParcelPage";
import { ReadyParcelPage } from "./pages/courier/parcels/ReadyParcelPage";
import { RequestOTPPage } from "./pages/recipient/pickup/RequestOTPPage";
import { VerifyOTPPage } from "./pages/recipient/pickup/VerifyOTPPage";
import { PickupResultPage } from "./pages/recipient/pickup/PickupResultPage";
import { AdminLayout } from "./components/layout/AdminLayout";
import { CourierLayout } from "./components/layout/CourierLayout";
import { RecipientLayout } from "./components/layout/RecipientLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <LoginPage /> },
      { path: "auth/login", element: <LoginPage /> },
      { path: "auth/register", element: <RegisterPage /> },
      {
        path: "admin",
        element: (
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        ),
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "dashboard", element: <DashboardPage /> },
          { path: "locations", element: <LocationListPage /> },
          { path: "locations/new", element: <LocationCreatePage /> },
          { path: "lockers", element: <LockerListPage /> },
          { path: "lockers/wizard", element: <LockerWizardPage /> },
          { path: "compartments", element: <CompartmentListPage /> },
          { path: "tools/expire-job", element: <ExpireJobPage /> }
        ]
      },
      {
        path: "courier",
        element: (
          <CourierGuard>
            <CourierLayout />
          </CourierGuard>
        ),
        children: [
          { index: true, element: <CreateParcelPage /> },
          { path: "parcels/create", element: <CreateParcelPage /> },
          { path: "parcels/reserve", element: <ReserveParcelPage /> },
          { path: "parcels/deposit", element: <DepositParcelPage /> },
          { path: "parcels/ready", element: <ReadyParcelPage /> }
        ]
      },
      {
        path: "recipient",
        element: (
          <RecipientGuard>
            <RecipientLayout />
          </RecipientGuard>
        ),
        children: [
          { index: true, element: <RequestOTPPage /> },
          { path: "pickup/request-otp", element: <RequestOTPPage /> },
          { path: "pickup/verify-otp", element: <VerifyOTPPage /> },
          { path: "pickup/result", element: <PickupResultPage /> }
        ]
      }
    ]
  }
]);
