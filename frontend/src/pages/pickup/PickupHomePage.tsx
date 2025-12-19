import { useNavigate } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'
import PageHeader from '@/components/PageHeader'
import { useTranslation } from '@/i18n'

const PickupHomePage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <section className="flex flex-1 justify-center">
      <div className="stack-page w-full">
        <PageHeader
          title={t('public.pickup.home.title')}
          subtitle={t('public.pickup.home.subtitle')}
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
