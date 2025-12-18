import { useCallback, useEffect } from 'react'
import axios from 'axios'
import dayjs from 'dayjs'
import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'
import PageHeader from '@/components/PageHeader'
import { confirmPickup, fetchPickupParcels } from '@/services/api'
import { usePickupStore } from '@/store/pickupStore'

const PickupParcelListPage = () => {
  const navigate = useNavigate()
  const {
    pickupToken,
    parcels,
    selectedParcelId,
    isLoadingParcels,
    isConfirming,
    errorMessage,
    setParcels,
    selectParcel,
    setLoadingParcels,
    setConfirming,
    setError,
    setPickupToken,
  } = usePickupStore()

  const loadParcels = useCallback(async () => {
    if (!pickupToken) return
    setLoadingParcels(true)
    setError(null)
    try {
      const response = await fetchPickupParcels(pickupToken)
      setParcels(response.data?.data ?? [])
      selectParcel(null)
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined
      switch (status) {
        case 401:
          setError('token ไม่ถูกต้อง กรุณายืนยัน OTP ใหม่')
          setPickupToken(null, null)
          navigate('/pickup/otp')
          break
        case 410:
          setError('token หมดอายุ กรุณายืนยัน OTP ใหม่')
          setPickupToken(null, null)
          navigate('/pickup/otp')
          break
        case 500:
        default:
          setError('ระบบขัดข้อง กรุณาลองใหม่')
      }
    } finally {
      setLoadingParcels(false)
    }
  }, [
    navigate,
    pickupToken,
    selectParcel,
    setError,
    setLoadingParcels,
    setParcels,
    setPickupToken,
  ])

  useEffect(() => {
    if (!pickupToken) {
      navigate('/pickup/phone')
      return
    }
    void loadParcels()
  }, [loadParcels, navigate, pickupToken])

  const handleConfirm = async () => {
    if (!pickupToken || !selectedParcelId) return
    setConfirming(true)
    setError(null)
    try {
      await confirmPickup(pickupToken, selectedParcelId)
      navigate('/pickup/success')
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined
      switch (status) {
        case 400:
          setError('ข้อมูลไม่ถูกต้อง')
          break
        case 401:
          setError('token ไม่ถูกต้อง กรุณายืนยัน OTP ใหม่')
          setPickupToken(null, null)
          navigate('/pickup/otp')
          break
        case 403:
          setError('คุณไม่มีสิทธิ์รับพัสดุนี้')
          break
        case 404:
          setError('ไม่พบพัสดุ')
          break
        case 409:
          setError('พัสดุถูกนำออกไปแล้ว หรือสถานะไม่ถูกต้อง')
          break
        case 410:
          setError('token หมดอายุ กรุณายืนยัน OTP ใหม่')
          setPickupToken(null, null)
          navigate('/pickup/otp')
          break
        case 500:
        default:
          setError('ระบบขัดข้อง กรุณาลองใหม่')
      }
    } finally {
      setConfirming(false)
    }
  }

  return (
    <section className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="เลือกพัสดุ"
        subtitle="เลือกพัสดุที่ต้องการเปิดรับ"
        variant="public"
      />

      <Card>
        <div className="space-y-4">
          {isLoadingParcels && (
            <p className="text-center text-base text-text-muted">
              กำลังโหลด...
            </p>
          )}
          {errorMessage && (
            <div className="rounded-control border border-danger bg-danger-soft px-4 py-3 text-sm text-danger">
              {errorMessage}
            </div>
          )}
          {!isLoadingParcels && parcels.length === 0 && !errorMessage ? (
            <p className="text-center text-base text-text-muted">
              ไม่พบพัสดุสำหรับรับ
            </p>
          ) : (
            parcels.map((parcel) => (
              <Button
                key={parcel.parcel_id}
                type="button"
                onClick={() => selectParcel(parcel.parcel_id)}
                variant={selectedParcelId === parcel.parcel_id ? 'primary' : 'outline'}
                size="lg"
                className={clsx(
                  'w-full justify-between rounded-control p-4 text-left sm:flex-row sm:items-center',
                  selectedParcelId !== parcel.parcel_id && 'text-text',
                  'flex-col sm:flex-row sm:gap-3',
                )}
              >
                <div>
                  <p className="text-lg font-semibold">{parcel.parcel_code}</p>
                  {parcel.expires_at && (
                    <p className="text-sm text-text-subtle">
                      หมดอายุ {dayjs(parcel.expires_at).format('DD/MM/YYYY HH:mm')}
                    </p>
                  )}
                </div>
                <span className="rounded-pill bg-secondary px-4 py-2 text-sm font-semibold text-text">
                  ขนาด {parcel.size}
                </span>
              </Button>
            ))
          )}
        </div>

        <div className="mt-8 space-y-3">
          {!isLoadingParcels && parcels.length === 0 && !errorMessage ? (
            <Button fullWidth onClick={() => navigate('/')}>
              กลับหน้าแรก
            </Button>
          ) : (
            <>
              <Button
                fullWidth
                onClick={handleConfirm}
                disabled={!selectedParcelId || isConfirming || isLoadingParcels}
              >
                {isConfirming ? 'กำลังดำเนินการ...' : 'รับพัสดุ'}
              </Button>
              {errorMessage && (
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={loadParcels}
                  disabled={isLoadingParcels}
                >
                  ลองใหม่
                </Button>
              )}
            </>
          )}
          <Button
            variant="secondary"
            fullWidth
            onClick={() => navigate('/pickup/otp')}
            disabled={isConfirming}
          >
            ย้อนกลับ
          </Button>
        </div>
      </Card>
    </section>
  )
}

export default PickupParcelListPage
