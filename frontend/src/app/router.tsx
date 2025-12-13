import { Navigate, Route, Routes } from "react-router-dom";
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

export const Router = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />

    <Route
      path="/admin"
      element={
        <AdminGuard>
          <AdminLayout />
        </AdminGuard>
      }
    >
      <Route index element={<DashboardPage />} />
      <Route path="locations" element={<LocationListPage />} />
      <Route path="locations/create" element={<LocationCreatePage />} />
      <Route path="lockers" element={<LockerListPage />} />
      <Route path="lockers/create" element={<LockerWizardPage />} />
      <Route path="lockers/:lockerId/compartments" element={<CompartmentListPage />} />
      <Route path="tools/expire" element={<ExpireJobPage />} />
    </Route>

    <Route
      path="/courier"
      element={
        <CourierGuard>
          <CourierLayout />
        </CourierGuard>
      }
    >
      <Route path="parcels/create" element={<CreateParcelPage />} />
      <Route path="parcels/reserve" element={<ReserveParcelPage />} />
      <Route path="parcels/deposit" element={<DepositParcelPage />} />
      <Route path="parcels/ready" element={<ReadyParcelPage />} />
    </Route>

    <Route
      path="/pickup"
      element={
        <RecipientGuard>
          <RecipientLayout />
        </RecipientGuard>
      }
    >
      <Route path="request-otp" element={<RequestOTPPage />} />
      <Route path="verify-otp" element={<VerifyOTPPage />} />
      <Route path="result" element={<PickupResultPage />} />
    </Route>
  </Routes>
);
