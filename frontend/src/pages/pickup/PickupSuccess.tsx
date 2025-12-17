import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Modal from '@/components/Modal'

const PickupSuccess = () => {
  const navigate = useNavigate()
  const [showReceipt, setShowReceipt] = useState(false)

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-10">
      <Modal
        open={showReceipt}
        title="Pickup Confirmed"
        text="Please close the locker door before you leave."
        icon="success"
        confirmText="Done"
        onClose={() => setShowReceipt(false)}
      />
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
          <Button fullWidth onClick={() => setShowReceipt(true)}>
            Show Pickup Reminder
          </Button>
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
