import dayjs from 'dayjs'
import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'
import { usePickupStore } from '@/store/pickupStore'

const PickupParcelListPage = () => {
  const navigate = useNavigate()
  const { parcels, selectedParcelId, selectParcel } = usePickupStore()

  const handleConfirm = () => {
    if (!selectedParcelId) return
    navigate('/pickup/success')
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center gap-6 px-6 py-10">
      <Card>
        <div className="text-center">
          <h1 className="font-display text-3xl">เลือกพัสดุ</h1>
        </div>

        <div className="mt-8 space-y-4">
          {parcels.length === 0 ? (
            <p className="text-center text-base text-text/70">
              ไม่พบพัสดุสำหรับรับ
            </p>
          ) : (
            parcels.map((parcel) => (
              <button
                key={parcel.id}
                type="button"
                onClick={() => selectParcel(parcel.id)}
                className={clsx(
                  'flex w-full flex-col gap-2 rounded-2xl border-2 p-4 text-left transition sm:flex-row sm:items-center sm:justify-between',
                  selectedParcelId === parcel.id
                    ? 'border-accent bg-primary/70'
                    : 'border-primary/40 bg-white',
                )}
              >
                <div>
                  <p className="text-lg font-semibold">ช่อง {parcel.locker}</p>
                  <p className="text-sm text-text/70">
                    ฝากเมื่อ {dayjs(parcel.depositedAt).format('HH:mm น.')}
                  </p>
                </div>
                <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold">
                  ขนาด {parcel.size}
                </span>
              </button>
            ))
          )}
        </div>

        <div className="mt-8 space-y-3">
          <Button fullWidth onClick={handleConfirm} disabled={!selectedParcelId}>
            รับพัสดุ
          </Button>
          <Button variant="secondary" fullWidth onClick={() => navigate('/pickup/otp')}>
            ย้อนกลับ
          </Button>
        </div>
      </Card>
    </main>
  )
}

export default PickupParcelListPage
