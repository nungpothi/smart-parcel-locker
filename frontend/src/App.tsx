import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLoginPage from '@/pages/admin/AdminLoginPage'
import AdminParcelDetailPage from '@/pages/admin/AdminParcelDetailPage'
import AdminParcelsPage from '@/pages/admin/AdminParcelsPage'
import DepositOpenPage from '@/pages/deposit/DepositOpenPage'
import DepositPhonePage from '@/pages/deposit/DepositPhonePage'
import DepositSizePage from '@/pages/deposit/DepositSizePage'
import DepositSuccessPage from '@/pages/deposit/DepositSuccessPage'
import PickupHomePage from '@/pages/pickup/PickupHomePage'
import PickupOtpVerifyPage from '@/pages/pickup/PickupOtpVerifyPage'
import PickupParcelListPage from '@/pages/pickup/PickupParcelListPage'
import PickupSuccessPage from '@/pages/pickup/PickupSuccessPage'
import PickupWithCodePage from '@/pages/pickup/PickupWithCodePage'
import PickupWithPhonePage from '@/pages/pickup/PickupWithPhonePage'
import WelcomePage from '@/pages/welcome/WelcomePage'

const App = () => {
  return (
    <div className="min-h-screen bg-background text-text">
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/deposit" element={<DepositPhonePage />} />
        <Route path="/deposit/size" element={<DepositSizePage />} />
        <Route path="/deposit/open" element={<DepositOpenPage />} />
        <Route path="/deposit/success" element={<DepositSuccessPage />} />
        <Route path="/pickup" element={<PickupHomePage />} />
        <Route path="/pickup/code" element={<PickupWithCodePage />} />
        <Route path="/pickup/phone" element={<PickupWithPhonePage />} />
        <Route path="/pickup/otp" element={<PickupOtpVerifyPage />} />
        <Route path="/pickup/list" element={<PickupParcelListPage />} />
        <Route path="/pickup/success" element={<PickupSuccessPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/parcels" element={<AdminParcelsPage />} />
        <Route path="/admin/parcels/:id" element={<AdminParcelDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
