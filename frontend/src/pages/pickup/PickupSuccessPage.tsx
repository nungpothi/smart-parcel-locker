import { useNavigate } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'
import PageHeader from '@/components/PageHeader'
import { usePickupStore } from '@/store/pickupStore'

const PickupSuccessPage = () => {
  const navigate = useNavigate()
  const { parcels, selectedParcelId, resetPickup } = usePickupStore()
  const selectedParcel = parcels.find(
    (parcel) => parcel.parcel_id === selectedParcelId,
  )

  const handleBack = () => {
    resetPickup()
    navigate('/')
  }

  return (
    <section className="flex flex-1 flex-col justify-center gap-6">
      <PageHeader
        title="รับพัสดุเรียบร้อย"
        subtitle="ช่องได้ถูกเปิดแล้ว กรุณารับพัสดุออกจากตู้"
        variant="public"
      />

      <Card>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-pill bg-primary text-3xl">
            ✅
          </div>
          <p className="text-base text-text-muted">
            ขอบคุณที่ใช้บริการ Smart Parcel Locker
          </p>
        </div>

        {selectedParcel && (
          <div className="mt-6 rounded-control border border-border bg-surface/80 p-4 text-left">
            <p className="text-sm text-text-subtle">รหัสพัสดุ</p>
            <p className="text-xl font-semibold text-text">
              {selectedParcel.parcel_code}
            </p>
          </div>
        )}

        <div className="mt-8">
          <Button fullWidth onClick={handleBack}>
            กลับหน้าแรก
          </Button>
        </div>
      </Card>
    </section>
  )
}

export default PickupSuccessPage
