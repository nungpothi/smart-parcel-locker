import { useNavigate } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'
import PageHeader from '@/components/PageHeader'
import { useDepositStore } from '@/store/depositStore'

const DepositOpenPage = () => {
  const navigate = useNavigate()
  const { parcelCode, pickupCode } = useDepositStore()

  return (
    <section className="flex flex-1 flex-col justify-center gap-6">
      <PageHeader
        title="ช่องกำลังเปิด"
        subtitle="กรุณาใส่พัสดุและปิดช่องให้เรียบร้อย"
        variant="public"
      />

      <Card>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-pill bg-primary text-3xl">
            🔓
          </div>
          <p className="text-base text-text-muted">
            นำพัสดุวางในช่องให้เรียบร้อยแล้วปิดประตู
          </p>
        </div>

        <div className="mt-6 rounded-control border border-border bg-surface/80 p-4 text-left">
          <p className="text-sm text-text-subtle">รหัสพัสดุ</p>
          <p className="text-xl font-semibold text-text">
            {parcelCode ?? '-'}
          </p>
          <p className="mt-4 text-sm text-text-subtle">รหัสรับพัสดุ</p>
          <p className="text-xl font-semibold text-text">
            {pickupCode ?? 'ไม่มี'}
          </p>
        </div>

        <div className="mt-8">
          <Button fullWidth onClick={() => navigate('/deposit/success')}>
            ใส่พัสดุเรียบร้อยแล้ว
          </Button>
        </div>
      </Card>
    </section>
  )
}

export default DepositOpenPage
