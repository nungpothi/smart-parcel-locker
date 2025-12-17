import { useEffect, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Input from '@/components/Input'
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
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-10">
      <header className="text-center">
        <h1 className="font-display text-4xl">ฝากพัสดุ</h1>
      </header>

      <Card>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <label className="block text-left">
            <span className="text-sm font-semibold">เลือกตู้</span>
            <select
              className="mt-2 w-full rounded-2xl border-2 border-primary/40 bg-white px-4 py-3 text-base focus:border-primary focus:outline-none"
              {...register('lockerId')}
            >
              <option value="">เลือกตู้</option>
              {lockerOptions.map((locker) => (
                <option key={locker.value} value={locker.value}>
                  {locker.label}
                </option>
              ))}
            </select>
          </label>

          {loading && (
            <p className="text-sm text-text/70">กำลังโหลดรายการตู้...</p>
          )}
          {!loading && lockers.length === 0 && (
            <p className="text-sm text-text/70">
              ไม่มีตู้ให้ใช้งาน กรุณาตั้งค่าผ่าน Admin ก่อน
            </p>
          )}
          {fetchError && <p className="text-sm text-red-600">{fetchError}</p>}
          {errors.lockerId?.message && (
            <p className="text-sm text-red-600">{errors.lockerId.message}</p>
          )}

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

          <Button
            type="submit"
            fullWidth
            disabled={!isValid || loading || lockers.length === 0}
          >
            ถัดไป
          </Button>
        </form>
      </Card>
    </main>
  )
}

export default DepositPhonePage
