import { useNavigate } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'
import PageHeader from '@/components/PageHeader'

const PickupHomePage = () => {
  const navigate = useNavigate()

  return (
    <section className="flex flex-1 flex-col justify-center gap-6">
      <PageHeader
        title="รับพัสดุ"
        subtitle="เลือกรูปแบบการรับพัสดุที่สะดวก"
        variant="public"
      />

      <Card>
        <div className="space-y-4">
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
          <Button variant="secondary" fullWidth onClick={() => navigate('/')}>
            กลับหน้าแรก
          </Button>
        </div>
      </Card>
    </section>
  )
}

export default PickupHomePage
