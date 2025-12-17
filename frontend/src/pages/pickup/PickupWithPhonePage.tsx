import { useEffect } from 'react'
import axios from 'axios'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Input from '@/components/Input'
import { requestPickupOtp } from '@/services/api'
import { usePickupStore } from '@/store/pickupStore'

const phoneSchema = z
  .string()
  .min(9, 'กรุณากรอกอย่างน้อย 9 หลัก')
  .regex(/^[0-9]+$/, 'กรุณากรอกเฉพาะตัวเลข')

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
          setError('กรุณากรอกเบอร์โทรให้ถูกต้อง')
          break
        case 429:
          setError('ขอ OTP บ่อยเกินไป กรุณารอสักครู่')
          break
        case 500:
        default:
          setError('ระบบขัดข้อง กรุณาลองใหม่')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="flex flex-1 flex-col justify-center gap-6">
      <Card>
        <div className="text-center">
          <h1 className="font-display text-3xl">รับพัสดุด้วยเบอร์โทร</h1>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="เบอร์โทร"
            placeholder="กรอกเบอร์โทร"
            inputMode="numeric"
            {...register('phone')}
            error={errors.phone?.message}
          />
          {errorMessage && (
            <div className="rounded-control border border-danger bg-danger-soft px-4 py-3 text-sm text-danger">
              {errorMessage}
            </div>
          )}
          <Button type="submit" fullWidth disabled={!isValid || isSubmitting}>
            {isSubmitting ? 'กำลังขอ OTP...' : 'ขอ OTP'}
          </Button>
        </form>

        <div className="mt-6">
          <Button variant="secondary" fullWidth onClick={() => navigate('/pickup')}>
            ย้อนกลับ
          </Button>
        </div>
      </Card>
    </section>
  )
}

export default PickupWithPhonePage
