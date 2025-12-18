import { useNavigate } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'
import PageHeader from '@/components/PageHeader'

const AdminHomePage = () => {
  const navigate = useNavigate()

  return (
    <section className="flex flex-1 flex-col gap-6">
      <PageHeader
        variant="admin"
        title="Admin Setup"
        subtitle="ตั้งค่าสถานที่และตู้พัสดุ"
        align="left"
      />

      <Card density="cozy">
        <div className="space-y-4">
          <Button fullWidth onClick={() => navigate('/admin/locations')}>
            Locations
          </Button>
          <Button fullWidth onClick={() => navigate('/admin/lockers')}>
            Lockers
          </Button>
          <Button variant="secondary" fullWidth onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </Card>
    </section>
  )
}

export default AdminHomePage
