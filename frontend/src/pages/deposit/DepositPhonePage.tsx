import { useEffect, useMemo, useState } from 'react'
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
import { fetchAvailableLockers, type AvailableLocker } from '@/services/api'
import { useDepositStore } from '@/store/depositStore'

type DepositPhoneForm = {
  lockerId: string
  receiverPhone: string
  senderPhone: string
}

const DepositPhonePage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const {
    receiverPhone,
    senderPhone,
    lockerId,
    setReceiverPhone,
    setSenderPhone,
    setLocker,
  } = useDepositStore()

  const [lockers, setLockers] = useState<AvailableLocker[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')

  const lockerOptions = useMemo(
    () =>
      lockers.map((locker) => ({
        value: locker.locker_id,
        label: `${locker.locker_code} - ${locker.location_name}`,
      })),
    [lockers],
  )

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setFetchError('')
      try {
        const response = await fetchAvailableLockers()
        setLockers(response.data?.data ?? [])
      } catch (err) {
        setFetchError(t('common.errors.generic'))
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [t])

  const formSchema = useMemo(
    () =>
      z.object({
        lockerId: z.string().min(1, t('common.errors.selectLocker')),
        receiverPhone: z
          .string()
          .min(9, t('common.errors.phoneRequired'))
          .regex(/^[0-9]+$/, t('common.errors.phoneDigits')),
        senderPhone: z
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
  } = useForm<DepositPhoneForm>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      lockerId: lockerId ?? '',
      receiverPhone,
      senderPhone,
    },
  })

  const onSubmit = (values: DepositPhoneForm) => {
    const option = lockerOptions.find((item) => item.value === values.lockerId)
    if (!option) {
      return
    }
    setLocker(option.value, option.label)
    setReceiverPhone(values.receiverPhone)
    setSenderPhone(values.senderPhone)
    navigate('/deposit/size')
  }

  return (
    <section className="flex flex-1 justify-center p-[10px]">
      <div className="stack-page w-full">
        <PageHeader
          title={t('public.deposit.phone.title')}
          subtitle={t('public.deposit.phone.subtitle')}
          variant="public"
        />

        <Card tone="muted" density="spacious" className="w-full max-w-3xl">
          <form className="form-shell" onSubmit={handleSubmit(onSubmit)}>
            <div className="field-stack">
              <span className="field-label">{t('public.deposit.phone.lockerLabel')}</span>
              <select
                className={clsx(
                  'form-control',
                  (errors.lockerId || fetchError) && 'form-control--error',
                )}
                {...register('lockerId')}
              >
                <option value="">{t('public.deposit.phone.lockerPlaceholder')}</option>
                {lockerOptions.map((locker) => (
                  <option key={locker.value} value={locker.value}>
                    {locker.label}
                  </option>
                ))}
              </select>
              <div
                className={clsx(
                  'field-support',
                  (errors.lockerId || fetchError) && 'field-error',
                )}
              >
                {fetchError ||
                  errors.lockerId?.message ||
                  (loading
                    ? t('public.deposit.phone.loadingLockers')
                    : lockers.length === 0
                      ? t('public.deposit.phone.lockerEmpty')
                      : ' ')}
              </div>
            </div>

            <Input
              label={t('public.deposit.phone.receiverLabel')}
              placeholder={t('public.deposit.phone.receiverPlaceholder')}
              inputMode="numeric"
              {...register('receiverPhone')}
              error={errors.receiverPhone?.message}
            />
            <Input
              label={t('public.deposit.phone.senderLabel')}
              placeholder={t('public.deposit.phone.senderPlaceholder')}
              inputMode="numeric"
              {...register('senderPhone')}
              error={errors.senderPhone?.message}
            />

            <div className="form-actions stack-actions">
              <Button
                type="submit"
                size="xl"
                fullWidth
                disabled={!isValid || loading || lockers.length === 0}
              >
                {t('public.deposit.phone.submit')}
              </Button>
              <Button
                type="button"
                size="xl"
                variant="outline"
                fullWidth
                onClick={() => navigate('/')}
              >
                {t('public.deposit.phone.cancel')}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </section>
  )
}

export default DepositPhonePage
