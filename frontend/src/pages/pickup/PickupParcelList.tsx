import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'
import { usePickupStore } from '@/store/pickupStore'

const PickupParcelList = () => {
  const navigate = useNavigate()
  const { parcels } = usePickupStore()

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center gap-6 px-6 py-10">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-accent">
          Parcel List
        </p>
        <h1 className="mt-3 font-display text-4xl">Available Parcels</h1>
        <p className="mt-2 text-base text-text/80">
          Review the parcels ready for pickup.
        </p>
      </header>

      <Card>
        {parcels.length === 0 ? (
          <p className="text-base text-text/70">
            No parcels to show yet. This is a placeholder list.
          </p>
        ) : (
          <ul className="space-y-4">
            {parcels.map((parcel) => (
              <li
                key={parcel.id}
                className="rounded-2xl border border-primary/30 bg-white/80 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold">Locker {parcel.locker}</p>
                    <p className="text-sm text-text/70">
                      Ready {dayjs(parcel.readyAt).format('MMM D, h:mm A')}
                    </p>
                  </div>
                  <span className="rounded-full bg-primary px-4 py-2 text-sm font-semibold">
                    {parcel.size}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="space-y-3">
        <Button fullWidth onClick={() => navigate('/pickup/success')}>
          Confirm Pickup
        </Button>
        <Button variant="secondary" fullWidth onClick={() => navigate('/pickup')}>
          Back to Pickup Options
        </Button>
      </div>
    </main>
  )
}

export default PickupParcelList
