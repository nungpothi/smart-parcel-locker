import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'

const WelcomePage = () => {
  const navigate = useNavigate()
  const today = dayjs().format('dddd, MMM D')

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-8 px-6 py-10">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-accent">
          Smart Parcel Locker
        </p>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl">Welcome</h1>
        <p className="mt-2 text-lg text-text/80">{today}</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Deposit a parcel">
          <p className="text-base text-text/80">
            Start a drop-off using your phone number.
          </p>
          <div className="mt-6">
            <Button fullWidth onClick={() => navigate('/deposit')}>
              Start Deposit
            </Button>
          </div>
        </Card>
        <Card title="Pick up a parcel">
          <p className="text-base text-text/80">
            Collect with a pickup token or OTP verification.
          </p>
          <div className="mt-6 space-y-3">
            <Button fullWidth onClick={() => navigate('/pickup')}>
              Start Pickup
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => navigate('/pickup/code')}
            >
              Enter Pickup Code
            </Button>
          </div>
        </Card>
      </div>

      <Card title="Admin">
        <p className="text-base text-text/80">
          Locker management access for staff only.
        </p>
        <div className="mt-6">
          <Button variant="secondary" fullWidth onClick={() => navigate('/admin/login')}>
            Go to Admin Login
          </Button>
        </div>
      </Card>
    </main>
  )
}

export default WelcomePage
