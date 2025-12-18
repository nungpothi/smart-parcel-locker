import { useNavigate } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'
import PageHeader from '@/components/PageHeader'
import { useDepositStore } from '@/store/depositStore'

const DepositOpenPage = () => {
  const navigate = useNavigate()
  const { parcelCode, pickupCode } = useDepositStore()

  return (
    <section className="flex flex-1 justify-center">
      <div className="stack-page w-full">
        <PageHeader
          title="ช่องกำลังเปิด"
          subtitle="กรุณาใส่พัสดุและปิดช่องให้เรียบร้อย"
          variant="public"
        />

        <Card tone="muted" density="spacious" className="w-full max-w-3xl">
          <div className="stack-section items-center text-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-panel bg-surface text-4xl shadow-panel">
              🔓
            </div>
            <div className="stack-section">
              <p className="text-2xl font-semibold text-text">
                ช่องล็อกเกอร์เปิดอยู่
              </p>
              <p className="text-lg text-text-muted">
                กรุณาวางพัสดุลงในช่อง แล้วปิดประตูให้แน่นหนา
              </p>
            </div>
          </div>

          <div className="stack-section">
            <div className="rounded-panel border border-border/70 bg-surface px-5 py-4">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-text-subtle">
                รหัสพัสดุ
              </p>
              <p className="mt-2 text-2xl font-semibold text-text">
                {parcelCode ?? '-'}
              </p>
              <div className="mt-4">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-text-subtle">
                  รหัสรับพัสดุ
                </p>
                <p className="mt-2 text-2xl font-semibold text-text">
                  {pickupCode ?? 'ไม่มี'}
                </p>
              </div>
            </div>

            <div className="stack-actions selection-actions">
              <Button
                fullWidth
                size="xl"
                onClick={() => navigate('/deposit/success')}
              >
                ใส่พัสดุเรียบร้อยแล้ว
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}

export default DepositOpenPage
