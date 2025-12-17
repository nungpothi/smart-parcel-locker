import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Input from '@/components/Input'
import { usePickupStore } from '@/store/pickupStore'

const phoneSchema = z
  .string()
  .min(9, 'กรุณากรอกอย่างน้อย 9 หลัก')
  .regex(/^[0-9]+$/, 'กรุณากรอกเฉพาะตัวเลข')

const formSchema = z.object({
  phone: phoneSchema,
  pickupCode: z.string().min(4, 'กรุณากรอกรหัสอย่างน้อย 4 ตัว'),
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
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-10">
      <Card>
        <div className="text-center">
          <h1 className="font-display text-3xl">รับพัสดุด้วยรหัส</h1>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="เบอร์โทร"
            placeholder="กรอกเบอร์โทร"
            inputMode="numeric"
            {...register('phone')}
            error={errors.phone?.message}
          />
          <Input
            label="รหัสรับพัสดุ"
            placeholder="กรอกรหัส"
            {...register('pickupCode')}
            error={errors.pickupCode?.message}
          />
          <Button type="submit" fullWidth disabled={!isValid}>
            ยืนยัน
          </Button>
        </form>

        <div className="mt-6">
          <Button variant="secondary" fullWidth onClick={() => navigate('/pickup')}>
            ย้อนกลับ
          </Button>
        </div>
      </Card>
    </main>
  )
}

export default PickupWithCodePage
