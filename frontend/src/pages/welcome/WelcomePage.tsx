import { useNavigate } from 'react-router-dom'
import Button from '@/components/Button'

const WelcomePage = () => {
  const navigate = useNavigate()

  return (
    <section className="flex flex-1 flex-col items-center justify-center text-center">
      <div className="inline-flex rounded-pill border border-border/70 bg-surface px-2 py-1 text-sm font-semibold text-text-muted">
        <button className="rounded-pill bg-primary px-4 py-2 text-text">
          TH
        </button>
        <button className="rounded-pill px-4 py-2 text-text-subtle">
          EN
        </button>
      </div>

      <h1 className="mt-10 font-display text-4xl sm:text-5xl">
        Smart Parcel Locker
      </h1>
      <p className="mt-3 text-lg text-text-muted">
        บริการฝาก–รับพัสดุอัตโนมัติ
      </p>

      <div className="mt-10 w-full space-y-4">
        <Button fullWidth onClick={() => navigate('/deposit')}>
          ฝากพัสดุ
        </Button>
        <Button variant="secondary" fullWidth onClick={() => navigate('/pickup')}>
          รับพัสดุ
        </Button>
      </div>

      <div className="mt-8 w-full">
        <Button variant="secondary" fullWidth onClick={() => navigate('/admin')}>
          Admin Setup
        </Button>
      </div>
    </section>
  )
}

export default WelcomePage
