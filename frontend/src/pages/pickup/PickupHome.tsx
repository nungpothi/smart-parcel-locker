import { useNavigate } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'

const PickupHome = () => {
  const navigate = useNavigate()

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center gap-6 px-6 py-10">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-accent">
          Pickup Flow
        </p>
        <h1 className="mt-3 font-display text-4xl">Pick Up a Parcel</h1>
        <p className="mt-2 text-base text-text/80">
          Choose how you want to verify your pickup.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Use Pickup Code">
          <p className="text-base text-text/80">
            Enter the code sent to your phone.
          </p>
          <div className="mt-6">
            <Button fullWidth onClick={() => navigate('/pickup/code')}>
              Enter Code
            </Button>
          </div>
        </Card>
        <Card title="Use Phone + OTP">
          <p className="text-base text-text/80">
            Verify your phone number with an OTP.
          </p>
          <div className="mt-6">
            <Button fullWidth onClick={() => navigate('/pickup/phone')}>
              Verify Phone
            </Button>
          </div>
        </Card>
      </div>

      <Button variant="secondary" fullWidth onClick={() => navigate('/')}>
        Back to Welcome
      </Button>
    </main>
  )
}

export default PickupHome
