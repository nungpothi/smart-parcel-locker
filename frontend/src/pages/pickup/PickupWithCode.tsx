import { useNavigate } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'
import PickupCodeForm from '@/flows/pickup/PickupCodeForm'
import { usePickupStore } from '@/store/pickupStore'

const PickupWithCode = () => {
  const navigate = useNavigate()
  const { setToken } = usePickupStore()

  const handleSubmit = (token: string) => {
    setToken(token)
    navigate('/pickup/list')
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-10">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-accent">
          Pickup Code
        </p>
        <h1 className="mt-3 font-display text-4xl">Enter Pickup Code</h1>
        <p className="mt-2 text-base text-text/80">
          Type the token from your SMS message.
        </p>
      </header>

      <Card>
        <PickupCodeForm onSubmit={handleSubmit} />
      </Card>

      <Button variant="secondary" fullWidth onClick={() => navigate('/pickup')}>
        Back to Pickup Options
      </Button>
    </main>
  )
}

export default PickupWithCode
