import dayjs from 'dayjs'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Input from '@/components/Input'
import { type PickupParcel, usePickupStore } from '@/store/pickupStore'

const formSchema = z.object({
  otp: z
    .string()
    .length(6, 'กรุณากรอก OTP 6 หลัก')
    .regex(/^[0-9]+$/, 'กรุณากรอกเฉพาะตัวเลข'),
})

type PickupOtpForm = z.infer<typeof formSchema>

const sizeOptions: PickupParcel['size'][] = ['S', 'M', 'L']

const createMockParcels = (): PickupParcel[] => {
  const count = Math.floor(Math.random() * 3) + 1
  const now = dayjs()

  return Array.from({ length: count }, (_, index) => ({
    id: `P-${Date.now()}-${index}`,
    locker: `A-${index + 1}`,
    size: sizeOptions[index % sizeOptions.length],
    depositedAt: now.subtract(index + 1, 'hour').toISOString(),
  }))
}

const PickupOtpVerifyPage = () => {
  const navigate = useNavigate()
  const { setOtp, setPickupToken, setParcels, selectParcel } = usePickupStore()

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

  const onSubmit = (values: PickupOtpForm) => {
    setOtp(values.otp)
    setPickupToken(`TK-${Date.now()}`)
    setParcels(createMockParcels())
    selectParcel(null)
    navigate('/pickup/list')
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-10">
      <Card>
        <div className="text-center">
          <h1 className="font-display text-3xl">ยืนยันรหัส OTP</h1>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="OTP"
            placeholder="กรอก OTP 6 หลัก"
            inputMode="numeric"
            {...register('otp')}
            error={errors.otp?.message}
          />
          <Button type="submit" fullWidth disabled={!isValid}>
            ยืนยัน OTP
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button type="button" className="text-sm font-semibold text-accent">
            ขอ OTP ใหม่
          </button>
        </div>

        <div className="mt-6">
          <Button variant="secondary" fullWidth onClick={() => navigate('/pickup/phone')}>
            ย้อนกลับ
          </Button>
        </div>
      </Card>
    </main>
  )
}

export default PickupOtpVerifyPage
