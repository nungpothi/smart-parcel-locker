import { useNavigate } from 'react'
import Button from '@/components/Button'
import Card from '@/components/Card'
import PageHeader from '@/components/PageHeader'
import { usePickupStore } from '@/store/pickupStore'

const PickupSuccessPage = () => {
  const navigate = useNavigate()
  const { parcels, selectedParcelId, resetPickup } = usePickupStore()
  const selectedParcel = parcels.find(
    (parcel) => parcel.parcel_id === selectedParcelId,
  )

  const handleBack = () => {
    resetPickup()
    navigate('/')
  }

  return (
    <section className="flex flex-1 justify-center">
      <div className="stack-page w-full">
        <PageHeader
          title="Pickup confirmed"
          subtitle="Your parcel is ready. No further steps are needed."
          variant="public"
        />

        <Card tone="muted" density="spacious" className="w-full max-w-3xl">
          <div className="stack-section items-center text-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-panel bg-surface text-3xl font-semibold shadow-panel">
              OK
            </div>
            <div className="stack-section">
              <p className="text-3xl font-semibold text-text">Pickup complete</p>
              <p className="text-lg text-text-muted">
                You can close the locker and remove your parcel.
              </p>
            </div>
          </div>

          {selectedParcel && (
            <div className="rounded-panel border border-border/70 bg-surface px-5 py-4">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-text-subtle">
                Parcel code
              </p>
              <p className="mt-2 text-2xl font-semibold text-text">
                {selectedParcel.parcel_code}
              </p>
            </div>
          )}

          <div className="section-divider stack-actions">
            <Button fullWidth size="xl" onClick={handleBack}>
              Finish
            </Button>
          </div>
        </Card>
      </div>
    </section>
  )
}

export default PickupSuccessPage
