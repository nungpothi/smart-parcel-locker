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
import { requestPickupOtp } from '@/services/api'
import { usePickupStore } from '@/store/pickupStore'

const phoneSchema = z
  .string()
  .min(9, 'Phone number must be at least 9 digits')
  .regex(/^[0-9]+$/, 'Phone number must contain only digits')

const formSchema = z.object({
  phone: phoneSchema,
})

type PickupPhoneForm = z.infer<typeof formSchema>

const PickupWithPhonePage = () => {
  const navigate = useNavigate()
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
          title="Verify with your phone number"
          subtitle="Enter your phone number to receive a one-time code for pickup."
          variant="public"
        />

        <Card tone="muted" density="spacious" className="w-full max-w-3xl">
          <form className="form-shell" onSubmit={handleSubmit(onSubmit)}>
            <div className="stack-section">
              <p className="text-base text-text-muted">
                We only use this number to send your pickup code.
              </p>
              <Input
                label="Phone number"
                placeholder="Enter phone number"
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
                {isSubmitting ? 'Sending code...' : 'Send code'}
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
              Start over
            </Button>
          </div>
        </Card>
      </div>
    </section>
  )
}

export default PickupWithPhonePage
