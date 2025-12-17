import { useNavigate } from 'react-router-dom'
import Button from '@/components/Button'

const WelcomePage = () => {
  const navigate = useNavigate()

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="w-full max-w-2xl text-center">
        <div className="flex justify-center">
          <div className="inline-flex rounded-full border border-primary/50 bg-white px-2 py-1 text-sm font-semibold">
            <button className="rounded-full bg-primary px-4 py-2">TH</button>
            <button className="rounded-full px-4 py-2 text-text/70">EN</button>
          </div>
        </div>

        <h1 className="mt-10 font-display text-4xl sm:text-5xl">
          Smart Parcel Locker
        </h1>
        <p className="mt-3 text-lg text-text/80">
          บริการฝาก–รับพัสดุอัตโนมัติ
        </p>

        <div className="mt-10 space-y-4">
          <Button fullWidth onClick={() => navigate('/deposit')}>
            ฝากพัสดุ
          </Button>
          <Button variant="secondary" fullWidth onClick={() => navigate('/pickup')}>
            รับพัสดุ
          </Button>
        </div>
      </div>
    </main>
  )
}

export default WelcomePage
