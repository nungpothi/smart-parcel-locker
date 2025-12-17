import { useNavigate } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'

const AdminHomePage = () => {
  const navigate = useNavigate()

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-10">
      <Card>
        <div className="text-center">
          <h1 className="font-display text-4xl">Admin Setup</h1>
        </div>
        <div className="mt-8 space-y-4">
          <Button fullWidth onClick={() => navigate('/admin/locations')}>
            Locations
          </Button>
          <Button fullWidth onClick={() => navigate('/admin/lockers')}>
            Lockers
          </Button>
          <Button variant="secondary" fullWidth onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
        </div>
      </Card>
    </main>
  )
}

export default AdminHomePage
