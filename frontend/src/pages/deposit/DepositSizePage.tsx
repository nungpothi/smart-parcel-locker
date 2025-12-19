import axios from 'axios'
import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'
import PageHeader from '@/components/PageHeader'
import { useTranslation } from '@/i18n'
import { depositParcel } from '@/services/api'
import { type DepositSize, useDepositStore } from '@/store/depositStore'

const sizeOptions: DepositSize[] = ['S', 'M', 'L']

const DepositSizePage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const {
    size,
    lockerId,
    receiverPhone,
    senderPhone,
    isSubmitting,
    errorMessage,
    setSize,
    setDepositResult,
    setSubmitting,
    setError,
  } = useDepositStore()
  const canSubmit = Boolean(size && lockerId && receiverPhone && senderPhone)

  const handleConfirm = async () => {
    if (!size || !lockerId || !receiverPhone || !senderPhone) {
      setError(t('public.deposit.size.error'))
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const response = await depositParcel({
        locker_id: lockerId,
        size,
        receiver_phone: receiverPhone,
        sender_phone: senderPhone,
      })
      const payload = response.data?.data
      if (!payload) {
        throw new Error('missing response data')
      }
      setDepositResult(
        payload.parcel_id,
        payload.parcel_code,
        payload.pickup_code ?? null,
        payload.status,
      )
      navigate('/deposit/open')
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined
      switch (status) {
        case 400:
          setError(t('common.errors.missingData'))
          break
        case 404:
          setError(t('public.pickup.otp.notFound'))
          break
        case 409:
          setError(t('public.pickup.otp.used'))
          break
        case 500:
        default:
          setError(t('common.errors.generic'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="flex flex-1 justify-center">
      <div className="stack-page w-full">
        <PageHeader
          title={t('public.deposit.size.title')}
          subtitle={t('public.deposit.size.subtitle')}
          variant="public"
        />

        <Card tone="muted" density="spacious" className="w-full max-w-3xl">
          <div className="stack-section">
            <div className="selection-grid">
              {sizeOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={clsx(
                    'selection-tile',
                    size === option && 'selection-tile--selected',
                  )}
                  onClick={() => setSize(option)}
                  disabled={isSubmitting}
                  aria-pressed={size === option}
                >
                  {option}
                </button>
              ))}
            </div>

            <div
              className={clsx(
                'field-support',
                errorMessage && 'field-error',
              )}
              aria-live="polite"
            >
              {errorMessage ?? ' '}
            </div>

            <div className="selection-actions stack-actions">
              <Button
                fullWidth
                size="xl"
                onClick={handleConfirm}
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting
                  ? t('public.deposit.size.submitting')
                  : t('public.deposit.size.submit')}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}

export default DepositSizePage
