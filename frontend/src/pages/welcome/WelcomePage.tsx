import { useNavigate } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'
import PageHeader from '@/components/PageHeader'
import { useTranslation } from '@/i18n'

const WelcomePage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <section className="flex flex-1 items-center justify-center p-[10px]">
      <Card tone="muted" density="spacious" className="w-full max-w-3xl">
        <div className="stack-page w-full items-center p-12 sm:p-16">
          <div className="stack-section items-center text-center">
            <span className="eyebrow-chip rounded-pill border border-border/70 bg-surface text-base font-semibold text-text-muted">
              {t('public.welcome.eyebrow')}
            </span>
            <PageHeader
              title={t('public.welcome.title')}
              subtitle={t('public.welcome.subtitle')}
              variant="public"
              align="center"
            />
          </div>

          <div className="stack-actions w-full">
            <Button
              size="xl"
              fullWidth
              className="py-5 text-2xl sm:text-3xl"
              onClick={() => navigate('/deposit')}
            >
              {t('public.welcome.depositCta')}
            </Button>
            <Button
              size="xl"
              variant="secondary"
              fullWidth
              className="py-5 text-2xl sm:text-3xl"
              onClick={() => navigate('/pickup')}
            >
              {t('public.welcome.pickupCta')}
            </Button>
          </div>

          <div className="section-divider w-full">
            <Button
              size="md"
              variant="outline"
              fullWidth
              onClick={() => navigate('/admin')}
            >
              {t('public.welcome.adminCta')}
            </Button>
          </div>
        </div>
      </Card>
    </section>
  )
}

export default WelcomePage
