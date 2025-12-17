import { useCallback, useEffect } from 'react'
import axios from 'axios'
import dayjs from 'dayjs'
import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'
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
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center gap-6 px-6 py-10">
      <Card>
        <div className="text-center">
          <h1 className="font-display text-3xl">เลือกพัสดุ</h1>
        </div>

        <div className="mt-8 space-y-4">
          {isLoadingParcels && (
            <p className="text-center text-base text-text/70">กำลังโหลด...</p>
          )}
          {errorMessage && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}
          {!isLoadingParcels && parcels.length === 0 && !errorMessage ? (
            <p className="text-center text-base text-text/70">
              ไม่พบพัสดุสำหรับรับ
            </p>
          ) : (
            parcels.map((parcel) => (
              <button
                key={parcel.parcel_id}
                type="button"
                onClick={() => selectParcel(parcel.parcel_id)}
                className={clsx(
                  'flex w-full flex-col gap-2 rounded-2xl border-2 p-4 text-left transition sm:flex-row sm:items-center sm:justify-between',
                  selectedParcelId === parcel.parcel_id
                    ? 'border-accent bg-primary/70'
                    : 'border-primary/40 bg-white',
                )}
              >
                <div>
                  <p className="text-lg font-semibold">{parcel.parcel_code}</p>
                  {parcel.expires_at && (
                    <p className="text-sm text-text/70">
                      หมดอายุ {dayjs(parcel.expires_at).format('DD/MM/YYYY HH:mm')}
                    </p>
                  )}
                </div>
                <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold">
                  ขนาด {parcel.size}
                </span>
              </button>
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
    </main>
  )
}

export default PickupParcelListPage
