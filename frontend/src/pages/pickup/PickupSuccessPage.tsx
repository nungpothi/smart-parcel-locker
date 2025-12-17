import { useNavigate } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'
import { usePickupStore } from '@/store/pickupStore'

const PickupSuccessPage = () => {
  const navigate = useNavigate()
  const { resetPickup } = usePickupStore()

  const handleBack = () => {
    resetPickup()
    navigate('/')
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-10">
      <Card>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-3xl">
            ✅
          </div>
          <h1 className="font-display text-3xl">รับพัสดุเรียบร้อย</h1>
        </div>

        <div className="mt-8">
          <Button fullWidth onClick={handleBack}>
            กลับหน้าแรก
          </Button>
        </div>
      </Card>
    </main>
  )
}

export default PickupSuccessPage
