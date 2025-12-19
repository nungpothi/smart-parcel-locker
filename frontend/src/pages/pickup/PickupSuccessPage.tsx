import { useNavigate } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'
import PageHeader from '@/components/PageHeader'
import { useTranslation } from '@/i18n'
import { usePickupStore } from '@/store/pickupStore'

const PickupSuccessPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { parcels, selectedParcelId, resetPickup } = usePickupStore()
  const selectedParcel = parcels.find(
    (parcel) => parcel.parcel_id === selectedParcelId,
  )

  const handleBack = () => {
    resetPickup()
    navigate('/')
  }

  return (
    <section className="flex flex-1 justify-center p-[10px]">
      <div className="stack-page w-full">
        <PageHeader
          title={t('public.pickup.success.title')}
          subtitle={t('public.pickup.success.subtitle')}
          variant="public"
        />

        <Card tone="muted" density="spacious" className="w-full max-w-3xl p-[10px]">
          <div className="stack-section items-center text-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-panel bg-surface text-3xl font-semibold shadow-panel p-[10px]">
              OK
            </div>
            <div className="stack-section">
              <p className="text-3xl font-semibold text-text">
                {t('public.pickup.success.headline')}
              </p>
              <p className="text-lg text-text-muted">
                {t('public.pickup.success.body')}
              </p>
            </div>
          </div>

          {selectedParcel && (
            <div className="rounded-panel border border-border/70 bg-surface px-5 py-4  p-[10px]">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-text-subtle">
                {t('public.pickup.success.parcelCodeLabel')}
              </p>
              <p className="mt-2 text-2xl font-semibold text-text">
                {selectedParcel.parcel_code}
              </p>
            </div>
          )}

          <div className="section-divider stack-actions">
            <Button fullWidth size="xl" onClick={handleBack}>
              {t('public.pickup.success.finish')}
            </Button>
          </div>
        </Card>
      </div>
    </section>
  )
}

export default PickupSuccessPage
