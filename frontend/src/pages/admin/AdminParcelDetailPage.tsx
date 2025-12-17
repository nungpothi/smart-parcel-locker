import { useNavigate, useParams } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'

const AdminParcelDetailPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-10">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-accent">
          Admin Detail
        </p>
        <h1 className="mt-3 font-display text-4xl">Parcel {id}</h1>
        <p className="mt-2 text-base text-text/80">
          Placeholder detail view for a single parcel.
        </p>
      </header>

      <Card>
        <div className="space-y-3 text-base text-text/80">
          <p>Locker assignment: Pending</p>
          <p>Size: Unknown</p>
          <p>Status: Placeholder</p>
        </div>
      </Card>

      <Button variant="secondary" fullWidth onClick={() => navigate('/admin/parcels')}>
        Back to Parcels
      </Button>
    </main>
  )
}

export default AdminParcelDetailPage
