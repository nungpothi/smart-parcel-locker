import { useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Input from '@/components/Input'
import PageHeader from '@/components/PageHeader'
import { useTranslation } from '@/i18n'
import { usePickupStore } from '@/store/pickupStore'

type PickupWithCodeForm = {
  phone: string
  pickupCode: string
}

const PickupWithCodePage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { setPhone, setPickupCode, resetPickup } = usePickupStore()

  const formSchema = useMemo(
    () =>
      z.object({
        phone: z
          .string()
          .min(9, t('common.errors.phoneRequired'))
          .regex(/^[0-9]+$/, t('common.errors.phoneDigits')),
        pickupCode: z
          .string()
          .min(4, t('common.errors.pickupCodeLength')),
      }),
    [t],
  )

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
    <section className="flex flex-1 justify-center p-[10px]">
      <div className="stack-page w-full">
        <PageHeader
          title={t('public.pickup.code.title')}
          subtitle={t('public.pickup.code.subtitle')}
          variant="public"
        />

        <Card tone="muted" density="spacious" className="w-full max-w-3xl">
          <form className="form-shell" onSubmit={handleSubmit(onSubmit)}>
            <div className="stack-section">
              <Input
                label={t('public.pickup.code.pickupCodeLabel')}
                placeholder={t('public.pickup.code.pickupCodePlaceholder')}
                inputMode="numeric"
                autoComplete="one-time-code"
                className="text-center text-3xl font-semibold tracking-[0.24em] leading-tight"
                {...register('pickupCode')}
                error={errors.pickupCode?.message}
              />
              <Input
                label={t('public.pickup.code.phoneLabel')}
                placeholder={t('public.pickup.code.phonePlaceholder')}
                inputMode="tel"
                autoComplete="tel"
                {...register('phone')}
                error={errors.phone?.message}
              />
            </div>

            <div className="stack-actions">
              <Button type="submit" size="xl" fullWidth disabled={!isValid}>
                {t('public.pickup.code.submit')}
              </Button>
            </div>
          </form>

          <div className="section-divider stack-actions">
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={() => navigate('/')}
            >
              {t('public.pickup.code.startOver')}
            </Button>
          </div>
        </Card>
      </div>
    </section>
  )
}

export default PickupWithCodePage
