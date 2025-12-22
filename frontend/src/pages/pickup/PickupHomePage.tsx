import { useNavigate } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'
import PageHeader from '@/components/PageHeader'
import { showModal } from '@/components/Modal/Modal'
import { useTranslation } from '@/i18n'

const PickupHomePage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  // TODO: Replace coming-soon modal with pickup-by-code flow once backend wiring is ready.
  const handlePickupByCode = () => {
    showModal({
      title: t('common.coming_soon_title'),
      text: t('common.pickup_code_coming_soon_message'),
      confirmText: t('common.actions.ok'),
    })
  }

  return (
    <section className="flex flex-1 justify-center p-[10px]">
      <div className="stack-page w-full">
        <PageHeader
          title={t('public.pickup.home.title')}
          subtitle={t('public.pickup.home.subtitle')}
          variant="public"
        />

        <Card tone="muted" density="spacious" className="w-full max-w-4xl p-[10px]">
          <div className="stack-section">
            <div className="selection-grid">
              <button
                type="button"
                className="selection-tile opacity-60 cursor-not-allowed"
                onClick={handlePickupByCode}
                aria-disabled="true"
              >
                <span className="text-2xl font-semibold leading-snug">
                  {t('public.pickup.home.byCodeLabel')}
                </span>
                <span className="text-base font-medium text-text-muted">
                  {t('public.pickup.home.byCodeHelper')}
                </span>
              </button>
              <button
                type="button"
                className="selection-tile"
                onClick={() => navigate('/pickup/phone')}
              >
                <span className="text-2xl font-semibold leading-snug">
                  {t('public.pickup.home.byPhoneLabel')}
                </span>
                <span className="text-base font-medium text-text-muted">
                  {t('public.pickup.home.byPhoneHelper')}
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
                {t('public.pickup.home.startOver')}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}

export default PickupHomePage
