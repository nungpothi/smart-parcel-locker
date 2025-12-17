import axios from 'axios'
import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'
import { depositParcel } from '@/services/api'
import { type DepositSize, useDepositStore } from '@/store/depositStore'

const sizeOptions: DepositSize[] = ['S', 'M', 'L']

const DepositSizePage = () => {
  const navigate = useNavigate()
  const {
    size,
    lockerId,
    receiverPhone,
    senderPhone,
    isSubmitting,
    errorMessage,
    setSize,
    setDepositResult,
    setSubmitting,
    setError,
  } = useDepositStore()
  const canSubmit = Boolean(size && lockerId && receiverPhone && senderPhone)

  const handleConfirm = async () => {
    if (!size || !lockerId || !receiverPhone || !senderPhone) {
      setError('กรุณากรอกข้อมูลให้ครบก่อนยืนยัน')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const response = await depositParcel({
        locker_id: lockerId,
        size,
        receiver_phone: receiverPhone,
        sender_phone: senderPhone,
      })
      const payload = response.data?.data
      if (!payload) {
        throw new Error('missing response data')
      }
      setDepositResult(
        payload.parcel_id,
        payload.parcel_code,
        payload.pickup_code ?? null,
        payload.status,
      )
      navigate('/deposit/open')
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined
      switch (status) {
        case 400:
          setError('ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง')
          break
        case 404:
          setError('ไม่พบตู้ กรุณาเลือกใหม่')
          break
        case 409:
          setError('ตู้ไม่พร้อมใช้งาน หรือไม่มีช่องว่างในขนาดที่เลือก')
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
      <header className="text-center">
        <h1 className="font-display text-4xl">เลือกขนาดช่อง</h1>
      </header>

      <Card>
        <div className="grid gap-4 sm:grid-cols-3">
          {sizeOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setSize(option)}
              disabled={isSubmitting}
              className={clsx(
                'flex h-28 items-center justify-center rounded-panel border-2 text-2xl font-semibold transition',
                size === option
                  ? 'border-primary-strong bg-primary text-text shadow-lift'
                  : 'border-border bg-surface text-text-muted',
                isSubmitting && 'cursor-not-allowed opacity-60',
              )}
            >
              {option}
            </button>
          ))}
        </div>

        {errorMessage && (
          <div className="mt-6 rounded-control border border-danger bg-danger-soft px-4 py-3 text-sm text-danger">
            {errorMessage}
          </div>
        )}

        <div className="mt-8">
          <Button
            fullWidth
            onClick={handleConfirm}
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? 'กำลังยืนยัน...' : 'ยืนยันขนาด'}
          </Button>
        </div>
      </Card>
    </section>
  )
}

export default DepositSizePage
