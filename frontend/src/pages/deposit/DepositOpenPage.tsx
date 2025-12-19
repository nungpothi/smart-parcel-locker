import { useNavigate } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'
import PageHeader from '@/components/PageHeader'
import { useTranslation } from '@/i18n'
import { useDepositStore } from '@/store/depositStore'

const DepositOpenPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { parcelCode, pickupCode } = useDepositStore()

  return (
    <section className="flex flex-1 justify-center">
      <div className="stack-page w-full">
        <PageHeader
          title={t('public.deposit.open.title')}
          subtitle={t('public.deposit.open.subtitle')}
          variant="public"
        />

        <Card tone="muted" density="spacious" className="w-full max-w-3xl">
          <div className="stack-section items-center text-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-panel bg-surface text-4xl shadow-panel">
              OK
            </div>
            <div className="stack-section">
              <p className="text-2xl font-semibold text-text">
                {t('public.deposit.open.headline')}
              </p>
              <p className="text-lg text-text-muted">
                {t('public.deposit.open.body')}
              </p>
            </div>
          </div>

          <div className="stack-section">
            <div className="rounded-panel border border-border/70 bg-surface px-5 py-4">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-text-subtle">
                {t('public.deposit.open.parcelCodeLabel')}
              </p>
              <p className="mt-2 text-2xl font-semibold text-text">
                {parcelCode ?? '-'}
              </p>
              <div className="mt-4">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-text-subtle">
                  {t('public.deposit.open.pickupCodeLabel')}
                </p>
                <p className="mt-2 text-2xl font-semibold text-text">
                  {pickupCode ?? '----'}
                </p>
              </div>
            </div>

            <div className="stack-actions selection-actions">
              <Button
                fullWidth
                size="xl"
                onClick={() => navigate('/deposit/success')}
              >
                {t('public.deposit.open.openLocker')}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}

export default DepositOpenPage
