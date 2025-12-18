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
import { fetchAvailableLockers, type AvailableLocker } from '@/services/api'
import { useDepositStore } from '@/store/depositStore'

const phoneSchema = z
  .string()
  .min(9, 'กรุณากรอกอย่างน้อย 9 หลัก')
  .regex(/^[0-9]+$/, 'กรุณากรอกเฉพาะตัวเลข')

const formSchema = z.object({
  lockerId: z.string().min(1, 'กรุณาเลือกตู้'),
  receiverPhone: phoneSchema,
  senderPhone: phoneSchema,
})

type DepositPhoneForm = z.infer<typeof formSchema>

const DepositPhonePage = () => {
  const navigate = useNavigate()
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
        label: `${locker.locker_code} • ${locker.location_name}`,
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
        setFetchError('โหลดรายการตู้ไม่สำเร็จ')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

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
    <section className="flex flex-1 justify-center">
      <div className="stack-page w-full">
        <PageHeader
          title="ฝากพัสดุ"
          subtitle="เลือกตู้และกรอกข้อมูลติดต่อ"
          variant="public"
        />

        <Card tone="muted" density="spacious" className="w-full max-w-3xl">
          <form className="form-shell" onSubmit={handleSubmit(onSubmit)}>
            <div className="field-stack">
              <span className="field-label">เลือกตู้</span>
              <select
                className={clsx(
                  'form-control',
                  (errors.lockerId || fetchError) && 'form-control--error',
                )}
                {...register('lockerId')}
              >
                <option value="">เลือกตู้</option>
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
                    ? 'กำลังโหลดรายการตู้...'
                    : lockers.length === 0
                      ? 'ไม่มีตู้ให้ใช้งาน กรุณาตั้งค่าผ่าน Admin ก่อน'
                      : ' ')}
              </div>
            </div>

            <Input
              label="เบอร์ผู้รับ"
              placeholder="กรอกเบอร์ผู้รับ"
              inputMode="numeric"
              {...register('receiverPhone')}
              error={errors.receiverPhone?.message}
            />
            <Input
              label="เบอร์ผู้ส่ง"
              placeholder="กรอกเบอร์ผู้ส่ง"
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
                ถัดไป
              </Button>
              <Button
                type="button"
                size="xl"
                variant="outline"
                fullWidth
                onClick={() => navigate('/')}
              >
                ย้อนกลับ
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </section>
  )
}

export default DepositPhonePage
