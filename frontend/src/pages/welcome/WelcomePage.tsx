import { useNavigate } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'
import PageHeader from '@/components/PageHeader'

const WelcomePage = () => {
  const navigate = useNavigate()

  return (
    <section className="flex flex-1 items-center justify-center">
      <Card tone="muted" density="spacious" className="w-full">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-10 text-center">
          <div className="flex items-center gap-3">
            <Button size="md" variant="primary">
              TH
            </Button>
            <Button size="md" variant="outline">
              EN
            </Button>
          </div>

          <div className="flex flex-col items-center gap-4">
            <span className="rounded-pill border border-border/70 bg-surface px-4 py-2 text-sm font-semibold text-text-muted">
              ตู้ฝาก–รับพัสดุอัตโนมัติ
            </span>
            <PageHeader
              title="Smart Parcel Locker"
              subtitle="เลือกบริการที่ต้องการทำรายการ"
              variant="public"
              align="center"
            />
          </div>

          <div className="w-full space-y-4">
            <Button size="xl" fullWidth onClick={() => navigate('/deposit')}>
              ฝากพัสดุ
            </Button>
            <Button
              size="xl"
              variant="secondary"
              fullWidth
              onClick={() => navigate('/pickup')}
            >
              รับพัสดุ
            </Button>
          </div>

          <div className="w-full">
            <Button
              size="md"
              variant="outline"
              fullWidth
              onClick={() => navigate('/admin')}
            >
              สำหรับเจ้าหน้าที่: Admin Setup
            </Button>
          </div>
        </div>
      </Card>
    </section>
  )
}

export default WelcomePage
