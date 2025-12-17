import { useNavigate } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'
import PickupOtpForm from '@/flows/pickup/PickupOtpForm'
import { usePickupStore } from '@/store/pickupStore'

const PickupOtpVerify = () => {
  const navigate = useNavigate()
  const { setOtp } = usePickupStore()

  const handleSubmit = (otp: string) => {
    setOtp(otp)
    navigate('/pickup/list')
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-10">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-accent">
          OTP Verification
        </p>
        <h1 className="mt-3 font-display text-4xl">Enter OTP</h1>
        <p className="mt-2 text-base text-text/80">
          Enter the one-time passcode sent to your phone.
        </p>
      </header>

      <Card>
        <PickupOtpForm onSubmit={handleSubmit} />
      </Card>

      <Button variant="secondary" fullWidth onClick={() => navigate('/pickup/phone')}>
        Back to Phone Entry
      </Button>
    </main>
  )
}

export default PickupOtpVerify
