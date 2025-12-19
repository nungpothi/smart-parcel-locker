import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Input from '@/components/Input'
import PageHeader from '@/components/PageHeader'
import { usePickupStore } from '@/store/pickupStore'

const phoneSchema = z
  .string()
  .min(9, 'Phone number must be at least 9 digits')
  .regex(/^[0-9]+$/, 'Phone number must contain only digits')

const formSchema = z.object({
  phone: phoneSchema,
  pickupCode: z.string().min(4, 'Pickup code must be at least 4 characters'),
})

type PickupWithCodeForm = z.infer<typeof formSchema>

const PickupWithCodePage = () => {
  const navigate = useNavigate()
  const { setPhone, setPickupCode, resetPickup } = usePickupStore()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<PickupWithCodeForm>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      phone: '',
      pickupCode: '',
    },
  })

  const onSubmit = (values: PickupWithCodeForm) => {
    resetPickup()
    setPhone(values.phone)
    setPickupCode(values.pickupCode)
    navigate('/pickup/success')
  }

  return (
    <section className="flex flex-1 justify-center">
      <div className="stack-page w-full">
        <PageHeader
          title="Enter your pickup code"
          subtitle="Use the code we sent you to unlock your parcel safely."
          variant="public"
        />

        <Card tone="muted" density="spacious" className="w-full max-w-3xl">
          <form className="form-shell" onSubmit={handleSubmit(onSubmit)}>
            <div className="stack-section">
              <Input
                label="Pickup code"
                placeholder="000000"
                inputMode="numeric"
                autoComplete="one-time-code"
                className="text-center text-3xl font-semibold tracking-[0.24em] leading-tight"
                {...register('pickupCode')}
                error={errors.pickupCode?.message}
              />
              <Input
                label="Phone number"
                placeholder="Enter phone number"
                inputMode="tel"
                autoComplete="tel"
                {...register('phone')}
                error={errors.phone?.message}
              />
            </div>

            <div className="stack-actions">
              <Button type="submit" size="xl" fullWidth disabled={!isValid}>
                Continue
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

export default PickupWithCodePage
