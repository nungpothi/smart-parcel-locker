import { useNavigate } from 'react'
import Button from '@/components/Button'
import Card from '@/components/Card'
import PageHeader from '@/components/PageHeader'
import { useTranslation } from '@/i18n'
import { useDepositStore } from '@/store/depositStore'

const DepositSuccessPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { parcelCode, pickupCode, resetDeposit } = useDepositStore()

  const handleBack = () => {
    resetDeposit()
    navigate('/')
  }

  return (
    <section className="flex flex-1 justify-center">
      <div className="stack-page w-full">
        <PageHeader
          title={t('public.deposit.success.title')}
          subtitle={t('public.deposit.success.subtitle')}
          variant="public"
        />

        <Card tone="muted" density="spacious" className="w-full max-w-3xl">
          <div className="stack-section items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-pill bg-primary text-3xl">
              OK
            </div>
            <p className="text-base text-text-muted">
              {t('public.deposit.success.body')}
            </p>
          </div>

          <div className="rounded-control mt-6 border border-border bg-surface/80 p-4 text-left">
            <p className="text-sm text-text-subtle">{t('public.deposit.success.parcelCodeLabel')}</p>
            <p className="text-xl font-semibold text-text">{parcelCode ?? '-'}</p>
            <p className="mt-4 text-sm text-text-subtle">
              {t('public.deposit.success.pickupCodeLabel')}
            </p>
            <p className="text-xl font-semibold text-text">{pickupCode ?? '----'}</p>
          </div>

          <div className="section-divider stack-actions">
            <Button fullWidth onClick={handleBack}>
              {t('public.deposit.success.finish')}
            </Button>
          </div>
        </Card>
      </div>
    </section>
  )
}

export default DepositSuccessPage
