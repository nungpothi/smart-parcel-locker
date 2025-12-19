import { useEffect, useMemo } from 'react'
import axios from 'axios'
import clsx from 'clsx'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Input from '@/components/Input'
import PageHeader from '@/components/PageHeader'
import { useTranslation } from '@/i18n'
import { requestPickupOtp } from '@/services/api'
import { usePickupStore } from '@/store/pickupStore'

type PickupPhoneForm = {
  phone: string
}

const PickupWithPhonePage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const {
    setPhone,
    setPickupCode,
    setOtpRef,
    setOtpCode,
    setPickupToken,
    setSubmitting,
    setError,
    isSubmitting,
    errorMessage,
  } = usePickupStore()

  const formSchema = useMemo(
    () =>
      z.object({
        phone: z
          .string()
          .min(9, t('common.errors.phoneRequired'))
          .regex(/^[0-9]+$/, t('common.errors.phoneDigits')),
      }),
    [t],
  )

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<PickupPhoneForm>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      phone: '',
    },
  })

  useEffect(() => {
    setError(null)
  }, [setError])

  const onSubmit = async (values: PickupPhoneForm) => {
    setSubmitting(true)
    setError(null)
    try {
      const response = await requestPickupOtp(values.phone)
      const payload = response.data?.data
      if (!payload?.otp_ref) {
        throw new Error('missing otp_ref')
      }
      setPickupCode(null)
      setPhone(values.phone)
      setOtpRef(payload.otp_ref)
      setOtpCode('')
      setPickupToken(null, null)
      navigate('/pickup/otp')
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined
      switch (status) {
        case 400:
          setError(t('common.errors.phoneRequired'))
          break
        case 429:
          setError(t('public.pickup.phone.rateLimit'))
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
    <section className="flex flex-1 justify-center p-[10px]">
      <div className="stack-page w-full">
        <PageHeader
          title={t('public.pickup.phone.title')}
          subtitle={t('public.pickup.phone.subtitle')}
          variant="public"
        />

        <Card tone="muted" density="spacious" className="w-full max-w-3xl">
          <form className="form-shell" onSubmit={handleSubmit(onSubmit)}>
            <div className="stack-section">
              <p className="text-base text-text-muted">
                {t('public.pickup.phone.helper')}
              </p>
              <Input
                label={t('public.pickup.phone.phoneLabel')}
                placeholder={t('public.pickup.phone.phonePlaceholder')}
                inputMode="tel"
                autoComplete="tel"
                className="text-center text-2xl font-semibold tracking-[0.12em]"
                {...register('phone')}
                error={errors.phone?.message}
              />
              <div
                className={clsx(
                  'field-support text-center',
                  errorMessage && 'field-error',
                )}
                aria-live="polite"
              >
                {errorMessage ?? ' '}
              </div>
            </div>

            <div className="stack-actions">
              <Button
                type="submit"
                size="xl"
                fullWidth
                disabled={!isValid || isSubmitting}
              >
                {isSubmitting
                  ? t('public.pickup.phone.sendingCode')
                  : t('public.pickup.phone.sendCode')}
              </Button>
            </div>
          </form>

          <div className="section-divider stack-actions">
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={() => navigate('/pickup')}
            >
              {t('public.pickup.phone.startOver')}
            </Button>
          </div>
        </Card>
      </div>
    </section>
  )
}

export default PickupWithPhonePage
