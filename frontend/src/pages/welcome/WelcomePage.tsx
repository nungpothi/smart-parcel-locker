import { useNavigate } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'
import PageHeader from '@/components/PageHeader'

const WelcomePage = () => {
  const navigate = useNavigate()

  return (
    <section className="flex flex-1 items-center justify-center">
      <Card tone="muted" density="spacious" className="w-full max-w-3xl">
        <div className="stack-page w-full items-center">
          <div className="flex w-full items-center justify-end gap-3">
            <Button size="md" variant="outline" className="min-w-[68px] px-4">
              TH
            </Button>
            <Button size="md" variant="outline" className="min-w-[68px] px-4">
              EN
            </Button>
          </div>

          <div className="stack-section items-center text-center">
            <span className="eyebrow-chip rounded-pill border border-border/70 bg-surface text-base font-semibold text-text-muted">
              ตู้ฝาก–รับพัสดุอัตโนมัติ
            </span>
            <PageHeader
              title="Smart Parcel Locker"
              subtitle="เลือกบริการที่ต้องการทำรายการ"
              variant="public"
              align="center"
            />
          </div>

          <div className="stack-actions w-full">
            <Button
              size="xl"
              fullWidth
              className="py-5 text-2xl sm:text-3xl"
              onClick={() => navigate('/deposit')}
            >
              ฝากพัสดุ
            </Button>
            <Button
              size="xl"
              variant="secondary"
              fullWidth
              className="py-5 text-2xl sm:text-3xl"
              onClick={() => navigate('/pickup')}
            >
              รับพัสดุ
            </Button>
          </div>

          <div className="section-divider w-full">
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
