import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLoginPage from '@/pages/admin/AdminLoginPage'
import AdminParcelDetailPage from '@/pages/admin/AdminParcelDetailPage'
import AdminParcelsPage from '@/pages/admin/AdminParcelsPage'
import DepositFlow from '@/pages/deposit/DepositFlow'
import PickupHome from '@/pages/pickup/PickupHome'
import PickupOtpVerify from '@/pages/pickup/PickupOtpVerify'
import PickupParcelList from '@/pages/pickup/PickupParcelList'
import PickupSuccess from '@/pages/pickup/PickupSuccess'
import PickupWithCode from '@/pages/pickup/PickupWithCode'
import PickupWithPhone from '@/pages/pickup/PickupWithPhone'
import WelcomePage from '@/pages/welcome/WelcomePage'

const App = () => {
  return (
    <div className="min-h-screen bg-background text-text">
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/deposit" element={<DepositFlow />} />
        <Route path="/pickup" element={<PickupHome />} />
        <Route path="/pickup/code" element={<PickupWithCode />} />
        <Route path="/pickup/phone" element={<PickupWithPhone />} />
        <Route path="/pickup/otp" element={<PickupOtpVerify />} />
        <Route path="/pickup/list" element={<PickupParcelList />} />
        <Route path="/pickup/success" element={<PickupSuccess />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/parcels" element={<AdminParcelsPage />} />
        <Route path="/admin/parcels/:id" element={<AdminParcelDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
