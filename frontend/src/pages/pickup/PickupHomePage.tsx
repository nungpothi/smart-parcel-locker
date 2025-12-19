import { useNavigate } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'
import PageHeader from '@/components/PageHeader'

const PickupHomePage = () => {
  const navigate = useNavigate()

  return (
    <section className="flex flex-1 justify-center">
      <div className="stack-page w-full">
        <PageHeader
          title="Pick up your parcel"
          subtitle="Choose how you want to verify yourself to open the locker."
          variant="public"
        />

        <Card tone="muted" density="spacious" className="w-full max-w-4xl">
          <div className="stack-section">
            <div className="selection-grid">
              <button
                type="button"
                className="selection-tile"
                onClick={() => navigate('/pickup/code')}
              >
                <span className="text-2xl font-semibold leading-snug">
                  Enter pickup code
                </span>
                <span className="text-base font-medium text-text-muted">
                  Use the 6-digit code we sent you
                </span>
              </button>
              <button
                type="button"
                className="selection-tile"
                onClick={() => navigate('/pickup/phone')}
              >
                <span className="text-2xl font-semibold leading-snug">
                  Verify by phone number
                </span>
                <span className="text-base font-medium text-text-muted">
                  Receive a one-time code by SMS
                </span>
              </button>
            </div>

            <div className="selection-actions stack-actions">
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                onClick={() => navigate('/')}
              >
                Start over
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}

export default PickupHomePage
