import { useNavigate } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'

const PickupSuccess = () => {
  const navigate = useNavigate()
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-10">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-accent">
          Success
        </p>
        <h1 className="mt-3 font-display text-4xl">Pickup Complete</h1>
        <p className="mt-2 text-base text-text/80">
          Thanks for using the smart locker.
        </p>
      </header>

      <Card>
        <p className="text-base text-text/80">
          The locker door is open. Please take your parcel and close the door.
        </p>
        <div className="mt-6 space-y-3">
          <Button variant="secondary" fullWidth onClick={() => navigate('/')}
          >
            Return to Welcome
          </Button>
        </div>
      </Card>
    </main>
  )
}

export default PickupSuccess
