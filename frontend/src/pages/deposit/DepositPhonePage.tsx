import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Input from '@/components/Input'
import { useDepositStore } from '@/store/depositStore'

const phoneSchema = z
  .string()
  .min(9, 'กรุณากรอกอย่างน้อย 9 หลัก')
  .regex(/^[0-9]+$/, 'กรุณากรอกเฉพาะตัวเลข')

const formSchema = z.object({
  receiverPhone: phoneSchema,
  senderPhone: phoneSchema,
})

type DepositPhoneForm = z.infer<typeof formSchema>

const DepositPhonePage = () => {
  const navigate = useNavigate()
  const { receiverPhone, senderPhone, setReceiverPhone, setSenderPhone } =
    useDepositStore()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<DepositPhoneForm>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      receiverPhone,
      senderPhone,
    },
  })

  const onSubmit = (values: DepositPhoneForm) => {
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
          <Button type="submit" fullWidth disabled={!isValid}>
            ถัดไป
          </Button>
        </form>
      </Card>
    </main>
  )
}

export default DepositPhonePage
