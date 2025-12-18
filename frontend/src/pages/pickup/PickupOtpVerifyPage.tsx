import { useEffect } from 'react'
import axios from 'axios'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Input from '@/components/Input'
import PageHeader from '@/components/PageHeader'
import { requestPickupOtp, verifyPickupOtp } from '@/services/api'
import { usePickupStore } from '@/store/pickupStore'

const formSchema = z.object({
  otp: z
    .string()
    .length(6, 'กรุณากรอก OTP 6 หลัก')
    .regex(/^[0-9]+$/, 'กรุณากรอกเฉพาะตัวเลข'),
})

type PickupOtpForm = z.infer<typeof formSchema>

const PickupOtpVerifyPage = () => {
  const navigate = useNavigate()
  const {
    phone,
    otpRef,
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
  } = useForm<PickupOtpForm>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      otp: '',
    },
  })

  useEffect(() => {
    setError(null)
    if (!phone) {
      navigate('/pickup/phone')
    }
  }, [navigate, phone, setError])

  const onSubmit = async (values: PickupOtpForm) => {
    if (!phone || !otpRef) {
      setError('กรุณาขอ OTP ใหม่อีกครั้ง')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const response = await verifyPickupOtp(phone, otpRef, values.otp)
      const payload = response.data?.data
      if (!payload?.pickup_token) {
        throw new Error('missing pickup_token')
      }
      setOtpCode(values.otp)
      setPickupToken(payload.pickup_token, payload.expires_at ?? null)
      navigate('/pickup/list')
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined
      switch (status) {
        case 400:
          setError('OTP ไม่ถูกต้อง')
          break
        case 404:
          setError('ไม่พบ OTP')
          break
        case 409:
          setError('OTP ถูกใช้งานแล้ว')
          break
        case 410:
          setError('OTP หมดอายุ กรุณาขอใหม่')
          break
        case 500:
        default:
          setError('ระบบขัดข้อง กรุณาลองใหม่')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (!phone) {
      setError('กรุณากลับไปกรอกเบอร์โทรใหม่')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const response = await requestPickupOtp(phone)
      const payload = response.data?.data
      if (!payload?.otp_ref) {
        throw new Error('missing otp_ref')
      }
      setOtpRef(payload.otp_ref)
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
      <PageHeader
        title="ยืนยันรหัส OTP"
        subtitle="กรอก OTP ที่ได้รับทางโทรศัพท์"
        variant="public"
      />

      <Card>
        <p className="text-center text-sm text-text-subtle">
          OTP ถูกส่งไปแล้ว
        </p>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="OTP"
            placeholder="กรอก OTP 6 หลัก"
            inputMode="numeric"
            {...register('otp')}
            error={errors.otp?.message}
          />
          {errorMessage && (
            <div className="rounded-control border border-danger bg-danger-soft px-4 py-3 text-sm text-danger">
              {errorMessage}
            </div>
          )}
          <Button type="submit" fullWidth disabled={!isValid || isSubmitting}>
            {isSubmitting ? 'กำลังยืนยัน...' : 'ยืนยัน OTP'}
          </Button>
        </form>

        <div className="mt-6 flex flex-col items-center">
          <Button
            type="button"
            variant="outline"
            size="md"
            className="w-full sm:w-auto"
            onClick={handleResend}
            disabled={isSubmitting}
          >
            ขอ OTP ใหม่
          </Button>
        </div>

        <div className="mt-6">
          <Button variant="secondary" fullWidth onClick={() => navigate('/pickup/phone')}>
            ย้อนกลับ
          </Button>
        </div>
      </Card>
    </section>
  )
}

export default PickupOtpVerifyPage
