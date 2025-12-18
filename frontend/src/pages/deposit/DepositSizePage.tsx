import axios from 'axios'
import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'
import PageHeader from '@/components/PageHeader'
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
    <section className="flex flex-1 justify-center">
      <div className="stack-page w-full">
        <PageHeader
          title="เลือกขนาดช่อง"
          subtitle="เลือกขนาดช่องที่ต้องการให้เหมาะสมกับพัสดุ"
          variant="public"
        />

        <Card tone="muted" density="spacious" className="w-full max-w-3xl">
          <div className="stack-section">
            <div className="selection-grid">
              {sizeOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={clsx(
                    'selection-tile',
                    size === option && 'selection-tile--selected',
                  )}
                  onClick={() => setSize(option)}
                  disabled={isSubmitting}
                  aria-pressed={size === option}
                >
                  {option}
                </button>
              ))}
            </div>

            <div
              className={clsx(
                'field-support',
                errorMessage && 'field-error',
              )}
              aria-live="polite"
            >
              {errorMessage ?? ' '}
            </div>

            <div className="selection-actions stack-actions">
              <Button
                fullWidth
                size="xl"
                onClick={handleConfirm}
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? 'กำลังยืนยัน...' : 'ยืนยันขนาด'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}

export default DepositSizePage
