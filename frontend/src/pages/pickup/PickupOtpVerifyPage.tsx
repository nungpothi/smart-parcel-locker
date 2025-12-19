import { useEffect } from 'react'
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
import { requestPickupOtp, verifyPickupOtp } from '@/services/api'
import { usePickupStore } from '@/store/pickupStore'

const formSchema = z.object({
  otp: z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^[0-9]+$/, 'OTP must contain only digits'),
})

type PickupOtpForm = z.infer<typeof formSchema>

const PickupOtpVerifyPage = () => {
  const navigate = useNavigate()
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
      setError('Please request a new code to continue.')
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
          setError('Incorrect code. Please check and try again.')
          break
        case 404:
          setError('Code not found. Please request a new one.')
          break
        case 409:
          setError('This code has already been used.')
          break
        case 410:
          setError('This code has expired. Request a new code.')
          break
        case 500:
        default:
          setError('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (!phone) {
      setError('Please enter your phone number first.')
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
          setError('Invalid phone number. Please check and try again.')
          break
        case 429:
          setError('Too many requests. Please wait before requesting another code.')
          break
        case 500:
        default:
          setError('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="flex flex-1 justify-center">
      <div className="stack-page w-full">
        <PageHeader
          title="Enter the verification code"
          subtitle="We sent a 6-digit code to your phone. Enter it to continue your pickup."
          variant="public"
        />

        <Card tone="muted" density="spacious" className="w-full max-w-3xl">
          <form className="form-shell" onSubmit={handleSubmit(onSubmit)}>
            <div className="stack-section">
              <p className="text-center text-base text-text-muted">
                We only use this code to confirm your identity.
              </p>
              <Input
                label="6-digit code"
                placeholder="000000"
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
                {isSubmitting ? 'Verifying...' : 'Verify code'}
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
              Resend code
            </Button>
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={() => navigate('/pickup/phone')}
            >
              Start over
            </Button>
          </div>
        </Card>
      </div>
    </section>
  )
}

export default PickupOtpVerifyPage
