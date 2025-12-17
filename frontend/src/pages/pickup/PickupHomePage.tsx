import { useNavigate } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'

const PickupHomePage = () => {
  const navigate = useNavigate()

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-10">
      <Card>
        <div className="text-center">
          <h1 className="font-display text-4xl">รับพัสดุ</h1>
        </div>

        <div className="mt-8 space-y-4">
          <Button fullWidth onClick={() => navigate('/pickup/code')}>
            มีรหัสรับพัสดุ
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => navigate('/pickup/phone')}
          >
            ไม่มีรหัส (ใช้เบอร์โทร)
          </Button>
        </div>

        <div className="mt-6">
          <Button variant="secondary" fullWidth onClick={() => navigate('/')}
          >
            กลับหน้าแรก
          </Button>
        </div>
      </Card>
    </main>
  )
}

export default PickupHomePage
