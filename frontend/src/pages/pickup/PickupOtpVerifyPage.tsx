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
import { requestPickupOtp, verifyPickupOtp } from '@/services/api'
import { usePickupStore } from '@/store/pickupStore'

type PickupOtpForm = {
  otp: string
}

const PickupOtpVerifyPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const {
    phone,
    otpRef,
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
        otp: z
          .string()
          .length(6, t('common.errors.otpLength'))
          .regex(/^[0-9]+$/, t('common.errors.phoneDigits')),
      }),
    [t],
  )

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<PickupOtpForm>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      otp: '',
    },
  })

  useEffect(() => {
    setError(null)
    if (!phone) {
      navigate('/pickup/phone')
    }
  }, [navigate, phone, setError])

  const onSubmit = async (values: PickupOtpForm) => {
    if (!phone || !otpRef) {
      setError(t('public.pickup.otp.requestNew'))
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const response = await verifyPickupOtp(phone, otpRef, values.otp)
      const payload = response.data?.data
      if (!payload?.pickup_token) {
        throw new Error('missing pickup_token')
      }
      setOtpCode(values.otp)
      setPickupToken(payload.pickup_token, payload.expires_at ?? null)
      navigate('/pickup/list')
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined
      switch (status) {
        case 400:
          setError(t('public.pickup.otp.incorrect'))
          break
        case 404:
          setError(t('public.pickup.otp.notFound'))
          break
        case 409:
          setError(t('public.pickup.otp.used'))
          break
        case 410:
          setError(t('public.pickup.otp.expired'))
          break
        case 500:
        default:
          setError(t('common.errors.generic'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (!phone) {
      setError(t('public.pickup.otp.requestNew'))
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const response = await requestPickupOtp(phone)
      const payload = response.data?.data
      if (!payload?.otp_ref) {
        throw new Error('missing otp_ref')
      }
      setOtpRef(payload.otp_ref)
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined
      switch (status) {
        case 400:
          setError(t('public.pickup.otp.incorrect'))
          break
        case 429:
          setError(t('public.pickup.otp.rateLimit'))
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
          title={t('public.pickup.otp.title')}
          subtitle={t('public.pickup.otp.subtitle')}
          variant="public"
        />

        <Card tone="muted" density="spacious" className="w-full max-w-3xl">
          <form className="form-shell" onSubmit={handleSubmit(onSubmit)}>
            <div className="stack-section">
              <p className="text-center text-base text-text-muted">
                {t('public.pickup.otp.helper')}
              </p>
              <Input
                label={t('public.pickup.otp.otpLabel')}
                placeholder={t('public.pickup.otp.otpPlaceholder')}
                inputMode="numeric"
                autoComplete="one-time-code"
                className="text-center text-3xl font-semibold tracking-[0.24em] leading-tight"
                {...register('otp')}
                error={errors.otp?.message}
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
                {isSubmitting ? t('public.pickup.otp.verifying') : t('public.pickup.otp.verify')}
              </Button>
            </div>
          </form>

          <div className="section-divider stack-actions">
            <Button
              type="button"
              variant="outline"
              size="lg"
              fullWidth
              onClick={handleResend}
              disabled={isSubmitting}
            >
              {t('public.pickup.otp.resend')}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={() => navigate('/pickup/phone')}
            >
              {t('public.pickup.otp.startOver')}
            </Button>
          </div>
        </Card>
      </div>
    </section>
  )
}

export default PickupOtpVerifyPage
