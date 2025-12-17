import { useNavigate } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'
import PickupPhoneForm from '@/flows/pickup/PickupPhoneForm'
import { usePickupStore } from '@/store/pickupStore'

const PickupWithPhone = () => {
  const navigate = useNavigate()
  const { setPhone } = usePickupStore()

  const handleSubmit = (phone: string) => {
    setPhone(phone)
    navigate('/pickup/otp')
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-10">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-accent">
          Phone Verification
        </p>
        <h1 className="mt-3 font-display text-4xl">Verify by Phone</h1>
        <p className="mt-2 text-base text-text/80">
          We will send an OTP to your phone number.
        </p>
      </header>

      <Card>
        <PickupPhoneForm onSubmit={handleSubmit} />
      </Card>

      <Button variant="secondary" fullWidth onClick={() => navigate('/pickup')}>
        Back to Pickup Options
      </Button>
    </main>
  )
}

export default PickupWithPhone
