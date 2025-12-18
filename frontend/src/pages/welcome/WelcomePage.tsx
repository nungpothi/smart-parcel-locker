import { useNavigate } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'
import PageHeader from '@/components/PageHeader'

const WelcomePage = () => {
  const navigate = useNavigate()

  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
      <PageHeader
        title="Smart Parcel Locker"
        subtitle="บริการฝาก–รับพัสดุอัตโนมัติ"
        variant="public"
      />

      <Card className="w-full text-center">
        <div className="flex justify-center gap-3">
          <Button size="md" variant="primary">
            TH
          </Button>
          <Button size="md" variant="outline">
            EN
          </Button>
        </div>

        <div className="mt-10 w-full space-y-4">
          <Button fullWidth onClick={() => navigate('/deposit')}>
            ฝากพัสดุ
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => navigate('/pickup')}
          >
            รับพัสดุ
          </Button>
        </div>

        <div className="mt-8 w-full">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => navigate('/admin')}
          >
            Admin Setup
          </Button>
        </div>
      </Card>
    </section>
  )
}

export default WelcomePage
