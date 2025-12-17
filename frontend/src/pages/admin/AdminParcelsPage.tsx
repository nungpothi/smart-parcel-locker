import { Link, useNavigate } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'

const AdminParcelsPage = () => {
  const navigate = useNavigate()
  const sampleParcels = [
    { id: 'preview-001', status: 'Awaiting pickup', size: 'medium' },
    { id: 'preview-002', status: 'Stored', size: 'small' },
  ]

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-6 py-10">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-accent">
          Admin
        </p>
        <h1 className="mt-3 font-display text-4xl">Parcels Overview</h1>
        <p className="mt-2 text-base text-text/80">
          This is a simple placeholder list for admin routing.
        </p>
      </header>

      <Card title="Recent Parcels">
        <div className="space-y-4">
          {sampleParcels.map((parcel) => (
            <Link
              key={parcel.id}
              to={`/admin/parcels/${parcel.id}`}
              className="flex items-center justify-between rounded-2xl border border-primary/30 bg-white/80 p-4"
            >
              <div>
                <p className="text-lg font-semibold">{parcel.id}</p>
                <p className="text-sm text-text/70">{parcel.status}</p>
              </div>
              <span className="rounded-full bg-primary px-4 py-2 text-sm font-semibold">
                {parcel.size}
              </span>
            </Link>
          ))}
        </div>
      </Card>

      <div className="space-y-3">
        <Button variant="secondary" fullWidth onClick={() => navigate('/admin/login')}>
          Back to Admin Login
        </Button>
        <Button variant="secondary" fullWidth onClick={() => navigate('/')}
        >
          Back to Welcome
        </Button>
      </div>
    </main>
  )
}

export default AdminParcelsPage
